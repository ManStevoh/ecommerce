import { API_BASE, TENANT_ID, apiHeaders, parseAmount, type ApiProduct } from './client';

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'draft';
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  basePrice: number;
  stockQuantity: number;
  isActive: boolean;
  currency?: string;
};

function mapProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    price: parseAmount(p.price),
    stock: p.stockQuantity ?? 0,
    status: p.isActive ? 'active' : 'draft',
  };
}

export async function fetchProducts(): Promise<Product[]> {
  if (!TENANT_ID) return [];
  const res = await fetch(`${API_BASE}/api/v1/products`, {
    headers: apiHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as ApiProduct[];
  return data.map(mapProduct);
}

export async function fetchProductById(id: string): Promise<ProductDetail | null> {
  if (!TENANT_ID) return null;
  const res = await fetch(`${API_BASE}/api/v1/products/${id}`, {
    headers: apiHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const p = (await res.json()) as ApiProduct & {
    slug: string;
    description?: string | null;
    basePrice?: number | string;
    stockQuantity?: number;
    currency?: string;
  };
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: parseAmount(p.basePrice ?? p.price),
    stockQuantity: p.stockQuantity ?? 0,
    isActive: p.isActive,
    currency: p.currency,
  };
}

export async function createProduct(data: {
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  stockQuantity?: number;
  currency?: string;
  isActive?: boolean;
}): Promise<ProductDetail> {
  const res = await fetch(`${API_BASE}/api/v1/products`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create product (${res.status})`);
  return res.json();
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    stockQuantity: number;
    isActive: boolean;
  }>,
): Promise<ProductDetail> {
  const res = await fetch(`${API_BASE}/api/v1/products/${id}`, {
    method: 'PATCH',
    headers: apiHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update product (${res.status})`);
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/products/${id}`, {
    method: 'DELETE',
    headers: apiHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete product (${res.status})`);
}
