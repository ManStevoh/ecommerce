import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { PlansModule } from '../plans/plans.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [PlansModule, BillingModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
