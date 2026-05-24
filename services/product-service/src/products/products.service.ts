import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductEventsPublisher } from '../events/product-events.publisher';

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

  async decrementStock(items: { productId: string; quantity: number }[]) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.$transaction(async (tx) => {
      const updated = [];

      for (const item of items) {
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

        const next = await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: available - item.quantity },
        });
        updated.push(next);
      }

      return updated;
    });
  }
}
