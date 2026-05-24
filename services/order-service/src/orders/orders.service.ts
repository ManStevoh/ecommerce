import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@nexora/database';
import { EventBusService, EventTopics } from '@nexora/event-bus';
import { ProductServiceClient } from '@nexora/integrations';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { assertValidStatusTransition } from './order-status.workflow';
import {
  InventoryRestoreService,
  shouldRestoreStock,
} from '../inventory/inventory-restore.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly eventBus: EventBusService,
    private readonly productClient: ProductServiceClient,
    private readonly inventoryRestore: InventoryRestoreService,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now().toString(36).toUpperCase()}`;
  }

  async create(dto: CreateOrderDto): Promise<unknown> {
    const subtotal = dto.items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0,
    );
    const tenantId = this.tenantContext.getTenantId();
    const taxAmount = dto.taxAmount ?? 0;
    const shippingAmount = dto.shippingAmount ?? 0;
    const discountAmount = dto.discountAmount ?? 0;
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    await this.productClient.decrementStock(
      tenantId,
      dto.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    );

    const order = await this.prisma.order.create({
      data: {
        tenantId,
        userId: dto.userId,
        customerEmail: dto.customerEmail,
        orderNumber: this.generateOrderNumber(),
        currency: dto.currency ?? 'USD',
        notes: dto.notes,
        status: OrderStatus.PENDING,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        shippingAddress: (dto.shippingAddress ?? {}) as Prisma.InputJsonValue,
        billingAddress: (dto.billingAddress ??
          dto.shippingAddress ??
          {}) as Prisma.InputJsonValue,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku ?? item.productId.slice(0, 8),
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    void this.prisma.abandonedCart
      .updateMany({
        where: {
          tenantId,
          customerEmail: dto.customerEmail,
          convertedAt: null,
        },
        data: { convertedAt: new Date() },
      })
      .catch(() => undefined);

    void this.eventBus.publish(
      EventTopics.ORDER_CREATED,
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        totalAmount: Number(order.totalAmount),
      },
      { tenantId },
    );

    return order;
  }

  async findAll(status?: OrderStatus): Promise<unknown[]> {
    return this.prisma.order.findMany({
      where: { ...this.tenantWhere(), ...(status && { status }) },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<unknown> {
    const order = await this.prisma.order.findFirst({
      where: { id, ...this.tenantWhere() },
      include: { items: true },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<unknown> {
    const order = await this.prisma.order.findFirst({
      where: { id, ...this.tenantWhere() },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    assertValidStatusTransition(order.status, dto.status);
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status, statusReason: dto.reason },
      include: { items: true },
    });

    if (shouldRestoreStock(order.status, dto.status)) {
      await this.inventoryRestore.restoreForOrder(id);
    }

    void this.eventBus.publish(
      EventTopics.ORDER_STATUS_CHANGED,
      {
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        customerEmail: updated.customerEmail,
        fromStatus: order.status,
        toStatus: dto.status,
        reason: dto.reason,
      },
      { tenantId: order.tenantId },
    );

    return updated;
  }

  async getPlatformOrderCount(): Promise<{ total: number }> {
    const total = await this.prisma.order.count();
    return { total };
  }

  async getOrderCountsByTenant(): Promise<{ tenantId: string; count: number }[]> {
    const groups = await this.prisma.order.groupBy({
      by: ['tenantId'],
      _count: { id: true },
    });
    return groups.map((group) => ({
      tenantId: group.tenantId,
      count: group._count.id,
    }));
  }

  async remove(id: string): Promise<unknown> {
    const order = await this.prisma.order.findFirst({
      where: { id, ...this.tenantWhere() },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CANCELLED
    ) {
      throw new NotFoundException(
        'Only pending or cancelled orders can be deleted',
      );
    }
    return this.prisma.order.delete({ where: { id } });
  }
}
