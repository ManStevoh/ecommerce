import { Module } from '@nestjs/common';
import { ProductsResolver } from './products.resolver';
import { ProductsMutationResolver } from './products-mutation.resolver';
import { ServiceClientsModule } from '../clients/service-clients.module';

@Module({
  imports: [ServiceClientsModule],
  providers: [ProductsResolver, ProductsMutationResolver],
})
export class ProductsModule {}
