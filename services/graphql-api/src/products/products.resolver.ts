import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { ProductServiceClient } from '@nexora/integrations';
import { ProductType } from '../common/graphql.types';

function mapProduct(p: {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price?: number | string;
  basePrice?: number | string;
  stockQuantity?: number;
  isActive: boolean;
}): ProductType {
  const rawPrice = p.basePrice ?? p.price ?? 0;
  const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? undefined,
    price,
    stockQuantity: p.stockQuantity ?? 0,
    isActive: p.isActive,
  };
}

@Resolver(() => ProductType)
export class ProductsResolver {
  constructor(private readonly productClient: ProductServiceClient) {}

  @Query(() => [ProductType], { name: 'products' })
  async products(
    @Context() ctx: { tenantId?: string },
    @Args('tenantId', { nullable: true }) tenantId?: string,
  ) {
    const tid = tenantId ?? ctx.tenantId;
    if (!tid) return [];

    const rows = await this.productClient.listProducts(tid);
    return rows
      .filter((p) => p.isActive)
      .slice(0, 100)
      .map(mapProduct);
  }

  @Query(() => ProductType, { name: 'product', nullable: true })
  async product(
    @Args('slug') slug: string,
    @Context() ctx: { tenantId?: string },
    @Args('tenantId', { nullable: true }) tenantId?: string,
  ) {
    const tid = tenantId ?? ctx.tenantId;
    if (!tid) return null;

    const p = await this.productClient.getProductBySlug(tid, slug);
    if (!p) return null;
    return mapProduct(p);
  }
}
