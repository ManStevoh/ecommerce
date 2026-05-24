import { Injectable } from '@nestjs/common';
import { AuditAction } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { RecordUsageDto } from './dto/record-usage.dto';

@Injectable()
export class UsageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async record(dto: RecordUsageDto) {
    const tenantId = this.tenantContext.getTenantId();

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: AuditAction.CREATE,
        resource: `usage:${dto.metric}`,
        metadata: { quantity: dto.quantity, recordedAt: new Date().toISOString() },
      },
    });

    return {
      tenantId,
      metric: dto.metric,
      quantity: dto.quantity,
      recordedAt: new Date().toISOString(),
    };
  }

  async summary() {
    const tenantId = this.tenantContext.getTenantId();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const [usageLogs, orders, products, aiLogs] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          tenantId,
          resource: { startsWith: 'usage:' },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.order.count({ where: { tenantId, createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.product.count({ where: { tenantId, isActive: true } }),
      this.prisma.auditLog.count({
        where: {
          tenantId,
          resource: 'usage:aiTokens',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    const apiCalls = usageLogs
      .filter((l) => l.resource === 'usage:apiCalls')
      .reduce((sum, l) => sum + Number((l.metadata as { quantity?: number })?.quantity ?? 0), 0);

    const storageMb = usageLogs
      .filter((l) => l.resource === 'usage:storageMb')
      .reduce((sum, l) => sum + Number((l.metadata as { quantity?: number })?.quantity ?? 0), 0);

    const aiTokens = usageLogs
      .filter((l) => l.resource === 'usage:aiTokens')
      .reduce((sum, l) => sum + Number((l.metadata as { quantity?: number })?.quantity ?? 0), 0);

    return {
      tenantId,
      period: 'last_30_days',
      metrics: {
        apiCalls: apiCalls || usageLogs.length,
        storageMb,
        aiTokens: aiTokens || aiLogs,
        ordersProcessed: orders,
        activeProducts: products,
      },
    };
  }
}
