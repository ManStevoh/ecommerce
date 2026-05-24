import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  async upsert(dto: UpsertInventoryDto) {
    const tenantId = this.tenantContext.getTenantId();
    return this.prisma.inventoryLevel.upsert({
      where: {
        tenantId_variantId_warehouseId: {
          tenantId,
          variantId: dto.variantId,
          warehouseId: dto.warehouseId,
        },
      },
      create: { ...dto, tenantId },
      update: {
        quantityOnHand: dto.quantityOnHand,
        quantityReserved: dto.quantityReserved,
      },
    });
  }

  async findByWarehouse(warehouseId: string) {
    return this.prisma.inventoryLevel.findMany({
      where: { warehouseId, ...this.tenantWhere() },
      include: { variant: true },
    });
  }

  async findByVariant(variantId: string) {
    return this.prisma.inventoryLevel.findMany({
      where: { variantId, ...this.tenantWhere() },
      include: { warehouse: true },
    });
  }

  async adjust(id: string, dto: AdjustInventoryDto) {
    const level = await this.prisma.inventoryLevel.findFirst({
      where: { id, ...this.tenantWhere() },
    });
    if (!level) throw new NotFoundException(`Inventory level ${id} not found`);

    return this.prisma.inventoryLevel.update({
      where: { id },
      data: {
        quantityOnHand: { increment: dto.delta },
      },
    });
  }
}
