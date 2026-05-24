import { httpJson } from '../http/http-client';

export type OrderItemRecord = {
  name: string;
  quantity: number;
  unitPrice: number | string;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  status: string;
  totalAmount: number | string;
  items?: OrderItemRecord[];
};

export class OrderServiceClient {
  constructor(private readonly baseUrl: string) {}

  async listOrders(tenantId: string): Promise<OrderRecord[]> {
    return httpJson(`${this.baseUrl}/api/v1/orders`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
    });
  }

  async getPlatformOrderCount(): Promise<{ total: number }> {
    return httpJson(`${this.baseUrl}/api/v1/orders/platform/count`);
  }

  async getOrderCountsByTenant(): Promise<{ tenantId: string; count: number }[]> {
    return httpJson(`${this.baseUrl}/api/v1/orders/platform/by-tenant`);
  }
}

export function createOrderServiceClient(baseUrl?: string): OrderServiceClient {
  return new OrderServiceClient(
    baseUrl ??
      process.env.ORDER_SERVICE_URL ??
      process.env.API_GATEWAY_URL ??
      'http://localhost:3000',
  );
}
