import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ObservabilityModule } from '@nexora/observability';
import { DatabaseModule } from './database/database.module';
import { TenantModule } from './common/tenant/tenant.module';
import { HealthModule } from './health/health.module';
import { PagesModule } from './pages/pages.module';
import { MediaModule } from './media/media.module';
import { PlatformModule } from './platform/platform.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ObservabilityModule,
    TenantModule,
    HealthModule,
    PagesModule,
    MediaModule,
    PlatformModule,
  ],
})
export class AppModule {}
