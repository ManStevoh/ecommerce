import { Body, Controller, Get, Put } from '@nestjs/common';
import { StoreSettingsService } from './store-settings.service';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantContext } from '../common/interfaces/tenant-context.interface';

@Controller('store-settings')
export class StoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get()
  get(@CurrentTenant() tenant: TenantContext) {
    return this.storeSettingsService.get(tenant.tenantId);
  }

  @Put()
  update(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateStoreSettingsDto,
  ) {
    return this.storeSettingsService.update(tenant.tenantId, dto);
  }
}
