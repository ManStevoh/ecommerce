import { Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { BillingClient } from '../billing/billing.client';

@Injectable()
export class RenewalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly billing: BillingClient,
  ) {}

  async previewUpcoming() {
    const tenantId = this.tenantContext.getTenantId();
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 30);

    const renewals = await this.prisma.subscription.findMany({
      where: {
        tenantId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
        currentPeriodEnd: { lte: horizon },
      },
      include: { plan: true },
      orderBy: { currentPeriodEnd: 'asc' },
    });

    return {
      tenantId,
      renewals: renewals.map((sub) => ({
        subscriptionId: sub.id,
        plan: sub.plan.slug,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        amount: Number(sub.plan.priceMonthly),
      })),
    };
  }

  async processNow() {
    const tenantId = this.tenantContext.getTenantId();
    const now = new Date();

    const due = await this.prisma.subscription.findMany({
      where: {
        tenantId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: { lte: now },
      },
      include: { plan: true },
    });

    let processed = 0;
    let failed = 0;
    for (const sub of due) {
      const amount = Number(sub.plan.priceMonthly);
      const charge = await this.billing.chargeSubscription({
        tenantId,
        subscriptionId: sub.id,
        amount,
        currency: sub.plan.currency ?? 'USD',
      });

      if (!charge.success) {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: SubscriptionStatus.PAST_DUE },
        });
        failed += 1;
        continue;
      }

      const nextEnd = new Date(sub.currentPeriodEnd);
      nextEnd.setMonth(nextEnd.getMonth() + 1);
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: sub.currentPeriodEnd,
          currentPeriodEnd: nextEnd,
        },
      });
      processed += 1;
    }

    return { tenantId, processed, failed };
  }
}
