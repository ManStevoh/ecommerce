import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpMetricsInterceptor } from './http-metrics.interceptor';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
})
export class ObservabilityModule {}

export { CorrelationMiddleware } from './correlation.middleware';
export { HttpMetricsInterceptor } from './http-metrics.interceptor';
