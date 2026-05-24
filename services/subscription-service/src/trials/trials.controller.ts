import { Body, Controller, Get, Post } from '@nestjs/common';
import { SubscriptionPlan } from '@nexora/shared-types';
import { TrialsService } from './trials.service';

@Controller('trials')
export class TrialsController {
  constructor(private readonly trialsService: TrialsService) {}

  @Post('start')
  start(@Body('plan') plan?: SubscriptionPlan) {
    return this.trialsService.start(plan);
  }

  @Get('status')
  status() {
    return this.trialsService.status();
  }
}
