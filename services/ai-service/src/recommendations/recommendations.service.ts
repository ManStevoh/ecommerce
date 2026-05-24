import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendations(dto: GetRecommendationsDto) {
    const limit = dto.limit ?? 8;
    const scored = await this.scoreProducts(dto.tenantId, dto.userId);

    if (scored.length >= limit) {
      return this.buildResponse(dto, scored.slice(0, limit));
    }

    const exclude = new Set(scored.map((s) => s.productId));
    const fallback = await this.prisma.product.findMany({
      where: {
        tenantId: dto.tenantId,
        isActive: true,
        ...(exclude.size ? { id: { notIn: [...exclude] } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit - scored.length,
      select: { id: true, name: true, slug: true, price: true },
    });

    const items = [
      ...scored,
      ...fallback.map((product, index) => ({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(product.price),
        score: Number((0.5 - index * 0.03).toFixed(2)),
        reason: 'Trending in your store',
      })),
    ];

    return this.buildResponse(dto, items.slice(0, limit));
  }

  private async scoreProducts(tenantId: string, userId?: string) {
    const productScores = new Map<
      string,
      { score: number; reason: string; name: string; slug: string; price: number }
    >();

    if (userId) {
      const orders = await this.prisma.order.findMany({
        where: { tenantId, userId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      for (const order of orders) {
        for (const item of order.items) {
          const existing = productScores.get(item.productId);
          const boost = existing ? existing.score + item.quantity * 0.15 : item.quantity * 0.2;
          productScores.set(item.productId, {
            score: boost,
            reason: 'Based on your order history',
            name: item.product.name,
            slug: item.product.slug,
            price: Number(item.product.price),
          });
        }
      }

      const wishlist = await this.prisma.wishlistItem.findMany({
        where: { tenantId, userId },
        include: { product: true },
      });
      for (const row of wishlist) {
        const existing = productScores.get(row.productId);
        productScores.set(row.productId, {
          score: (existing?.score ?? 0) + 0.25,
          reason: existing ? 'From your orders & wishlist' : 'From your wishlist',
          name: row.product.name,
          slug: row.product.slug,
          price: Number(row.product.price),
        });
      }
    }

    const popular = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { tenantId } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 12,
    });

    for (const row of popular) {
      const product = await this.prisma.product.findFirst({
        where: { id: row.productId, tenantId, isActive: true },
      });
      if (!product) continue;
      const qty = row._sum.quantity ?? 0;
      const existing = productScores.get(row.productId);
      productScores.set(row.productId, {
        score: (existing?.score ?? 0) + qty * 0.05,
        reason: existing?.reason ?? 'Popular with other shoppers',
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
      });
    }

    return [...productScores.entries()]
      .map(([productId, meta]) => ({
        productId,
        slug: meta.slug,
        name: meta.name,
        price: meta.price,
        score: Number(Math.min(meta.score, 0.99).toFixed(2)),
        reason: meta.reason,
      }))
      .sort((a, b) => b.score - a.score);
  }

  private buildResponse(
    dto: GetRecommendationsDto,
    items: {
      productId: string;
      slug: string;
      name: string;
      price: number;
      score: number;
      reason: string;
    }[],
  ) {
    return {
      tenantId: dto.tenantId,
      userId: dto.userId ?? 'guest',
      context: dto.context ?? 'homepage',
      items,
    };
  }
}
