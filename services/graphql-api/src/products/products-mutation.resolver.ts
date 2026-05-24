import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
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
export class ProductsMutationResolver {
  constructor(private readonly productClient: ProductServiceClient) {}

  @Mutation(() => ProductType, { name: 'createProduct' })
  async createProduct(
    @Args('tenantId') tenantId: string,
    @Args('name') name: string,
    @Args('slug') slug: string,
    @Args('price') price: number,
    @Context() ctx: { tenantId?: string },
  ) {
    const tid = tenantId ?? ctx.tenantId;
    const product = await this.productClient.createProduct(tid!, {
      name,
      slug,
      basePrice: price,
    });
    return mapProduct(product);
  }
}
