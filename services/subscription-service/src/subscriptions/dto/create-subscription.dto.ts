import { IsEnum } from 'class-validator';
import { BillingCycle, SubscriptionPlan } from '@nexora/shared-types';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @IsEnum(BillingCycle)
  billingCycle!: BillingCycle;
}
