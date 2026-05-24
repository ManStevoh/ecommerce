import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@nexora/shared-types';
import {
  IPaymentProviderAdapter,
  InitiatePaymentInput,
  InitiatePaymentResult,
  WebhookVerifyInput,
} from '../interfaces/payment-provider.interface';
import { FlutterwaveClient } from '../flutterwave.client';

@Injectable()
export class FlutterwaveAdapter implements IPaymentProviderAdapter {
  readonly provider = PaymentProvider.FLUTTERWAVE;

  constructor(
    private readonly flutterwave: FlutterwaveClient,
    private readonly config: ConfigService,
  ) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!this.flutterwave.isConfigured) {
      return {
        provider: this.provider,
        externalReference: `flw_stub_${input.orderId}`,
        status: 'PENDING',
        redirectUrl: `https://checkout.flutterwave.com/stub/${input.orderId}`,
        raw: { stub: true, message: 'Set FLUTTERWAVE_SECRET_KEY for live payments' },
      };
    }

    const email = (input.metadata?.email as string) ?? 'customer@nexora.local';
    const txRef = `nexora_${input.orderId}_${Date.now()}`;

    const payment = await this.flutterwave.createPaymentLink({
      email,
      amount: input.amount,
      currency: input.currency,
      txRef,
      redirectUrl: this.config.get('FLUTTERWAVE_REDIRECT_URL'),
      meta: { orderId: input.orderId, tenantId: input.tenantId },
    });

    return {
      provider: this.provider,
      externalReference: txRef,
      status: 'REQUIRES_ACTION',
      redirectUrl: payment.link,
      raw: payment,
    };
  }

  verifyWebhook(input: WebhookVerifyInput): boolean {
    return this.flutterwave.verifyWebhookHash(input.signature);
  }

  async handleWebhook(payload: unknown, _tenantId: string) {
    const event = payload as {
      event?: string;
      data?: { tx_ref?: string; status?: string };
    };

    let paymentStatus: 'COMPLETED' | 'FAILED' | 'PENDING' | undefined;
    const status = event.data?.status?.toLowerCase();
    if (event.event === 'charge.completed' && status === 'successful') {
      paymentStatus = 'COMPLETED';
    }
    if (status === 'failed' || status === 'cancelled') {
      paymentStatus = 'FAILED';
    }

    return {
      event: event.event ?? 'unknown',
      paymentId: event.data?.tx_ref,
      paymentStatus,
    };
  }
}
