import { Module } from '@nestjs/common';
import { PaymentProviderRegistry } from './payment-provider.registry';
import { MpesaAdapter } from './adapters/mpesa.adapter';
import { MpesaB2cAdapter } from './adapters/mpesa-b2c.adapter';
import { MpesaC2bAdapter } from './adapters/mpesa-c2b.adapter';
import { StripeAdapter } from './adapters/stripe.adapter';
import { PaystackAdapter } from './adapters/paystack.adapter';
import { FlutterwaveAdapter } from './adapters/flutterwave.adapter';
import { PayPalAdapter } from './adapters/paypal.adapter';
import { WiseAdapter } from './adapters/wise.adapter';
import { BankTransferAdapter } from './adapters/bank-transfer.adapter';
import { ProvidersController } from './providers.controller';
import { DarajaClient } from './daraja.client';
import { StripeClient } from './stripe.client';
import { PaystackClient } from './paystack.client';
import { FlutterwaveClient } from './flutterwave.client';
import { PayPalClient } from './paypal.client';
import { WiseClient } from './wise.client';

@Module({
  controllers: [ProvidersController],
  providers: [
    DarajaClient,
    StripeClient,
    PaystackClient,
    FlutterwaveClient,
    PayPalClient,
    WiseClient,
    MpesaAdapter,
    MpesaB2cAdapter,
    MpesaC2bAdapter,
    StripeAdapter,
    PaystackAdapter,
    FlutterwaveAdapter,
    PayPalAdapter,
    WiseAdapter,
    BankTransferAdapter,
    PaymentProviderRegistry,
  ],
  exports: [PaymentProviderRegistry, MpesaAdapter],
})
export class ProvidersModule {}
