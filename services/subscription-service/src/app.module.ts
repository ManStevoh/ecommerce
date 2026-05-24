import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { TenantModule } from './common/tenant/tenant.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TrialsModule } from './trials/trials.module';
import { RenewalsModule } from './renewals/renewals.module';
import { UsageModule } from './usage/usage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TenantModule,
    PlansModule,
    SubscriptionsModule,
    TrialsModule,
    RenewalsModule,
    UsageModule,
  ],
})
export class AppModule {}
