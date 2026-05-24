import { httpJson } from '../http/http-client';

export type BillingChargeRequest = {
  tenantId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  provider?: string;
};

export class BillingClient {
  constructor(private readonly baseUrl: string) {}

  async charge(request: BillingChargeRequest): Promise<Record<string, unknown>> {
    return httpJson(`${this.baseUrl}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': request.tenantId,
      },
      body: JSON.stringify({
        provider: request.provider ?? 'STRIPE',
        orderId: request.subscriptionId,
        amount: request.amount,
        currency: request.currency,
        metadata: { subscriptionId: request.subscriptionId },
      }),
    });
  }
}

export function createBillingClient(baseUrl?: string): BillingClient {
  return new BillingClient(
    baseUrl ?? process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3005',
  );
}
