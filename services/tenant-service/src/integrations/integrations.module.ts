import { Global, Module } from '@nestjs/common';
import {
  OrderServiceClient,
  SubscriptionServiceClient,
  createOrderServiceClient,
  createSubscriptionServiceClient,
} from '@nexora/integrations';

@Global()
@Module({
  providers: [
    {
      provide: OrderServiceClient,
      useFactory: () =>
        createOrderServiceClient(
          process.env.ORDER_SERVICE_URL ?? 'http://localhost:3004',
        ),
    },
    {
      provide: SubscriptionServiceClient,
      useFactory: () =>
        createSubscriptionServiceClient(
          process.env.SUBSCRIPTION_SERVICE_URL ?? 'http://localhost:3006',
        ),
    },
  ],
  exports: [OrderServiceClient, SubscriptionServiceClient],
})
export class IntegrationsModule {}
