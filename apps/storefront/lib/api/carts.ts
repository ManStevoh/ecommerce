import { API_URL } from './client';

export type AbandonedCartItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export async function upsertAbandonedCart(
  tenantId: string,
  data: {
    customerEmail: string;
    items: AbandonedCartItem[];
    subtotal: number;
    currency?: string;
  },
): Promise<void> {
  await fetch(`${API_URL}/api/v1/abandoned-carts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify(data),
  });
}
