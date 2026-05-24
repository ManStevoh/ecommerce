import { Injectable } from '@nestjs/common';
import { Prisma } from '@nexora/database';
import { NotificationServiceClient } from '@nexora/integrations';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { UpsertAbandonedCartDto } from './dto/upsert-abandoned-cart.dto';

@Injectable()
export class AbandonedCartsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly notificationClient: NotificationServiceClient,
  ) {}

  async upsert(dto: UpsertAbandonedCartDto) {
    const tenantId = this.tenantContext.getTenantId();
    const email = dto.customerEmail.trim().toLowerCase();

    return this.prisma.abandonedCart.upsert({
      where: {
        tenantId_customerEmail: { tenantId, customerEmail: email },
      },
      create: {
        tenantId,
        customerEmail: email,
        items: dto.items as unknown as Prisma.InputJsonValue,
        subtotal: dto.subtotal,
        currency: dto.currency ?? 'KES',
        lastActivityAt: new Date(),
      },
      update: {
        items: dto.items as unknown as Prisma.InputJsonValue,
        subtotal: dto.subtotal,
        currency: dto.currency ?? 'KES',
        lastActivityAt: new Date(),
      },
    });
  }

  async processReminders(storeUrl?: string) {
    const tenantId = this.tenantContext.getTenantId();
    const cutoff = new Date(Date.now() - 60 * 60 * 1000);
    const carts = await this.prisma.abandonedCart.findMany({
      where: {
        tenantId,
        convertedAt: null,
        remindedAt: null,
        lastActivityAt: { lte: cutoff },
      },
      take: 50,
    });

    const recoveryBase = storeUrl ?? 'http://localhost:3100';
    let sent = 0;

    for (const cart of carts) {
      const items = cart.items as { name?: string; quantity?: number }[];
      const itemSummary = items
        .slice(0, 3)
        .map((item) => `${item.quantity ?? 1}× ${item.name ?? 'item'}`)
        .join(', ');

      await this.notificationClient.sendEmail(tenantId, {
        to: cart.customerEmail,
        templateId: 'abandoned-cart',
        variables: {
          subtotal: `${cart.currency} ${Number(cart.subtotal).toLocaleString()}`,
          itemSummary: itemSummary || 'Your saved items',
          recoveryUrl: `${recoveryBase}/cart`,
        },
      });

      await this.prisma.abandonedCart.update({
        where: { id: cart.id },
        data: { remindedAt: new Date() },
      });
      sent += 1;
    }

    return { processed: carts.length, sent, tenantId };
  }
}
