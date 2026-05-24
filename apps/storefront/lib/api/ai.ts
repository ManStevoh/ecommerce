import { API_URL } from './client';

export type RecommendationItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  score: number;
  reason: string;
};

export async function fetchRecommendations(
  tenantId: string,
  context: 'homepage' | 'pdp' | 'cart' | 'checkout' = 'homepage',
  userId?: string,
): Promise<RecommendationItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/ai/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({ tenantId, context, limit: 6, userId }),
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: RecommendationItem[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}
