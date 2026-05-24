import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '@nexora/shared-types';
import {
  IPaymentProviderAdapter,
  InitiatePaymentInput,
  InitiatePaymentResult,
  WebhookVerifyInput,
} from '../interfaces/payment-provider.interface';
import { StripeClient } from '../stripe.client';

@Injectable()
export class StripeAdapter implements IPaymentProviderAdapter {
  readonly provider = PaymentProvider.STRIPE;

  constructor(private readonly stripe: StripeClient) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!this.stripe.isConfigured) {
      return {
        provider: this.provider,
        externalReference: `pi_stub_${input.orderId}`,
        status: 'REQUIRES_ACTION',
        clientSecret: 'pi_stub_secret',
        raw: { stub: true, message: 'Set STRIPE_SECRET_KEY for live payments' },
      };
    }

    const intent = await this.stripe.createPaymentIntent({
      amount: input.amount,
      currency: input.currency,
      orderId: input.orderId,
      tenantId: input.tenantId,
    });

    return {
      provider: this.provider,
      externalReference: intent.id,
      status: intent.status === 'succeeded' ? 'SUCCEEDED' : 'REQUIRES_ACTION',
      clientSecret: intent.client_secret,
      raw: intent,
    };
  }

  verifyWebhook(input: WebhookVerifyInput): boolean {
    if (!this.stripe.isConfigured) return true;
    return this.stripe.verifyWebhookSignature(
      typeof input.rawBody === 'string' ? input.rawBody : input.rawBody.toString(),
      input.signature,
    );
  }

  async handleWebhook(payload: unknown, _tenantId: string) {
    const event = payload as {
      type?: string;
      data?: { object?: { id?: string; status?: string } };
    };

    let paymentStatus: 'COMPLETED' | 'FAILED' | 'PENDING' | undefined;
    if (event.type === 'payment_intent.succeeded') paymentStatus = 'COMPLETED';
    if (event.type === 'payment_intent.payment_failed') paymentStatus = 'FAILED';

    return {
      event: event.type ?? 'unknown',
      paymentId: event.data?.object?.id,
      paymentStatus,
    };
  }
}
