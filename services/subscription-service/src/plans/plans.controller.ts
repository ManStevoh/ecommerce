import { Controller, Get, Param, Query } from '@nestjs/common';
import { BillingCycle, SubscriptionPlan } from '@nexora/shared-types';
import { Public } from '../common/tenant/public.decorator';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Public()
  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Public()
  @Get(':plan/pricing')
  getPricing(
    @Param('plan') plan: SubscriptionPlan,
    @Query('cycle') cycle: BillingCycle = BillingCycle.MONTHLY,
  ) {
    return this.plansService.getPricing(plan, cycle);
  }

  @Public()
  @Get(':plan')
  findOne(@Param('plan') plan: SubscriptionPlan) {
    return this.plansService.findOne(plan);
  }
}
