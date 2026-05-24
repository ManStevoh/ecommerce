import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '@nexora/shared-types';
import {
  IPaymentProviderAdapter,
  InitiatePaymentInput,
  InitiatePaymentResult,
  WebhookVerifyInput,
} from '../interfaces/payment-provider.interface';
import { PaystackClient } from '../paystack.client';

@Injectable()
export class PaystackAdapter implements IPaymentProviderAdapter {
  readonly provider = PaymentProvider.PAYSTACK;

  constructor(private readonly paystack: PaystackClient) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!this.paystack.isConfigured) {
      return {
        provider: this.provider,
        externalReference: `paystack_stub_${input.orderId}`,
        status: 'PENDING',
        redirectUrl: `https://checkout.paystack.com/stub/${input.orderId}`,
        raw: { stub: true, message: 'Set PAYSTACK_SECRET_KEY for live payments' },
      };
    }

    const email = (input.metadata?.email as string) ?? 'customer@nexora.local';
    const reference = `nexora_${input.orderId}_${Date.now()}`;

    const tx = await this.paystack.initializeTransaction({
      email,
      amount: input.amount,
      currency: input.currency,
      reference,
      metadata: {
        orderId: input.orderId,
        tenantId: input.tenantId,
      },
    });

    return {
      provider: this.provider,
      externalReference: tx.reference,
      status: 'REQUIRES_ACTION',
      redirectUrl: tx.authorization_url,
      raw: tx,
    };
  }

  verifyWebhook(input: WebhookVerifyInput): boolean {
    return this.paystack.verifyWebhookSignature(
      typeof input.rawBody === 'string' ? input.rawBody : input.rawBody.toString(),
      input.signature,
    );
  }

  async handleWebhook(payload: unknown, _tenantId: string) {
    const event = payload as {
      event?: string;
      data?: { reference?: string; status?: string };
    };

    let paymentStatus: 'COMPLETED' | 'FAILED' | 'PENDING' | undefined;
    if (event.event === 'charge.success') paymentStatus = 'COMPLETED';
    if (event.event === 'charge.failed') paymentStatus = 'FAILED';

    return {
      event: event.event ?? 'unknown',
      paymentId: event.data?.reference,
      paymentStatus,
    };
  }
}
