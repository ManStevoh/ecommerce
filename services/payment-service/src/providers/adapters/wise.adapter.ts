import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '@nexora/shared-types';
import {
  IPaymentProviderAdapter,
  InitiatePaymentInput,
  InitiatePaymentResult,
} from '../interfaces/payment-provider.interface';
import { WiseClient } from '../wise.client';

@Injectable()
export class WiseAdapter implements IPaymentProviderAdapter {
  readonly provider = PaymentProvider.WISE;

  constructor(private readonly wise: WiseClient) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!this.wise.isConfigured) {
      return {
        provider: this.provider,
        externalReference: `wise_stub_${input.orderId}`,
        status: 'PENDING',
        redirectUrl: `https://wise.com/pay/stub/${input.orderId}`,
        raw: {
          stub: true,
          message: 'Set WISE_API_TOKEN and WISE_PROFILE_ID for live transfers',
        },
      };
    }

    const quote = await this.wise.createTransferQuote({
      amount: input.amount,
      currency: input.currency,
    });

    return {
      provider: this.provider,
      externalReference: quote.id,
      status: 'REQUIRES_ACTION',
      redirectUrl: `https://wise.com/transfers/${quote.id}`,
      raw: quote,
    };
  }
}
