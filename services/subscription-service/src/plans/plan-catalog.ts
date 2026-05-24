import { BillingCycle, SubscriptionPlan } from '@nexora/shared-types';

export interface PlanDefinition {
  plan: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd: number;
  features: string[];
  limits: {
    products: number;
    ordersPerMonth: number;
    staffAccounts: number;
    warehouses: number;
  };
}

export const PLAN_CATALOG: Record<SubscriptionPlan, PlanDefinition> = {
  [SubscriptionPlan.STARTER]: {
    plan: SubscriptionPlan.STARTER,
    name: 'Starter',
    description: 'For new merchants getting started',
    monthlyPriceUsd: 29,
    yearlyPriceUsd: 290,
    features: ['Up to 100 products', 'Basic analytics', 'Email support'],
    limits: { products: 100, ordersPerMonth: 500, staffAccounts: 2, warehouses: 1 },
  },
  [SubscriptionPlan.GROWTH]: {
    plan: SubscriptionPlan.GROWTH,
    name: 'Growth',
    description: 'For growing businesses scaling operations',
    monthlyPriceUsd: 79,
    yearlyPriceUsd: 790,
    features: ['Up to 1,000 products', 'Advanced analytics', 'Priority support'],
    limits: { products: 1000, ordersPerMonth: 5000, staffAccounts: 10, warehouses: 3 },
  },
  [SubscriptionPlan.BUSINESS]: {
    plan: SubscriptionPlan.BUSINESS,
    name: 'Business',
    description: 'For established brands with multi-channel needs',
    monthlyPriceUsd: 199,
    yearlyPriceUsd: 1990,
    features: ['Unlimited products', 'AI insights', 'Dedicated support'],
    limits: { products: -1, ordersPerMonth: 50000, staffAccounts: 50, warehouses: 10 },
  },
  [SubscriptionPlan.ENTERPRISE]: {
    plan: SubscriptionPlan.ENTERPRISE,
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    features: ['Custom SLA', 'SSO', 'Dedicated infrastructure', 'White-glove onboarding'],
    limits: { products: -1, ordersPerMonth: -1, staffAccounts: -1, warehouses: -1 },
  },
};

export function getPlanPrice(plan: SubscriptionPlan, cycle: BillingCycle): number {
  const def = PLAN_CATALOG[plan];
  return cycle === BillingCycle.YEARLY ? def.yearlyPriceUsd : def.monthlyPriceUsd;
}
