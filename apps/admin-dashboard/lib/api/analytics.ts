import { API_BASE, TENANT_ID, apiHeaders } from './client';

export async function fetchAnalyticsRevenue(): Promise<{
  total: number;
  orders: number;
  currency: string;
} | null> {
  if (!TENANT_ID) return null;
  const res = await fetch(
    `${API_BASE}/api/v1/analytics/revenue?tenantId=${TENANT_ID}`,
    { headers: apiHeaders(), cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

export type ConversionMetrics = {
  conversionRate: number;
  cartAbandonmentRate: number;
  purchases: number;
  checkoutStarted: number;
  sessions: number;
  activeProducts: number;
};

export async function fetchAnalyticsConversion(): Promise<ConversionMetrics | null> {
  if (!TENANT_ID) return null;
  const res = await fetch(
    `${API_BASE}/api/v1/analytics/conversion?tenantId=${TENANT_ID}`,
    { headers: apiHeaders(), cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

export type FunnelStep = {
  name: string;
  count: number;
  dropoff: number;
};

export async function fetchAnalyticsFunnel(): Promise<{
  steps: FunnelStep[];
} | null> {
  if (!TENANT_ID) return null;
  const res = await fetch(
    `${API_BASE}/api/v1/analytics/funnel?tenantId=${TENANT_ID}`,
    { headers: apiHeaders(), cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}
