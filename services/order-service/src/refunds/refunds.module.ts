import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { InventoryModule } from '../inventory/inventory.module';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';

@Module({
  imports: [DatabaseModule, InventoryModule],
  controllers: [RefundsController],
  providers: [RefundsService],
})
export class RefundsModule {}
