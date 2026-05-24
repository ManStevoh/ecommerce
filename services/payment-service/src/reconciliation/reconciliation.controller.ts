import { Controller, Post, Query } from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';

@Controller('payments/reconcile')
export class ReconciliationController {
  constructor(private readonly reconciliation: ReconciliationService) {}

  @Post()
  run(@Query('maxAgeHours') maxAgeHours?: string) {
    const hours = maxAgeHours ? parseInt(maxAgeHours, 10) : 48;
    return this.reconciliation.reconcileStalePending(hours);
  }
}
