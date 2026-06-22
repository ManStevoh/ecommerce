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

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  blocks?: Array<{ id: string; type: string; sortOrder: number; config: Record<string, unknown> }>;
};

export async function fetchPages(): Promise<CmsPage[]> {
  const res = await fetch(`${API_BASE}/api/v1/pages`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function createPage(data: {
  title: string;
  slug: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  blocks?: Array<{ type: string; sortOrder?: number; config?: Record<string, unknown> }>;
}): Promise<CmsPage> {
  const res = await fetch(`${API_BASE}/api/v1/pages`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create page (${res.status})`);
  return res.json();
}

export async function publishPage(id: string): Promise<CmsPage> {
  const res = await fetch(`${API_BASE}/api/v1/pages/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status: 'PUBLISHED', publishedAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Failed to publish page (${res.status})`);
  return res.json();
}
