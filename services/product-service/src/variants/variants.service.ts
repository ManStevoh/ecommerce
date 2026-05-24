import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class VariantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  async create(dto: CreateVariantDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, ...this.tenantWhere() },
    });
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    return this.prisma.productVariant.create({
      data: { ...dto, tenantId: this.tenantContext.getTenantId() },
    });
  }

  async findByProduct(productId: string) {
    const variants = await this.prisma.productVariant.findMany({
      where: { productId, ...this.tenantWhere() },
      include: { inventoryLevels: true },
    });

    return variants.map((variant) => ({
      id: variant.id,
      tenantId: variant.tenantId,
      productId: variant.productId,
      sku: variant.sku,
      name: variant.name,
      price: variant.price,
      attributeValues: variant.attributeValues,
      weightGrams: variant.weightGrams,
      stockQuantity: variant.inventoryLevels.reduce(
        (sum, level) =>
          sum + level.quantityOnHand - level.quantityReserved,
        0,
      ),
    }));
  }

  async findOne(id: string) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id, ...this.tenantWhere() },
    });
    if (!variant) throw new NotFoundException(`Variant ${id} not found`);
    return variant;
  }

  async update(id: string, dto: UpdateVariantDto) {
    await this.findOne(id);
    return this.prisma.productVariant.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.productVariant.delete({ where: { id } });
  }
}
