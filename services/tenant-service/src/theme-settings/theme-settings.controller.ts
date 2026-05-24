import { Body, Controller, Get, Put } from '@nestjs/common';
import { ThemeSettingsService } from './theme-settings.service';
import { UpdateThemeSettingsDto } from './dto/update-theme-settings.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantContext } from '../common/interfaces/tenant-context.interface';

@Controller('theme-settings')
export class ThemeSettingsController {
  constructor(private readonly themeSettingsService: ThemeSettingsService) {}

  @Get('presets')
  listPresets() {
    return this.themeSettingsService.listPresets();
  }

  @Get()
  get(@CurrentTenant() tenant: TenantContext) {
    return this.themeSettingsService.get(tenant.tenantId);
  }

  @Put()
  update(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateThemeSettingsDto,
  ) {
    return this.themeSettingsService.update(tenant.tenantId, dto);
  }
}
