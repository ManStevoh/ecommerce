import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@nexora/shared-types';
import {
  IPaymentProviderAdapter,
  InitiatePaymentInput,
  InitiatePaymentResult,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class MpesaC2bAdapter implements IPaymentProviderAdapter {
  readonly provider = PaymentProvider.MPESA_C2B;

  constructor(private readonly config: ConfigService) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const billRef = `C2B-${input.tenantId.slice(0, 4)}-${input.orderId.slice(0, 8)}`.toUpperCase();
    return {
      provider: this.provider,
      externalReference: billRef,
      status: 'PENDING',
      raw: {
        message: 'Customer pays via Paybill using this account reference',
        paybill: this.config.get('MPESA_SHORTCODE') ?? '000000',
        accountReference: billRef,
        amount: input.amount,
        currency: input.currency,
      },
    };
  }

  async handleWebhook(payload: unknown) {
    const body = payload as {
      TransID?: string;
      BillRefNumber?: string;
      TransAmount?: string;
      TransTime?: string;
    };
    return {
      event: 'mpesa.c2b.received',
      paymentId: body.BillRefNumber ?? body.TransID,
      paymentStatus: body.TransID ? ('COMPLETED' as const) : undefined,
    };
  }
}
