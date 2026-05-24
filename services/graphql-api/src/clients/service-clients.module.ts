import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OrderServiceClient,
  ProductServiceClient,
  TenantServiceClient,
  createOrderServiceClient,
  createProductServiceClient,
  createTenantServiceClient,
} from '@nexora/integrations';

@Global()
@Module({
  providers: [
    {
      provide: ProductServiceClient,
      useFactory: (config: ConfigService) =>
        createProductServiceClient(
          config.get<string>('API_GATEWAY_URL') ?? 'http://localhost:3000',
        ),
      inject: [ConfigService],
    },
    {
      provide: OrderServiceClient,
      useFactory: (config: ConfigService) =>
        createOrderServiceClient(
          config.get<string>('API_GATEWAY_URL') ?? 'http://localhost:3000',
        ),
      inject: [ConfigService],
    },
    {
      provide: TenantServiceClient,
      useFactory: (config: ConfigService) =>
        createTenantServiceClient(
          config.get<string>('API_GATEWAY_URL') ?? 'http://localhost:3000',
        ),
      inject: [ConfigService],
    },
  ],
  exports: [ProductServiceClient, OrderServiceClient, TenantServiceClient],
})
export class ServiceClientsModule {}
