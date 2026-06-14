import { httpJson } from '../http/http-client';
import { SubscriptionPlan } from '@nexora/shared-types';

export type PlatformSubscriptionStats = {
  totalMrr: number;
  activeCount: number;
};

export type PlanRecord = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxProducts: number;
  maxUsers: number;
  features: string[];
  isActive: boolean;
};

export type SubscriptionRecord = {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string | null;
  plan: PlanRecord;
};

export class SubscriptionServiceClient {
  constructor(private readonly baseUrl: string) {}

  private headers(tenantId?: string): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (tenantId) h['x-tenant-id'] = tenantId;
    return h;
  }

  async getPlatformStats(): Promise<PlatformSubscriptionStats> {
    return httpJson(`${this.baseUrl}/api/v1/subscriptions/platform/stats`);
  }

  async listPlans(): Promise<PlanRecord[]> {
    return httpJson(`${this.baseUrl}/api/v1/plans`);
  }

  async startTrial(
    tenantId: string,
    plan: SubscriptionPlan = SubscriptionPlan.GROWTH,
  ): Promise<{ subscriptionId: string; plan: string; endsAt: string }> {
    return httpJson(`${this.baseUrl}/api/v1/trials/start`, {
      method: 'POST',
      headers: this.headers(tenantId),
      body: JSON.stringify({ plan }),
    });
  }

  async createSubscription(
    tenantId: string,
    input: { plan: SubscriptionPlan; billingCycle: 'MONTHLY' | 'YEARLY' },
  ): Promise<SubscriptionRecord> {
    return httpJson(`${this.baseUrl}/api/v1/subscriptions`, {
      method: 'POST',
      headers: this.headers(tenantId),
      body: JSON.stringify(input),
    });
  }

  async getCurrentSubscription(tenantId: string): Promise<SubscriptionRecord | null> {
    try {
      return await httpJson(`${this.baseUrl}/api/v1/subscriptions/current`, {
        headers: this.headers(tenantId),
      });
    } catch {
      return null;
    }
  }
}

export function createSubscriptionServiceClient(
  baseUrl?: string,
): SubscriptionServiceClient {
  return new SubscriptionServiceClient(
    baseUrl ??
      process.env.SUBSCRIPTION_SERVICE_URL ??
      'http://localhost:3006',
  );
}
