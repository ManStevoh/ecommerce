export interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  totalAmount: number;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  fromStatus: string;
  toStatus: string;
  reason?: string;
}

export interface PaymentCompletedPayload {
  paymentId: string;
  orderIds: string[];
  provider: string;
  amount?: number;
}

export interface PaymentFailedPayload {
  paymentId: string;
  orderIds: string[];
  provider: string;
  reason?: string;
}

export interface ProductIndexPayload {
  id: string;
  name: string;
  slug: string;
  price: number;
  description?: string | null;
}

export interface ProductDeletedPayload {
  productId: string;
}
