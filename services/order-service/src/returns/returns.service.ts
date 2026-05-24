import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';

@Injectable()
export class ReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async initiate(orderId: string, reason?: string) {
    const tenantId = this.tenantContext.getTenantId();
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const returnId = `rma_${Date.now().toString(36)}`;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.RETURNED,
        statusReason: reason ?? `Return requested (${returnId})`,
      },
    });

    return {
      tenantId,
      orderId,
      returnId,
      status: 'REQUESTED',
      reason: reason ?? null,
    };
  }
}
