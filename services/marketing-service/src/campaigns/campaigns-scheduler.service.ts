import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CampaignsService } from './campaigns.service';

@Injectable()
export class CampaignsScheduler {
  private readonly logger = new Logger(CampaignsScheduler.name);

  constructor(private readonly campaignsService: CampaignsService) {}

  @Cron('0 */15 * * * *')
  async handleScheduledCampaigns() {
    const result = await this.campaignsService.processAllScheduled();
    if (result.processed > 0) {
      this.logger.log(
        `Campaign scheduler: processed ${result.processed}, sent ${result.sent} emails`,
      );
    }
  }
}
