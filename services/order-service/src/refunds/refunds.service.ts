import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { InventoryRestoreService } from '../inventory/inventory-restore.service';

@Injectable()
export class RefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly inventoryRestore: InventoryRestoreService,
  ) {}

  async initiate(orderId: string, amount?: number) {
    const tenantId = this.tenantContext.getTenantId();
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const refundAmount = amount ?? Number(order.totalAmount);
    const refundId = `ref_${Date.now().toString(36)}`;

    if (order.status !== OrderStatus.CANCELLED) {
      await this.inventoryRestore.restoreForOrder(orderId);
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.REFUNDED,
        statusReason: `Refund ${refundId}: ${refundAmount} ${order.currency}`,
      },
    });

    return {
      tenantId,
      orderId,
      refundId,
      amount: refundAmount,
      currency: order.currency,
      status: 'COMPLETED',
    };
  }
}
