import { ConflictException, Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@nexora/database';
import { SubscriptionPlan } from '@nexora/shared-types';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';

const DEFAULT_TRIAL_DAYS = 14;

const PLAN_SLUG_MAP: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.STARTER]: 'starter',
  [SubscriptionPlan.GROWTH]: 'growth',
  [SubscriptionPlan.BUSINESS]: 'business',
  [SubscriptionPlan.ENTERPRISE]: 'enterprise',
};

@Injectable()
export class TrialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private async resolvePlanId(plan: SubscriptionPlan): Promise<string> {
    const slug = PLAN_SLUG_MAP[plan] ?? 'growth';
    let record = await this.prisma.plan.findUnique({ where: { slug } });
    if (!record) {
      record = await this.prisma.plan.create({
        data: { name: plan, slug, priceMonthly: 0, priceYearly: 0 },
      });
    }
    return record.id;
  }

  async start(plan: SubscriptionPlan = SubscriptionPlan.GROWTH) {
    const tenantId = this.tenantContext.getTenantId();
    const existing = await this.prisma.subscription.findFirst({
      where: { tenantId, status: SubscriptionStatus.TRIALING },
    });
    if (existing) {
      throw new ConflictException('Trial already active for this tenant');
    }

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + DEFAULT_TRIAL_DAYS);
    const planId = await this.resolvePlanId(plan);

    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId,
        planId,
        status: SubscriptionStatus.TRIALING,
        currentPeriodStart: new Date(),
        currentPeriodEnd: endsAt,
        trialEndsAt: endsAt,
      },
      include: { plan: true },
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
    };
  }
}
