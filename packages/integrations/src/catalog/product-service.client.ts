import { httpJson } from '../http/http-client';

export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  basePrice?: number | string;
  stockQuantity?: number;
  isActive: boolean;
  sku?: string;
};

export type CreateProductInput = {
  name: string;
  slug: string;
  price?: number;
  basePrice?: number;
  description?: string;
  stockQuantity?: number;
  isActive?: boolean;
};

export class ProductServiceClient {
  constructor(private readonly baseUrl: string) {}

  private headers(tenantId: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    };
  }

  async listProducts(tenantId: string): Promise<ProductRecord[]> {
    return httpJson(`${this.baseUrl}/api/v1/products`, {
      headers: this.headers(tenantId),
    });
  }

  async getProductBySlug(
    tenantId: string,
    slug: string,
  ): Promise<ProductRecord | null> {
    const products = await this.listProducts(tenantId);
    return products.find((p) => p.slug === slug) ?? null;
  }

  async createProduct(
    tenantId: string,
    input: CreateProductInput,
  ): Promise<ProductRecord> {
    const basePrice = input.basePrice ?? input.price ?? 0;
    return httpJson(`${this.baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: this.headers(tenantId),
      body: JSON.stringify({
        name: input.name,
        slug: input.slug,
        basePrice,
        stockQuantity: input.stockQuantity ?? 0,
        description: input.description,
        isActive: input.isActive ?? true,
      }),
    });
  }

  async decrementStock(
    tenantId: string,
    items: { productId: string; quantity: number }[],
  ): Promise<ProductRecord[]> {
    return httpJson(`${this.baseUrl}/api/v1/products/stock/decrement`, {
      method: 'POST',
      headers: this.headers(tenantId),
      body: JSON.stringify({ items }),
    });
  }

  async incrementStock(
    tenantId: string,
    items: { productId: string; quantity: number }[],
  ): Promise<ProductRecord[]> {
    return httpJson(`${this.baseUrl}/api/v1/products/stock/increment`, {
      method: 'POST',
      headers: this.headers(tenantId),
      body: JSON.stringify({ items }),
    });
  }
}

export function createProductServiceClient(baseUrl?: string): ProductServiceClient {
  return new ProductServiceClient(
    baseUrl ?? process.env.API_GATEWAY_URL ?? 'http://localhost:3000',
  );
}
