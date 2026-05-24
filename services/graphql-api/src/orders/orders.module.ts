import { Module } from '@nestjs/common';
import { OrdersResolver } from './orders.resolver';
import { ServiceClientsModule } from '../clients/service-clients.module';

@Module({
  imports: [ServiceClientsModule],
  providers: [OrdersResolver],
})
export class OrdersModule {}
