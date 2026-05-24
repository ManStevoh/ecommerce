import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  upsert(@Body() dto: UpsertInventoryDto) {
    return this.inventoryService.upsert(dto);
  }

  @Get()
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('variantId') variantId?: string,
  ) {
    if (warehouseId) return this.inventoryService.findByWarehouse(warehouseId);
    if (variantId) return this.inventoryService.findByVariant(variantId);
    return { message: 'Provide warehouseId or variantId query parameter' };
  }

  @Patch(':id/adjust')
  adjust(@Param('id') id: string, @Body() dto: AdjustInventoryDto) {
    return this.inventoryService.adjust(id, dto);
  }
}
