import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { IntegrationsModule } from './integrations/integrations.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { StoreSettingsModule } from './store-settings/store-settings.module';
import { ThemeSettingsModule } from './theme-settings/theme-settings.module';
import { DomainsModule } from './domains/domains.module';
import { TenantIsolationMiddleware } from './common/middleware/tenant-isolation.middleware';

@Module({
  providers: [TenantIsolationMiddleware],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    PrismaModule,
    IntegrationsModule,
    TenantsModule,
    StoreSettingsModule,
    ThemeSettingsModule,
    DomainsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantIsolationMiddleware)
      .exclude(
        { path: 'tenants', method: RequestMethod.GET },
        { path: 'tenants/internal/provision', method: RequestMethod.POST },
        { path: 'tenants/validate-subdomain', method: RequestMethod.POST },
        { path: 'tenants/by-subdomain/(.*)', method: RequestMethod.GET },
        { path: 'tenants/:id', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
