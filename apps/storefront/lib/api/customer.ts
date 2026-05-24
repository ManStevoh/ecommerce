import { API_URL, authHeaders } from './client';
import type { ApiProduct } from './catalog';

export type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  customerEmail: string;
  status: string;
  priority: string;
  createdAt: string;
  sla?: {
    responseDueAt: string;
    resolutionDueAt: string;
    breached: boolean;
  };
};

export async function fetchMyTickets(
  tenantId: string,
  customerEmail: string,
): Promise<SupportTicket[]> {
  const params = new URLSearchParams({ tenantId, customerEmail });
  const res = await fetch(`${API_URL}/api/v1/tickets?${params.toString()}`, {
    headers: authHeaders(tenantId),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createSupportTicket(
  tenantId: string,
  data: { subject: string; description: string; customerEmail: string },
): Promise<SupportTicket> {
  const res = await fetch(`${API_URL}/api/v1/tickets`, {
    method: 'POST',
    headers: authHeaders(tenantId),
    body: JSON.stringify({ ...data, tenantId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Failed to create ticket',
    );
  }
  return res.json();
}

export type WishlistItem = {
  id: string;
  productId: string;
  product?: ApiProduct;
};

export async function fetchWishlist(tenantId: string): Promise<WishlistItem[]> {
  const res = await fetch(`${API_URL}/api/v1/wishlist`, {
    headers: authHeaders(tenantId),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function addToWishlist(
  tenantId: string,
  productId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/wishlist`, {
    method: 'POST',
    headers: authHeaders(tenantId),
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error('Failed to add to wishlist');
}

export async function removeFromWishlist(
  tenantId: string,
  productId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/wishlist`, {
    method: 'DELETE',
    headers: authHeaders(tenantId),
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error('Failed to remove from wishlist');
}

export type ProductReview = {
  id: string;
  rating: number;
  customerName: string;
  title?: string | null;
  comment?: string | null;
  createdAt: string;
};

export type ReviewsResponse = {
  reviews: ProductReview[];
  averageRating: number;
  count: number;
};

export async function fetchReviews(
  productId: string,
  tenantId: string,
): Promise<ReviewsResponse> {
  const res = await fetch(
    `${API_URL}/api/v1/reviews?productId=${productId}`,
    { headers: { 'x-tenant-id': tenantId }, next: { revalidate: 60 } },
  );
  if (!res.ok) return { reviews: [], averageRating: 0, count: 0 };
  return res.json();
}

export async function createReview(
  tenantId: string,
  data: {
    productId: string;
    rating: number;
    customerName: string;
    customerEmail: string;
    title?: string;
    comment?: string;
    userId?: string;
  },
): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/reviews`, {
    method: 'POST',
    headers: authHeaders(tenantId),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit review');
}
