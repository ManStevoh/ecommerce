import { Global, Module } from '@nestjs/common';
import {
  ProductServiceClient,
  createProductServiceClient,
} from '@nexora/integrations';

@Global()
@Module({
  providers: [
    {
      provide: ProductServiceClient,
      useFactory: () =>
        createProductServiceClient(
          process.env.CATALOG_SERVICE_URL ??
            process.env.API_GATEWAY_URL ??
            'http://localhost:3003',
        ),
    },
  ],
  exports: [ProductServiceClient],
})
export class IntegrationsModule {}
