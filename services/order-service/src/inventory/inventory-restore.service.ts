import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@nexora/database';
import { ProductServiceClient } from '@nexora/integrations';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';

export function shouldRestoreStock(
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
): boolean {
  if (toStatus === OrderStatus.CANCELLED) {
    return fromStatus !== OrderStatus.CANCELLED;
  }
  if (toStatus === OrderStatus.REFUNDED) {
    return (
      fromStatus !== OrderStatus.CANCELLED &&
      fromStatus !== OrderStatus.REFUNDED
    );
  }
  return false;
}

@Injectable()
export class InventoryRestoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly productClient: ProductServiceClient,
  ) {}

  async restoreForOrder(orderId: string): Promise<void> {
    const tenantId = this.tenantContext.getTenantId();
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { items: true },
    });
    if (!order?.items.length) return;

    await this.productClient.incrementStock(
      tenantId,
      order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );
  }
}
