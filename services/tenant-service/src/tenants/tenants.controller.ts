import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { ProvisionTenantDto } from './dto/provision-tenant.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { ValidateSubdomainDto } from './dto/validate-subdomain.dto';
import { InternalApiGuard } from '../common/guards/internal-api.guard';
import { PlatformAdminGuard } from '../common/guards/platform-admin.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantContext } from '../common/interfaces/tenant-context.interface';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('internal/provision')
  @UseGuards(InternalApiGuard)
  provision(@Body() dto: CreateTenantDto) {
    return this.tenantsService.provision(dto);
  }

  @Post('provision')
  @UseGuards(PlatformAdminGuard)
  provisionPlatform(
    @Headers('x-user-id') ownerId: string,
    @Body() dto: ProvisionTenantDto,
  ) {
    return this.tenantsService.provision({
      ownerId,
      storeName: dto.storeName,
    });
  }

  @Post('validate-subdomain')
  validateSubdomain(@Body() dto: ValidateSubdomainDto) {
    return this.tenantsService.validateSubdomain(dto.subdomain);
  }

  @Get('platform-stats')
  platformStats() {
    return this.tenantsService.getPlatformStats();
  }

  @Get('audit-logs')
  @UseGuards(PlatformAdminGuard)
  auditLogs() {
    return this.tenantsService.getAuditLogs();
  }

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get('current')
  getCurrent(@CurrentTenant() tenant: TenantContext) {
    return this.tenantsService.findById(tenant.tenantId);
  }

  @Get('by-subdomain/:subdomain')
  findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.tenantsService.findBySubdomain(subdomain);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Patch(':id/status')
  @UseGuards(PlatformAdminGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTenantStatusDto) {
    return this.tenantsService.updateStatus(id, dto.status);
  }
}
