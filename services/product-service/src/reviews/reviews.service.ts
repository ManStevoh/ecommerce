import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(dto: CreateReviewDto) {
    const tenantId = this.tenantContext.getTenantId();
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.productReview.create({
      data: {
        tenantId,
        productId: dto.productId,
        userId: dto.userId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
      },
    });
  }

  async findByProduct(productId: string) {
    const tenantId = this.tenantContext.getTenantId();
    const reviews = await this.prisma.productReview.findMany({
      where: { tenantId, productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
    const avg =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
    return { reviews, averageRating: Number(avg.toFixed(1)), count: reviews.length };
  }

  async findAll() {
    return this.prisma.productReview.findMany({
      where: { tenantId: this.tenantContext.getTenantId() },
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
  }

  async approve(id: string) {
    await this.findOne(id);
    return this.prisma.productReview.update({
      where: { id },
      data: { isApproved: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.productReview.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async findOne(id: string) {
    const review = await this.prisma.productReview.findFirst({
      where: { id, tenantId: this.tenantContext.getTenantId() },
    });
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    return review;
  }
}
