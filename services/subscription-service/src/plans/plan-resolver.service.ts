import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionPlan } from '@nexora/shared-types';
import { PrismaService } from '../database/prisma.service';
import { PLAN_CATALOG } from './plan-catalog';

const PLAN_SLUG_MAP: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.STARTER]: 'starter',
  [SubscriptionPlan.GROWTH]: 'growth',
  [SubscriptionPlan.BUSINESS]: 'business',
  [SubscriptionPlan.ENTERPRISE]: 'enterprise',
};

@Injectable()
export class PlanResolverService {
  constructor(private readonly prisma: PrismaService) {}

  slugForPlan(plan: SubscriptionPlan): string {
    return PLAN_SLUG_MAP[plan] ?? plan.toLowerCase();
  }

  async ensureCatalogPlans(): Promise<void> {
    for (const def of Object.values(PLAN_CATALOG)) {
      const slug = this.slugForPlan(def.plan);
      await this.prisma.plan.upsert({
        where: { slug },
        update: {
          name: def.name,
          description: def.description,
          priceMonthly: def.monthlyPriceUsd,
          priceYearly: def.yearlyPriceUsd,
          maxProducts: def.limits.products === -1 ? 999999 : def.limits.products,
          maxUsers: def.limits.staffAccounts === -1 ? 999999 : def.limits.staffAccounts,
          features: def.features,
        },
        create: {
          name: def.name,
          slug,
          description: def.description,
          priceMonthly: def.monthlyPriceUsd,
          priceYearly: def.yearlyPriceUsd,
          maxProducts: def.limits.products === -1 ? 999999 : def.limits.products,
          maxUsers: def.limits.staffAccounts === -1 ? 999999 : def.limits.staffAccounts,
          features: def.features,
        },
      });
    }
  }

  async resolveByPlanEnum(plan: SubscriptionPlan) {
    await this.ensureCatalogPlans();
    const slug = this.slugForPlan(plan);
    return this.resolveBySlug(slug);
  }

  async resolveBySlug(slug: string) {
    const record = await this.prisma.plan.findUnique({ where: { slug } });
    if (!record) {
      throw new NotFoundException(`Plan ${slug} not found`);
    }
    return record;
  }

  async resolveById(id: string) {
    const record = await this.prisma.plan.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Plan ${id} not found`);
    }
    return record;
  }
}
