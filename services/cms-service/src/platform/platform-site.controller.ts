import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Public } from '../common/tenant/public.decorator';
import { PlatformAdminGuard } from './guards/platform-admin.guard';
import { PlatformSiteService } from './platform-site.service';
import { UpdatePlatformSiteSettingsDto } from './dto/platform-site-settings.dto';

@Controller('platform/site')
export class PlatformSiteController {
  constructor(private readonly platformSiteService: PlatformSiteService) {}

  @Public()
  @Get('public')
  getPublicSettings() {
    return this.platformSiteService.getSettings();
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Get()
  getSettings() {
    return this.platformSiteService.getSettings();
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Patch()
  updateSettings(@Body() dto: UpdatePlatformSiteSettingsDto) {
    return this.platformSiteService.updateSettings(dto);
  }
}
