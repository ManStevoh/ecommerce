import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async generateForOrder(orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId: this.tenantContext.getTenantId() },
      include: { items: true, tenant: { select: { name: true } } },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const invoiceNumber = `INV-${order.orderNumber.replace(/[^A-Z0-9]/gi, '').slice(0, 12)}`;

    return {
      tenantId: order.tenantId,
      orderId: order.id,
      invoiceNumber,
      status: 'ISSUED',
      issuedAt: new Date().toISOString(),
      storeName: order.tenant.name,
      customerEmail: order.customerEmail,
      currency: order.currency,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      shippingAmount: Number(order.shippingAmount),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.totalAmount),
      lineItems: order.items.map((item) => ({
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    };
  }

  async findByOrder(orderId: string) {
    const invoice = await this.generateForOrder(orderId).catch(() => null);
    return {
      tenantId: this.tenantContext.getTenantId(),
      orderId,
      invoices: invoice ? [invoice] : [],
    };
  }
}
