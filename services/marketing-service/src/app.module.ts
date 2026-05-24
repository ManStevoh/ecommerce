import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ObservabilityModule } from '@nexora/observability';
import { DatabaseModule } from './database/database.module';
import { TenantModule } from './common/tenant/tenant.module';
import { HealthModule } from './health/health.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CouponsModule } from './coupons/coupons.module';
import { SegmentsModule } from './segments/segments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ObservabilityModule,
    TenantModule,
    HealthModule,
    CampaignsModule,
    CouponsModule,
    SegmentsModule,
  ],
})
export class AppModule {}
