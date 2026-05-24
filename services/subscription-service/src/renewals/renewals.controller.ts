import { Controller, Get, Post } from '@nestjs/common';
import { RenewalsService } from './renewals.service';

@Controller('renewals')
export class RenewalsController {
  constructor(private readonly renewalsService: RenewalsService) {}

  @Get('upcoming')
  previewUpcoming() {
    return this.renewalsService.previewUpcoming();
  }

  @Post('process')
  processNow() {
    return this.renewalsService.processNow();
  }
}
