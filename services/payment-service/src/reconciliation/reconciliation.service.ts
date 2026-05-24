import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';

@Injectable()
export class ReconciliationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async reconcileStalePending(maxAgeHours = 48) {
    const tenantId = this.tenantContext.getTenantId();
    const cutoff = new Date(Date.now() - maxAgeHours * 3600000);

    const stale = await this.prisma.payment.findMany({
      where: {
        tenantId,
        status: PaymentStatus.PENDING,
        createdAt: { lt: cutoff },
      },
    });

    let markedFailed = 0;
    for (const payment of stale) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      markedFailed += 1;
    }

    const summary = await this.prisma.payment.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { id: true },
    });

    return {
      tenantId,
      markedFailed,
      staleChecked: stale.length,
      summary: summary.map((row) => ({
        status: row.status,
        count: row._count.id,
      })),
    };
  }
}
