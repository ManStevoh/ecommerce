import { API_URL, authHeaders } from './client';

export interface CreateOrderPayload {
  customerEmail: string;
  items: {
    productId: string;
    sku?: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  currency?: string;
  shippingAddress?: Record<string, string>;
  billingAddress?: Record<string, string>;
  notes?: string;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
}

export interface OrderResult {
  id: string;
  orderNumber: string;
  totalAmount: number | string;
}

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number | string;
  customerEmail: string;
  createdAt: string;
};

export function parseOrderTotal(total: number | string): number {
  return typeof total === 'string' ? parseFloat(total) : total;
}

export async function createOrder(
  payload: CreateOrderPayload,
  tenantId: string,
): Promise<OrderResult> {
  const res = await fetch(`${API_URL}/api/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `Order failed (${res.status})`,
    );
  }
  return res.json() as Promise<OrderResult>;
}

export async function fetchMyOrders(tenantId: string): Promise<CustomerOrder[]> {
  const res = await fetch(`${API_URL}/api/v1/orders`, {
    headers: authHeaders(tenantId),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const orders = (await res.json()) as CustomerOrder[];
  const email =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('nexora_user') ?? '{}')?.email
      : undefined;
  if (!email) return orders;
  return orders.filter((o) => o.customerEmail === email);
}
