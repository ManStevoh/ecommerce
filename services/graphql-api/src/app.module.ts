import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ObservabilityModule } from '@nexora/observability';
import { HealthModule } from './health/health.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObservabilityModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req }: { req: Request & { headers: Record<string, string> } }) => ({
        tenantId:
          req.headers['x-tenant-id'] ?? req.headers['X-Tenant-Id'],
      }),
    }),
    HealthModule,
    ProductsModule,
    OrdersModule,
    TenantsModule,
  ],
})
export class AppModule {}
