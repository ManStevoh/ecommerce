import { API_BASE, TENANT_ID, apiHeaders, parseAmount, type ApiOrder } from './client';

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type OrderPayment = {
  id: string;
  amount: number;
  status: string;
  provider: string;
  providerRef: string | null;
  metadata: any;
  paidAt: string | null;
  createdAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  shippingAddress: any;
  createdAt: string;
  items: OrderItem[];
  payments: OrderPayment[];
};

function mapOrder(o: any): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.customerEmail,
    total: parseAmount(o.totalAmount),
    status: o.status.toLowerCase(),
    shippingAddress: o.shippingAddress ?? {},
    createdAt: o.createdAt,
    items: (o.items ?? []).map((i: any) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      unitPrice: parseAmount(i.unitPrice),
      totalPrice: parseAmount(i.totalPrice),
    })),
    payments: (o.payments ?? []).map((p: any) => ({
      id: p.id,
      amount: parseAmount(p.amount),
      status: p.status.toLowerCase(),
      provider: p.provider,
      providerRef: p.providerRef,
      metadata: p.metadata ?? {},
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    })),
  };
}

export async function fetchOrders(): Promise<Order[]> {
  if (!TENANT_ID) return [];
  const res = await fetch(`${API_BASE}/api/v1/orders`, {
    headers: apiHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as ApiOrder[];
  return data.map(mapOrder);
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: apiHeaders(),
    body: JSON.stringify({ status: status.toUpperCase() }),
  });
  if (!res.ok) throw new Error(`Failed to update order (${res.status})`);
}

export async function approvePayment(paymentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: apiHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to approve payment (${res.status})`);
}

export async function createShipment(
  orderId: string,
  data: { trackingNumber?: string; carrier?: string },
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/fulfillment/orders/${orderId}`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create shipment (${res.status})`);
}

export async function refundOrder(orderId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/refunds/orders/${orderId}`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`Failed to refund order (${res.status})`);
}
