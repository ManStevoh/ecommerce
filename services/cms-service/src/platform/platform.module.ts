import { Module } from '@nestjs/common';
import { PlatformPagesController } from './platform-pages.controller';
import { PlatformPagesService } from './platform-pages.service';
import { PlatformSiteController } from './platform-site.controller';
import { PlatformSiteService } from './platform-site.service';
import { PlatformAdminGuard } from './guards/platform-admin.guard';

@Module({
  controllers: [PlatformPagesController, PlatformSiteController],
  providers: [PlatformPagesService, PlatformSiteService, PlatformAdminGuard],
  exports: [PlatformPagesService, PlatformSiteService],
})
export class PlatformModule {}
