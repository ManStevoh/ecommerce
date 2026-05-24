import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@nexora/shared-types';
import {
  IPaymentProviderAdapter,
  InitiatePaymentInput,
  InitiatePaymentResult,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class BankTransferAdapter implements IPaymentProviderAdapter {
  readonly provider = PaymentProvider.BANK_TRANSFER;

  constructor(private readonly config: ConfigService) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const reference = `BT-${input.tenantId.slice(0, 4)}-${input.orderId.slice(0, 8)}`.toUpperCase();

    return {
      provider: this.provider,
      externalReference: reference,
      status: 'PENDING',
      raw: {
        message: 'Transfer the exact amount using the reference below',
        bankDetails: {
          accountName:
            this.config.get('BANK_ACCOUNT_NAME') ?? 'Nexora Commerce Ltd',
          accountNumber: this.config.get('BANK_ACCOUNT_NUMBER') ?? '0000000000',
          bankName: this.config.get('BANK_NAME') ?? 'Equity Bank',
          branchCode: this.config.get('BANK_BRANCH_CODE') ?? '001',
          reference,
        },
        amount: input.amount,
        currency: input.currency,
      },
    };
  }
}
