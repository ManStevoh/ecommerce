import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlanResolverService } from './plan-resolver.service';

@Module({
  controllers: [PlansController],
  providers: [PlansService, PlanResolverService],
  exports: [PlansService, PlanResolverService],
})
export class PlansModule {}
