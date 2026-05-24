import { API_URL, authHeaders } from './client';

export interface TenantSummary {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  customDomain?: string | null;
  plan?: { name: string; slug: string; priceMonthly: number | string } | null;
  _count?: { orders: number };
}

export async function fetchTenants(): Promise<TenantSummary[]> {
  const res = await fetch(`${API_URL}/api/v1/tenants`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load tenants');
  const data = await res.json();
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function updateTenantStatus(
  tenantId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'CANCELLED',
): Promise<TenantSummary> {
  const res = await fetch(`${API_URL}/api/v1/tenants/${tenantId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update tenant status');
  return res.json();
}
