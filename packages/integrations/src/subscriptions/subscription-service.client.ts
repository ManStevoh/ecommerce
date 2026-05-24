import { httpJson } from '../http/http-client';

export type PlatformSubscriptionStats = {
  totalMrr: number;
  activeCount: number;
};

export class SubscriptionServiceClient {
  constructor(private readonly baseUrl: string) {}

  async getPlatformStats(): Promise<PlatformSubscriptionStats> {
    return httpJson(`${this.baseUrl}/api/v1/subscriptions/platform/stats`);
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
