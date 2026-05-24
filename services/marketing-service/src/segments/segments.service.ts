import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateSegmentDto, UpdateSegmentDto } from './dto/create-segment.dto';

type SegmentRules = {
  minOrderCount?: number;
  minTotalSpent?: number;
};
@Injectable()
export class SegmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  async create(dto: CreateSegmentDto) {
    return this.prisma.customerSegment.create({
      data: {
        tenantId: this.tenantContext.getTenantId(),
        name: dto.name,
        description: dto.description,
        rules: (dto.rules ?? {}) as Prisma.InputJsonValue,
        memberCount: dto.memberCount ?? 0,
      },
    });
  }

  async findAll() {
    return this.prisma.customerSegment.findMany({
      where: this.tenantWhere(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const segment = await this.prisma.customerSegment.findFirst({
      where: { id, ...this.tenantWhere() },
    });
    if (!segment) throw new NotFoundException(`Segment ${id} not found`);
    return segment;
  }

  async update(id: string, dto: UpdateSegmentDto) {
    await this.findOne(id);
    const patch = dto as Partial<CreateSegmentDto>;
    return this.prisma.customerSegment.update({
      where: { id },
      data: {
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.description !== undefined && { description: patch.description }),
        ...(patch.rules !== undefined && {
          rules: patch.rules as Prisma.InputJsonValue,
        }),
        ...(patch.memberCount !== undefined && { memberCount: patch.memberCount }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.customerSegment.delete({ where: { id } });
    return { deleted: true, id };
  }

  async evaluate(id: string) {
    const segment = await this.findOne(id);
    const rules = (segment.rules ?? {}) as SegmentRules;
    const tenantId = this.tenantContext.getTenantId();

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: {
          notIn: [
            OrderStatus.CANCELLED,
            OrderStatus.REFUNDED,
            OrderStatus.RETURNED,
          ],
        },
      },
      select: { customerEmail: true, totalAmount: true },
    });

    const byCustomer = new Map<string, { count: number; spent: number }>();
    for (const order of orders) {
      const email = order.customerEmail;
      if (!email) continue;
      const current = byCustomer.get(email) ?? { count: 0, spent: 0 };
      current.count += 1;
      current.spent += Number(order.totalAmount);
      byCustomer.set(email, current);
    }

    const minOrderCount = rules.minOrderCount ?? 0;
    const minTotalSpent = rules.minTotalSpent ?? 0;

    const members = [...byCustomer.entries()]
      .filter(
        ([, stats]) =>
          stats.count >= minOrderCount && stats.spent >= minTotalSpent,
      )
      .map(([email, stats]) => ({
        email,
        orderCount: stats.count,
        totalSpent: Math.round(stats.spent * 100) / 100,
      }));

    await this.prisma.customerSegment.update({
      where: { id },
      data: { memberCount: members.length },
    });

    return {
      segmentId: id,
      name: segment.name,
      rules,
      memberCount: members.length,
      members: members.slice(0, 50),
    };
  }
}