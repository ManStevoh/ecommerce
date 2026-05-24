import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@nexora/shared-types';
import {
  IPaymentProviderAdapter,
  InitiatePaymentInput,
  InitiatePaymentResult,
  WebhookVerifyInput,
} from '../interfaces/payment-provider.interface';
import { PayPalClient } from '../paypal.client';

@Injectable()
export class PayPalAdapter implements IPaymentProviderAdapter {
  readonly provider = PaymentProvider.PAYPAL;

  constructor(
    private readonly paypal: PayPalClient,
    private readonly config: ConfigService,
  ) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!this.paypal.isConfigured) {
      return {
        provider: this.provider,
        externalReference: `paypal_order_stub_${input.orderId}`,
        status: 'REQUIRES_ACTION',
        redirectUrl: `https://www.paypal.com/checkoutnow?stub=${input.orderId}`,
        raw: { stub: true, message: 'Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET' },
      };
    }

    const reference = `nexora_${input.orderId}`;
    const order = await this.paypal.createOrder({
      amount: input.amount,
      currency: input.currency,
      reference,
      returnUrl: this.config.get('PAYPAL_RETURN_URL'),
      cancelUrl: this.config.get('PAYPAL_CANCEL_URL'),
    });

    return {
      provider: this.provider,
      externalReference: order.id,
      status: 'REQUIRES_ACTION',
      redirectUrl: order.approvalUrl,
      raw: order,
    };
  }

  verifyWebhook(input: WebhookVerifyInput): boolean {
    if (!this.paypal.isConfigured) return true;
    const webhookId = this.config.get<string>('PAYPAL_WEBHOOK_ID');
    if (!webhookId) return true;
    return Boolean(input.signature);
  }

  async handleWebhook(payload: unknown, _tenantId: string) {
    const event = payload as {
      event_type?: string;
      resource?: { id?: string; status?: string; supplementary_data?: { related_ids?: { order_id?: string } } };
    };

    let paymentStatus: 'COMPLETED' | 'FAILED' | 'PENDING' | undefined;
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      paymentStatus = 'COMPLETED';
    }
    if (
      event.event_type === 'PAYMENT.CAPTURE.DENIED' ||
      event.event_type === 'PAYMENT.CAPTURE.DECLINED'
    ) {
      paymentStatus = 'FAILED';
    }

    const paymentId =
      event.resource?.supplementary_data?.related_ids?.order_id ??
      event.resource?.id;

    return {
      event: event.event_type ?? 'unknown',
      paymentId,
      paymentStatus,
    };
  }
}
