import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { OrderServiceClient } from '@nexora/integrations';
import { OrderType } from '../common/graphql.types';

@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(private readonly orderClient: OrderServiceClient) {}

  @Query(() => [OrderType], { name: 'orders' })
  async orders(
    @Context() ctx: { tenantId?: string },
    @Args('tenantId', { nullable: true }) tenantId?: string,
  ) {
    const tid = tenantId ?? ctx.tenantId;
    if (!tid) return [];

    const rows = await this.orderClient.listOrders(tid);
    return rows.slice(0, 50).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerEmail: o.customerEmail,
      status: o.status,
      totalAmount:
        typeof o.totalAmount === 'string'
          ? parseFloat(o.totalAmount)
          : o.totalAmount,
      items: (o.items ?? []).map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice:
          typeof i.unitPrice === 'string'
            ? parseFloat(i.unitPrice)
            : i.unitPrice,
      })),
    }));
  }
}
