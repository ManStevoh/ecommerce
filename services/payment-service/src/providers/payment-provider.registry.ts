import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentProvider } from '@nexora/shared-types';
import { IPaymentProviderAdapter } from './interfaces/payment-provider.interface';
import { MpesaAdapter } from './adapters/mpesa.adapter';
import { MpesaB2cAdapter } from './adapters/mpesa-b2c.adapter';
import { MpesaC2bAdapter } from './adapters/mpesa-c2b.adapter';
import { StripeAdapter } from './adapters/stripe.adapter';
import { PaystackAdapter } from './adapters/paystack.adapter';
import { FlutterwaveAdapter } from './adapters/flutterwave.adapter';
import { PayPalAdapter } from './adapters/paypal.adapter';
import { WiseAdapter } from './adapters/wise.adapter';
import { BankTransferAdapter } from './adapters/bank-transfer.adapter';

@Injectable()
export class PaymentProviderRegistry {
  private readonly adapters: Map<PaymentProvider, IPaymentProviderAdapter>;

  constructor(
    mpesa: MpesaAdapter,
    mpesaB2c: MpesaB2cAdapter,
    mpesaC2b: MpesaC2bAdapter,
    stripe: StripeAdapter,
    paystack: PaystackAdapter,
    flutterwave: FlutterwaveAdapter,
    paypal: PayPalAdapter,
    wise: WiseAdapter,
    bankTransfer: BankTransferAdapter,
  ) {
    this.adapters = new Map<PaymentProvider, IPaymentProviderAdapter>([
      [PaymentProvider.MPESA, mpesa],
      [PaymentProvider.MPESA_B2C, mpesaB2c],
      [PaymentProvider.MPESA_C2B, mpesaC2b],
      [PaymentProvider.STRIPE, stripe],
      [PaymentProvider.PAYSTACK, paystack],
      [PaymentProvider.FLUTTERWAVE, flutterwave],
      [PaymentProvider.PAYPAL, paypal],
      [PaymentProvider.WISE, wise],
      [PaymentProvider.BANK_TRANSFER, bankTransfer],
    ]);
  }

  get(provider: PaymentProvider): IPaymentProviderAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new NotFoundException(`Payment provider ${provider} not registered`);
    }
    return adapter;
  }

  list(): PaymentProvider[] {
    return [...this.adapters.keys()];
  }
}
