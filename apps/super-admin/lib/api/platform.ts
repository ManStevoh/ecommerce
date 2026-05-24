import { API_URL, authHeaders } from './client';
import type { TenantSummary } from './tenants';

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalMrr: number;
  totalOrders: number;
  growth: number;
}

export interface PlatformSubscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  plan: { name: string; priceMonthly: number | string };
  tenant: { id: string; name: string; subdomain: string };
}

export type AuditLog = {
  id: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const res = await fetch(`${API_URL}/api/v1/tenants/platform-stats`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load platform stats');
  return res.json();
}

export async function fetchPlatformSubscriptions(): Promise<PlatformSubscription[]> {
  const res = await fetch(`${API_URL}/api/v1/subscriptions/platform`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load subscriptions');
  return res.json();
}

export async function fetchPaymentProviders(): Promise<{ providers: string[] }> {
  const res = await fetch(`${API_URL}/api/v1/providers`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load payment providers');
  return res.json();
}

export async function provisionTenant(storeName: string): Promise<{
  tenantId: string;
  name: string;
  subdomain: string;
  url: string;
}> {
  const res = await fetch(`${API_URL}/api/v1/tenants/provision`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ storeName }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to provision tenant');
  }
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${API_URL}/api/v1/tenants/audit-logs`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load audit logs');
  return res.json();
}
