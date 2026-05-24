import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async list(userId: string) {
    const tenantId = this.tenantContext.getTenantId();
    const items = await this.prisma.wishlistItem.findMany({
      where: { tenantId, userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stockQuantity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      addedAt: item.createdAt,
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
    }));
  }

  async add(userId: string, productId: string) {
    const tenantId = this.tenantContext.getTenantId();
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.wishlistItem.upsert({
      where: {
        tenantId_userId_productId: { tenantId, userId, productId },
      },
      create: { tenantId, userId, productId },
      update: {},
    });
  }

  async remove(userId: string, productId: string) {
    const tenantId = this.tenantContext.getTenantId();
    await this.prisma.wishlistItem.deleteMany({
      where: { tenantId, userId, productId },
    });
    return { removed: true, productId };
  }
}
