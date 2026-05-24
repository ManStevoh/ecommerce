import { API_URL, tenantHeaders } from './client';

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  basePrice?: number;
  price?: number | string;
  currency: string;
  images?: unknown;
}

export function getProductImage(
  product: { images?: unknown },
  fallback = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=800&fit=crop',
): string {
  const images = product.images;
  if (Array.isArray(images) && images.length > 0) {
    return String(images[0]);
  }
  return fallback;
}

export function getProductPrice(product: ApiProduct): number {
  if (typeof product.basePrice === 'number') return product.basePrice;
  if (typeof product.price === 'number') return product.price;
  if (typeof product.price === 'string') return parseFloat(product.price);
  return 0;
}

export async function fetchProducts(tenantId?: string): Promise<ApiProduct[]> {
  const headers: Record<string, string> = {};
  if (tenantId) headers['x-tenant-id'] = tenantId;

  try {
    const res = await fetch(`${API_URL}/api/v1/products`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchProductBySlug(
  slug: string,
  tenantId: string,
): Promise<ApiProduct | null> {
  const products = await fetchProducts(tenantId);
  return products.find((p) => p.slug === slug) ?? null;
}
