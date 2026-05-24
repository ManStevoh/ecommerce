import { API_BASE, TENANT_ID, apiHeaders } from './client';

export type AdminReview = {
  id: string;
  rating: number;
  customerName: string;
  customerEmail: string;
  title?: string | null;
  comment?: string | null;
  isApproved: boolean;
  createdAt: string;
  product?: { id: string; name: string; slug: string };
};

export async function fetchReviews(): Promise<AdminReview[]> {
  if (!TENANT_ID) return [];
  const res = await fetch(`${API_BASE}/api/v1/reviews/admin`, {
    headers: apiHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function approveReview(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/reviews/${id}/approve`, {
    method: 'PATCH',
    headers: apiHeaders(),
  });
  if (!res.ok) throw new Error('Failed to approve review');
}

export async function deleteReview(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/reviews/${id}`, {
    method: 'DELETE',
    headers: apiHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete review');
}
