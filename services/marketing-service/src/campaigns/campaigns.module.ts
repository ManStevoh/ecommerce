import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsScheduler } from './campaigns-scheduler.service';
import { SegmentsModule } from '../segments/segments.module';

@Module({
  imports: [SegmentsModule],
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignsScheduler],
})
export class CampaignsModule {}
