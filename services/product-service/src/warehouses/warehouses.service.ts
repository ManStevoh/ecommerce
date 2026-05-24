import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  findAll() {
    return this.prisma.warehouse.findMany({
      where: { tenantId: this.tenantContext.getTenantId() },
      orderBy: { name: 'asc' },
    });
  }
}
