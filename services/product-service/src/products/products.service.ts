import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductEventsPublisher } from '../events/product-events.publisher';

type StockItem = { productId: string; variantId?: string; quantity: number };

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly productEvents: ProductEventsPublisher,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  private toIndexPayload(product: {
    id: string;
    name: string;
    slug: string;
    price: unknown;
    description?: string | null;
  }) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      description: product.description,
    };
  }

  async create(dto: CreateProductDto) {
    const tenantId = this.tenantContext.getTenantId();
    const product = await this.prisma.product.create({
      data: {
        tenantId,
        name: dto.name,
        slug: dto.slug,
        sku: dto.slug,
        description: dto.description,
        price: dto.basePrice,
        basePrice: dto.basePrice,
        currency: dto.currency ?? 'USD',
        isActive: dto.isActive ?? true,
        stockQuantity: dto.stockQuantity ?? 0,
        categoryId: dto.categoryId,
      },
    });

    void this.productEvents.created(
      tenantId,
      this.toIndexPayload(product),
    );
    return product;
  }

  async findAll(query: ProductQueryDto) {
    const { categoryId, brandId, search, isActive } = query;
    return this.prisma.product.findMany({
      where: {
        ...this.tenantWhere(),
        ...(categoryId && { categoryId }),
        ...(brandId && { brandId }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, ...this.tenantWhere() },
      include: { variants: true, category: true },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
    });
    void this.productEvents.updated(
      this.tenantContext.getTenantId(),
      this.toIndexPayload(product),
    );
    return product;
  }

  async remove(id: string) {
    const tenantId = this.tenantContext.getTenantId();
    await this.findOne(id);
    const deleted = await this.prisma.product.delete({ where: { id } });
    void this.productEvents.deleted(tenantId, { productId: id });
    return deleted;
  }

  private availableInventory(level: {
    quantityOnHand: number;
    quantityReserved: number;
  }) {
    return level.quantityOnHand - level.quantityReserved;
  }

  private async decrementVariantStock(
    tx: Prisma.TransactionClient,
    tenantId: string,
    item: StockItem,
  ) {
    const variant = await tx.productVariant.findFirst({
      where: { id: item.variantId, tenantId, productId: item.productId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant ${item.variantId} not found`);
    }

    const levels = await tx.inventoryLevel.findMany({
      where: { variantId: item.variantId, tenantId },
      orderBy: { quantityOnHand: 'desc' },
    });

    if (levels.length === 0) {
      return this.decrementProductStock(tx, tenantId, item);
    }

    const label = variant.name ?? variant.sku;
    const totalAvailable = levels.reduce(
      (sum, level) => sum + this.availableInventory(level),
      0,
    );
    if (totalAvailable < item.quantity) {
      throw new BadRequestException(
        `Insufficient stock for ${label} (${totalAvailable} available)`,
      );
    }

    let remaining = item.quantity;
    for (const level of levels) {
      if (remaining <= 0) break;
      const available = this.availableInventory(level);
      if (available <= 0) continue;

      const take = Math.min(available, remaining);
      await tx.inventoryLevel.update({
        where: { id: level.id },
        data: { quantityOnHand: level.quantityOnHand - take },
      });
      remaining -= take;
    }

    return variant;
  }

  private async incrementVariantStock(
    tx: Prisma.TransactionClient,
    tenantId: string,
    item: StockItem,
  ) {
    const variant = await tx.productVariant.findFirst({
      where: { id: item.variantId, tenantId, productId: item.productId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant ${item.variantId} not found`);
    }

    const level = await tx.inventoryLevel.findFirst({
      where: { variantId: item.variantId, tenantId },
      orderBy: { quantityOnHand: 'desc' },
    });

    if (!level) {
      return this.incrementProductStock(tx, tenantId, item);
    }

    return tx.inventoryLevel.update({
      where: { id: level.id },
      data: { quantityOnHand: { increment: item.quantity } },
    });
  }

  private async decrementProductStock(
    tx: Prisma.TransactionClient,
    tenantId: string,
    item: StockItem,
  ) {
    const product = await tx.product.findFirst({
      where: { id: item.productId, tenantId },
    });
    if (!product) {
      throw new NotFoundException(`Product ${item.productId} not found`);
    }

    const available = product.stockQuantity ?? 0;
    if (available < item.quantity) {
      throw new BadRequestException(
        `Insufficient stock for ${product.name} (${available} available)`,
      );
    }

    return tx.product.update({
      where: { id: item.productId },
      data: { stockQuantity: available - item.quantity },
    });
  }

  private async incrementProductStock(
    tx: Prisma.TransactionClient,
    tenantId: string,
    item: StockItem,
  ) {
    const product = await tx.product.findFirst({
      where: { id: item.productId, tenantId },
    });
    if (!product) {
      throw new NotFoundException(`Product ${item.productId} not found`);
    }

    const available = product.stockQuantity ?? 0;
    return tx.product.update({
      where: { id: item.productId },
      data: { stockQuantity: available + item.quantity },
    });
  }

  async decrementStock(items: StockItem[]) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.$transaction(async (tx) => {
      const updated = [];

      for (const item of items) {
        if (item.variantId) {
          updated.push(await this.decrementVariantStock(tx, tenantId, item));
        } else {
          updated.push(await this.decrementProductStock(tx, tenantId, item));
        }
      }

      return updated;
    });
  }

  async incrementStock(items: StockItem[]) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.$transaction(async (tx) => {
      const updated = [];

      for (const item of items) {
        if (item.variantId) {
          updated.push(await this.incrementVariantStock(tx, tenantId, item));
        } else {
          updated.push(await this.incrementProductStock(tx, tenantId, item));
        }
      }

      return updated;
    });
  }
}
