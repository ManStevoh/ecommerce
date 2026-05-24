import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AbandonedCartsService } from './abandoned-carts.service';

@Injectable()
export class AbandonedCartsScheduler {
  private readonly logger = new Logger(AbandonedCartsScheduler.name);

  constructor(private readonly abandonedCartsService: AbandonedCartsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyReminders() {
    const result = await this.abandonedCartsService.processAllTenants();
    this.logger.log(
      `Abandoned cart job: ${result.sent} emails across ${result.tenants} tenants`,
    );
  }
}
