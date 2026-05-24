import { Injectable } from '@nestjs/common';
import { BillingCycle, SubscriptionPlan } from '@nexora/shared-types';
import { PLAN_CATALOG, getPlanPrice } from './plan-catalog';

@Injectable()
export class PlansService {
  findAll() {
    return Object.values(PLAN_CATALOG);
  }

  findOne(plan: SubscriptionPlan) {
    return PLAN_CATALOG[plan];
  }

  getPricing(plan: SubscriptionPlan, cycle: BillingCycle) {
    const definition = PLAN_CATALOG[plan];
    return {
      plan,
      cycle,
      amountUsd: getPlanPrice(plan, cycle),
      definition,
    };
  }
}
