import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '@nexora/shared-types';
import {
  IPaymentProviderAdapter,
  InitiatePaymentInput,
  InitiatePaymentResult,
} from '../interfaces/payment-provider.interface';
import { DarajaClient } from '../daraja.client';

@Injectable()
export class MpesaB2cAdapter implements IPaymentProviderAdapter {
  readonly provider = PaymentProvider.MPESA_B2C;

  constructor(private readonly daraja: DarajaClient) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const phone = (input.metadata?.phoneNumber as string) ?? '';
    const reference = `B2C-${input.orderId.slice(0, 8)}`;

    if (!this.daraja.isConfigured || !phone) {
      return {
        provider: this.provider,
        externalReference: reference,
        status: 'PENDING',
        raw: {
          stub: true,
          message: 'Configure MPESA_* and phoneNumber for B2C payouts',
          phoneNumber: phone,
          amount: input.amount,
        },
      };
    }

    const result = await this.daraja.b2cPayment({
      phoneNumber: phone,
      amount: input.amount,
      remarks: (input.metadata?.remarks as string) ?? 'Nexora payout',
      occasion: reference,
    });

    return {
      provider: this.provider,
      externalReference: result.ConversationID ?? reference,
      status: result.ResponseCode === '0' ? 'PENDING' : 'FAILED',
      raw: result,
    };
  }

  verifyWebhook(): boolean {
    return true;
  }

  async handleWebhook(payload: unknown) {
    const body = payload as {
      Result?: { ResultCode?: number; ConversationID?: string };
    };
    const result = body.Result;
    if (!result) return { event: 'mpesa.b2c.unknown' };
    return {
      event: `mpesa.b2c.${result.ResultCode === 0 ? 'success' : 'failed'}`,
      paymentId: result.ConversationID,
      paymentStatus: result.ResultCode === 0 ? ('COMPLETED' as const) : ('FAILED' as const),
    };
  }
}
