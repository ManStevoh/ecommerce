import { API_BASE, TENANT_ID, apiHeaders } from './client';

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  name: string | null;
  price: number | string;
  attributeValues?: Record<string, string | number | boolean> | null;
  stockQuantity?: number;
};

export async function fetchProductVariants(
  productId: string,
): Promise<ProductVariant[]> {
  if (!TENANT_ID) return [];
  const res = await fetch(
    `${API_BASE}/api/v1/variants?productId=${productId}`,
    { headers: apiHeaders(), cache: 'no-store' },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createVariant(data: {
  productId: string;
  sku: string;
  name?: string;
  price: number;
  attributeValues?: Record<string, string | number | boolean>;
}): Promise<ProductVariant> {
  const res = await fetch(`${API_BASE}/api/v1/variants`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create variant (${res.status})`);
  return res.json();
}

export async function updateVariant(
  id: string,
  data: Partial<{
    sku: string;
    name: string;
    price: number;
    attributeValues: Record<string, string | number | boolean>;
  }>,
): Promise<ProductVariant> {
  const res = await fetch(`${API_BASE}/api/v1/variants/${id}`, {
    method: 'PATCH',
    headers: apiHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update variant (${res.status})`);
  return res.json();
}

export async function deleteVariant(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/variants/${id}`, {
    method: 'DELETE',
    headers: apiHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete variant (${res.status})`);
}

export async function upsertVariantInventory(data: {
  variantId: string;
  warehouseId: string;
  quantityOnHand: number;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/inventory`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update inventory (${res.status})`);
}

export async function fetchVariantInventory(
  variantId: string,
): Promise<
  { id: string; warehouseId: string; quantityOnHand: number; quantityReserved: number }[]
> {
  const res = await fetch(
    `${API_BASE}/api/v1/inventory?variantId=${variantId}`,
    { headers: apiHeaders(), cache: 'no-store' },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchWarehouses(): Promise<
  { id: string; name: string; code: string }[]
> {
  if (!TENANT_ID) return [];
  const res = await fetch(`${API_BASE}/api/v1/warehouses`, {
    headers: apiHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
