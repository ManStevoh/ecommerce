import { Module } from '@nestjs/common';
import { InventoryRestoreService } from './inventory-restore.service';

@Module({
  providers: [InventoryRestoreService],
  exports: [InventoryRestoreService],
})
export class InventoryModule {}
