import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { GatewayConfigModule } from './config/gateway-config.module';
import { GatewayConfigService } from './config/gateway-config.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthMiddleware } from './auth/jwt-auth.middleware';
import { TenantModule } from './tenant/tenant.module';
import { TenantMiddleware } from './tenant/tenant.middleware';
import { ProxyModule } from './proxy/proxy.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    GatewayConfigModule,
    ThrottlerModule.forRootAsync({
      imports: [GatewayConfigModule],
      inject: [GatewayConfigService],
      useFactory: (config: GatewayConfigService) => [
        {
          ttl: config.rateLimitTtl * 1000,
          limit: config.rateLimitMax,
        },
      ],
    }),
    AuthModule,
    TenantModule,
    HealthModule,
    ProxyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TenantMiddleware, JwtAuthMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.ALL },
        { path: 'health/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
