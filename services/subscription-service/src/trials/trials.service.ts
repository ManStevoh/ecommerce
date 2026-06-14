import { ConflictException, Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@nexora/database';
import { SubscriptionPlan } from '@nexora/shared-types';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { PlanResolverService } from '../plans/plan-resolver.service';

const DEFAULT_TRIAL_DAYS = 14;

@Injectable()
export class TrialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly planResolver: PlanResolverService,
  ) {}

  async start(plan: SubscriptionPlan = SubscriptionPlan.GROWTH) {
    const tenantId = this.tenantContext.getTenantId();
    const existing = await this.prisma.subscription.findFirst({
      where: {
        tenantId,
        status: { in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE] },
      },
    });
    if (existing) {
      throw new ConflictException('Tenant already has an active subscription or trial');
    }

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + DEFAULT_TRIAL_DAYS);
    const planRecord = await this.planResolver.resolveByPlanEnum(plan);

    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId,
        planId: planRecord.id,
        status: SubscriptionStatus.TRIALING,
        currentPeriodStart: new Date(),
        currentPeriodEnd: endsAt,
        trialEndsAt: endsAt,
      },
      include: { plan: true },
    });

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { planId: planRecord.id },
    });

    return {
      tenantId,
      subscriptionId: subscription.id,
      plan: subscription.plan.slug,
      status: subscription.status,
      trialDays: DEFAULT_TRIAL_DAYS,
      endsAt: subscription.trialEndsAt,
    };
  }

  async status() {
    const tenantId = this.tenantContext.getTenantId();
    const trial = await this.prisma.subscription.findFirst({
      where: { tenantId, status: SubscriptionStatus.TRIALING },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    if (!trial?.trialEndsAt) {
      return { tenantId, isTrialing: false, daysRemaining: 0 };
    }

    const ms = trial.trialEndsAt.getTime() - Date.now();
    const daysRemaining = Math.max(0, Math.ceil(ms / 86400000));

    return {
      tenantId,
      isTrialing: daysRemaining > 0,
      daysRemaining,
      endsAt: trial.trialEndsAt,
      subscriptionId: trial.id,
      plan: trial.plan,
    };
  }
}
