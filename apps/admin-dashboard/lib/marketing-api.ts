import { getAccessToken, getTenantId } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  const tenantId = getTenantId();
  if (tenantId) h['x-tenant-id'] = tenantId;
  return h;
}

export type Campaign = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  channel: string;
  segmentId?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number | string;
  minOrderAmount?: number | string | null;
  maxUses?: number | null;
  isActive: boolean;
  usedCount: number;
};

export async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await fetch(`${API_BASE}/api/v1/campaigns`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const res = await fetch(`${API_BASE}/api/v1/coupons`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function createCoupon(data: {
  code: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
}): Promise<Coupon> {
  const res = await fetch(`${API_BASE}/api/v1/coupons`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create coupon (${res.status})`);
  return res.json();
}

export async function updateCoupon(
  id: string,
  data: Partial<{ isActive: boolean; maxUses: number; minOrderAmount: number }>,
): Promise<Coupon> {
  const res = await fetch(`${API_BASE}/api/v1/coupons/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update coupon (${res.status})`);
  return res.json();
}

export async function deleteCoupon(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/coupons/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Failed to delete coupon (${res.status})`);
}

export async function createCampaign(data: {
  name: string;
  description?: string;
  segmentId?: string;
  channel?: string;
  status?: string;
  startsAt?: string;
  metadata?: Record<string, unknown>;
}): Promise<Campaign> {
  const res = await fetch(`${API_BASE}/api/v1/campaigns`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create campaign (${res.status})`);
  return res.json();
}

export async function sendCampaign(id: string): Promise<{ sent: number }> {
  const res = await fetch(`${API_BASE}/api/v1/campaigns/${id}/send`, {
    method: 'POST',
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Failed to send campaign (${res.status})`);
  return res.json();
}

export async function generateProductDescription(productName: string, brief?: string) {
  const res = await fetch(`${API_BASE}/api/v1/ai/product-descriptions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ productName, brief, tone: 'professional' }),
  });
  if (!res.ok) throw new Error('AI generation failed');
  return res.json();
}
