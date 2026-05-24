import { getAccessToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  if (TENANT_ID) h['x-tenant-id'] = TENANT_ID;
  return h;
}

export type Campaign = {
  id: string;
  name: string;
  status: string;
  channel: string;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number | string;
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
}): Promise<Coupon> {
  const res = await fetch(`${API_BASE}/api/v1/coupons`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create coupon (${res.status})`);
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
