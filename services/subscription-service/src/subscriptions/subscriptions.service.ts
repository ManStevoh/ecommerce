import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionStatus } from '@nexora/database';
import { BillingCycle, SubscriptionPlan } from '@nexora/shared-types';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

const PLAN_SLUG_MAP: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.STARTER]: 'starter',
  [SubscriptionPlan.GROWTH]: 'growth',
  [SubscriptionPlan.BUSINESS]: 'business',
  [SubscriptionPlan.ENTERPRISE]: 'enterprise',
};

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  private async resolvePlanId(plan: SubscriptionPlan): Promise<string> {
    const slug = PLAN_SLUG_MAP[plan];
    let record = await this.prisma.plan.findUnique({ where: { slug } });
    if (!record) {
      record = await this.prisma.plan.create({
        data: {
          name: plan,
          slug,
          priceMonthly: 0,
          priceYearly: 0,
        },
      });
    }
    return record.id;
  }

  private computePeriodEnd(cycle: BillingCycle): Date {
    const end = new Date();
    if (cycle === BillingCycle.YEARLY) {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return end;
  }

  async create(dto: CreateSubscriptionDto) {
    const tenantId = this.tenantContext.getTenantId();
    const planId = await this.resolvePlanId(dto.plan);

    return this.prisma.subscription.create({
      data: {
        tenantId,
        planId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.computePeriodEnd(dto.billingCycle),
      },
      include: { plan: true },
    });
  }

  async findCurrent() {
    const sub = await this.prisma.subscription.findFirst({
      where: { ...this.tenantWhere(), status: SubscriptionStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });
    if (!sub) throw new NotFoundException('No active subscription for tenant');
    return sub;
  }

  async cancel() {
    const sub = await this.findCurrent();
    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: { plan: true },
    });
  }

  async findAllPlatform() {
    return this.prisma.subscription.findMany({
      include: {
        plan: true,
        tenant: { select: { id: true, name: true, subdomain: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlatformStats(): Promise<{ totalMrr: number; activeCount: number }> {
    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE },
      include: { plan: true },
    });

    const totalMrr = activeSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.plan?.priceMonthly ?? 0),
      0,
    );

    return {
      totalMrr,
      activeCount: activeSubscriptions.length,
    };
  }
}
