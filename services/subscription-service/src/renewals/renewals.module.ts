import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BillingModule } from '../billing/billing.module';
import { RenewalsController } from './renewals.controller';
import { RenewalsService } from './renewals.service';

@Module({
  imports: [DatabaseModule, BillingModule],
  controllers: [RenewalsController],
  providers: [RenewalsService],
})
export class RenewalsModule {}
