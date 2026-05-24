import { Body, Controller, Post } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { MapDomainDto } from '../tenants/dto/map-domain.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantContext } from '../common/interfaces/tenant-context.interface';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post('map')
  map(@CurrentTenant() tenant: TenantContext, @Body() dto: MapDomainDto) {
    return this.domainsService.mapDomain(tenant.tenantId, dto);
  }

  @Post('verify')
  verifyDomain(@CurrentTenant() tenant: TenantContext) {
    return this.domainsService.verifyDomain(tenant.tenantId);
  }

  @Post('verify-ssl')
  verifySsl(@CurrentTenant() tenant: TenantContext) {
    return this.domainsService.verifySsl(tenant.tenantId);
  }
}
