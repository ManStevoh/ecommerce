import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionStatus } from '@nexora/database';
import { BillingCycle, SubscriptionPlan } from '@nexora/shared-types';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { BillingClient } from '../billing/billing.client';
import { PlanResolverService } from '../plans/plan-resolver.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly planResolver: PlanResolverService,
    private readonly billing: BillingClient,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
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

  private async syncTenantPlan(tenantId: string, planId: string) {
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { planId },
    });
  }

  async create(dto: CreateSubscriptionDto) {
    const tenantId = this.tenantContext.getTenantId();
    const planRecord = await this.planResolver.resolveByPlanEnum(dto.plan);

    if (!planRecord.isActive) {
      throw new BadRequestException(`Plan ${planRecord.slug} is not available`);
    }

    const amount =
      dto.billingCycle === BillingCycle.YEARLY
        ? Number(planRecord.priceYearly)
        : Number(planRecord.priceMonthly);

    await this.prisma.subscription.updateMany({
      where: {
        tenantId,
        status: { in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE] },
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    if (amount > 0) {
      const charge = await this.billing.chargeSubscription({
        tenantId,
        subscriptionId: `checkout-${tenantId}-${Date.now()}`,
        amount,
        currency: planRecord.currency,
      });

      if (!charge.success) {
        throw new BadRequestException(
          'Payment failed — check billing configuration or try again',
        );
      }
    }

    const active = await this.prisma.subscription.create({
      data: {
        tenantId,
        planId: planRecord.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.computePeriodEnd(dto.billingCycle),
      },
      include: { plan: true },
    });

    await this.syncTenantPlan(tenantId, planRecord.id);

    return {
      ...active,
      charged: amount,
      billingCycle: dto.billingCycle,
    };
  }

  async findCurrent() {
    const sub = await this.prisma.subscription.findFirst({
      where: {
        ...this.tenantWhere(),
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });
    if (!sub) throw new NotFoundException('No subscription for tenant');
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
