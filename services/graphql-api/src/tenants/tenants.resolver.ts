import { Args, Query, Resolver } from '@nestjs/graphql';
import { TenantServiceClient } from '@nexora/integrations';
import { TenantType } from '../common/graphql.types';

@Resolver(() => TenantType)
export class TenantsResolver {
  constructor(private readonly tenantClient: TenantServiceClient) {}

  @Query(() => [TenantType], { name: 'tenants' })
  async tenants() {
    const rows = await this.tenantClient.listTenants();
    return rows.slice(0, 100);
  }

  @Query(() => TenantType, { name: 'tenantBySubdomain', nullable: true })
  async tenantBySubdomain(@Args('subdomain') subdomain: string) {
    return this.tenantClient.getTenantBySubdomain(subdomain);
  }
}
