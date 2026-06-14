import { API_URL, authHeaders } from './client';

export type SaasPlan = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxProducts: number;
  maxUsers: number;
  maxStorageMb: number;
  features: string[];
  isActive: boolean;
};

export async function fetchAdminPlans(): Promise<SaasPlan[]> {
  const res = await fetch(`${API_URL}/api/v1/plans/admin/all`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load plans');
  return res.json();
}

export async function createPlan(data: {
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  maxProducts?: number;
  maxUsers?: number;
}): Promise<SaasPlan> {
  const res = await fetch(`${API_URL}/api/v1/plans/admin`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create plan (${res.status})`);
  return res.json();
}

export async function updatePlan(
  id: string,
  data: Partial<{
    name: string;
    priceMonthly: number;
    priceYearly: number;
    maxProducts: number;
    maxUsers: number;
    isActive: boolean;
  }>,
): Promise<SaasPlan> {
  const res = await fetch(`${API_URL}/api/v1/plans/admin/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update plan (${res.status})`);
  return res.json();
}

export async function deactivatePlan(id: string): Promise<SaasPlan> {
  const res = await fetch(`${API_URL}/api/v1/plans/admin/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to deactivate plan (${res.status})`);
  return res.json();
}
