import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CouponType } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/create-coupon.dto';
import { RedeemCouponDto, ValidateCouponDto } from './dto/validate-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  async create(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        tenantId: this.tenantContext.getTenantId(),
        code: dto.code,
        type: dto.type,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount,
        maxUses: dto.maxUses,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.coupon.findMany({
      where: this.tenantWhere(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { id, ...this.tenantWhere() },
    });
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);
    const patch = dto as Partial<CreateCouponDto>;
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(patch.code !== undefined && { code: patch.code }),
        ...(patch.type !== undefined && { type: patch.type }),
        ...(patch.value !== undefined && { value: patch.value }),
        ...(patch.minOrderAmount !== undefined && {
          minOrderAmount: patch.minOrderAmount,
        }),
        ...(patch.maxUses !== undefined && { maxUses: patch.maxUses }),
        ...(patch.startsAt !== undefined && {
          startsAt: patch.startsAt ? new Date(patch.startsAt) : null,
        }),
        ...(patch.expiresAt !== undefined && {
          expiresAt: patch.expiresAt ? new Date(patch.expiresAt) : null,
        }),
        ...(patch.isActive !== undefined && { isActive: patch.isActive }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.coupon.delete({ where: { id } });
    return { deleted: true, id };
  }

  async validate(dto: ValidateCouponDto) {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        ...this.tenantWhere(),
        code: { equals: dto.code.trim(), mode: 'insensitive' },
      },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    const now = new Date();
    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException('This coupon is not valid yet');
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestException('This coupon has expired');
    }
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }
    if (
      coupon.minOrderAmount != null &&
      dto.subtotal < Number(coupon.minOrderAmount)
    ) {
      throw new BadRequestException(
        `Minimum order amount is ${Number(coupon.minOrderAmount)}`,
      );
    }

    const value = Number(coupon.value);
    let discountAmount =
      coupon.type === CouponType.PERCENTAGE
        ? (dto.subtotal * value) / 100
        : value;
    discountAmount = Math.min(discountAmount, dto.subtotal);

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      discountAmount: Math.round(discountAmount * 100) / 100,
    };
  }

  async redeem(dto: RedeemCouponDto) {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        ...this.tenantWhere(),
        code: { equals: dto.code.trim(), mode: 'insensitive' },
      },
    });
    if (!coupon) throw new BadRequestException('Invalid coupon code');
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    return this.prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });
  }
}
