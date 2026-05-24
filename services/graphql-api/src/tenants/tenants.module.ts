import { Module } from '@nestjs/common';
import { TenantsResolver } from './tenants.resolver';
import { ServiceClientsModule } from '../clients/service-clients.module';

@Module({
  imports: [ServiceClientsModule],
  providers: [TenantsResolver],
})
export class TenantsModule {}
