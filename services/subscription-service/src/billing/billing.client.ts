import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createBillingClient } from '@nexora/integrations';
import { PaymentProvider } from '@nexora/shared-types';

@Injectable()
export class BillingClient {
  private readonly logger = new Logger(BillingClient.name);
  private readonly client;
  private readonly provider: PaymentProvider;

  constructor(private readonly config: ConfigService) {
    this.client = createBillingClient(
      this.config.get<string>('PAYMENT_SERVICE_URL'),
    );
    this.provider =
      (this.config.get<string>('BILLING_PAYMENT_PROVIDER') as PaymentProvider) ??
      PaymentProvider.STRIPE;
  }

  async chargeSubscription(params: {
    tenantId: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    email?: string;
  }): Promise<{ success: boolean; paymentId?: string; stub?: boolean }> {
    try {
      const data = (await this.client.charge({
        tenantId: params.tenantId,
        subscriptionId: params.subscriptionId,
        amount: params.amount,
        currency: params.currency,
        provider: this.provider,
      })) as {
        payment?: { id: string; status: string };
        providerResult?: { raw?: { stub?: boolean } };
      };

      const completed = data.payment?.status === 'COMPLETED';
      const stub = data.providerResult?.raw?.stub === true;

      return {
        success: completed || stub || data.payment?.status === 'PENDING',
        paymentId: data.payment?.id,
        stub,
      };
    } catch (err) {
      this.logger.warn(`Billing client error: ${(err as Error).message}`);
      return { success: false };
    }
  }
}
