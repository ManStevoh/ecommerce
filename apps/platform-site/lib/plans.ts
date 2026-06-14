const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type PublicPlan = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  priceMonthly: number | string;
  priceYearly: number | string;
  features?: string[];
};

export async function fetchPublicPlans(): Promise<PublicPlan[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/plans`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
