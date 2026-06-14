import { API_BASE, TENANT_ID, apiHeaders } from './client';

export type BillingPlan = {
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
};

export type CurrentSubscription = {
  id: string;
  status: string;
  currentPeriodEnd: string;
  trialEndsAt?: string | null;
  plan: BillingPlan;
};

export async function fetchBillingPlans(): Promise<BillingPlan[]> {
  const res = await fetch(`${API_BASE}/api/v1/plans`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchCurrentSubscription(): Promise<CurrentSubscription | null> {
  if (!TENANT_ID) return null;
  const res = await fetch(`${API_BASE}/api/v1/subscriptions/current`, {
    headers: apiHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function subscribeToPlan(input: {
  plan: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
}): Promise<CurrentSubscription> {
  const res = await fetch(`${API_BASE}/api/v1/subscriptions`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Subscribe failed (${res.status})`);
  }
  return res.json();
}

export async function cancelSubscription(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/subscriptions/current`, {
    method: 'DELETE',
    headers: apiHeaders(),
  });
  if (!res.ok) throw new Error(`Cancel failed (${res.status})`);
}

export async function fetchTrialStatus(): Promise<{
  isTrialing: boolean;
  daysRemaining: number;
  endsAt?: string;
}> {
  if (!TENANT_ID) return { isTrialing: false, daysRemaining: 0 };
  const res = await fetch(`${API_BASE}/api/v1/trials/status`, {
    headers: apiHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return { isTrialing: false, daysRemaining: 0 };
  return res.json();
}
