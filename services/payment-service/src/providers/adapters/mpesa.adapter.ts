import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '@nexora/shared-types';
import {
  IPaymentProviderAdapter,
  InitiatePaymentInput,
  InitiatePaymentResult,
  WebhookVerifyInput,
} from '../interfaces/payment-provider.interface';
import { DarajaClient } from '../daraja.client';

export interface MpesaStkPushDto {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
}

@Injectable()
export class MpesaAdapter implements IPaymentProviderAdapter {
  readonly provider = PaymentProvider.MPESA;

  constructor(private readonly daraja: DarajaClient) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const phone = (input.metadata?.phoneNumber as string) ?? '';

    if (!this.daraja.isConfigured || !phone) {
      const checkoutRequestId = `ws_CO_${input.orderId.replace(/-/g, '').slice(0, 8)}`;
      return {
        provider: this.provider,
        externalReference: checkoutRequestId,
        status: 'PENDING',
        raw: {
          stub: true,
          message: 'Configure MPESA_* env vars and phoneNumber for live STK Push',
          checkoutRequestId,
          phoneNumber: phone,
          amount: input.amount,
          currency: input.currency,
        },
      };
    }

    const result = await this.daraja.stkPush({
      phoneNumber: phone,
      amount: input.amount,
      accountReference: input.orderId,
      transactionDesc:
        (input.metadata?.transactionDesc as string) ?? 'Nexora payment',
    });

    return {
      provider: this.provider,
      externalReference: result.checkoutRequestId,
      status: result.responseCode === '0' ? 'PENDING' : 'FAILED',
      raw: result,
    };
  }

  async stkPush(dto: MpesaStkPushDto, tenantId: string) {
    return this.initiatePayment({
      tenantId,
      orderId: dto.accountReference,
      amount: dto.amount,
      currency: 'KES',
      metadata: {
        phoneNumber: dto.phoneNumber,
        transactionDesc: dto.transactionDesc,
      },
    });
  }

  verifyWebhook(_input: WebhookVerifyInput): boolean {
    return true;
  }

  async handleWebhook(payload: unknown, _tenantId: string) {
    const body = payload as {
      Body?: {
        stkCallback?: {
          CheckoutRequestID?: string;
          ResultCode?: number;
          ResultDesc?: string;
        };
      };
    };

    const callback = body.Body?.stkCallback;
    if (!callback) {
      return { event: 'mpesa.unknown' };
    }

    let paymentStatus: 'COMPLETED' | 'FAILED' | 'PENDING' | undefined;
    if (callback.ResultCode === 0) paymentStatus = 'COMPLETED';
    else if (callback.ResultCode !== undefined) paymentStatus = 'FAILED';

    return {
      event: `mpesa.stk.${callback.ResultCode === 0 ? 'success' : 'failed'}`,
      paymentId: callback.CheckoutRequestID,
      paymentStatus,
    };
  }
}
