import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OrderServiceClient,
  SubscriptionServiceClient,
} from '@nexora/integrations';
import { TenantStatus } from '@nexora/database';
import { PrismaService } from '../prisma/prisma.service';
import {
  generateSubdomain,
  validateSubdomainFormat,
  ensureUniqueSubdomain,
} from '../common/utils/subdomain.util';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly orderClient: OrderServiceClient,
    private readonly subscriptionClient: SubscriptionServiceClient,
  ) {}

  async provision(dto: CreateTenantDto) {
    const baseSubdomain = generateSubdomain(dto.storeName);
    const validation = validateSubdomainFormat(baseSubdomain);
    if (!validation.valid) {
      throw new ConflictException(validation.reason);
    }

    const subdomain = await ensureUniqueSubdomain(baseSubdomain, async (s) => {
      const existing = await this.prisma.tenant.findUnique({
        where: { subdomain: s },
      });
      return Boolean(existing);
    });

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.storeName.trim(),
        slug: subdomain,
        subdomain,
        ownerId: dto.ownerId,
        status: TenantStatus.ACTIVE,
        storeSettings: {
          create: {
            contactEmail: null,
          },
        },
        themeSettings: {
          create: {},
        },
      },
      include: {
        storeSettings: true,
        themeSettings: true,
      },
    });

    try {
      await this.subscriptionClient.startTrial(tenant.id);
    } catch (err) {
      this.logger.warn(
        `Trial start skipped for ${tenant.id}: ${String(err)}`,
      );
    }

    const baseDomain = this.config.get<string>('baseDomain');

    return {
      tenantId: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      url: `https://${tenant.subdomain}.${baseDomain}`,
      status: tenant.status,
      storeSettings: tenant.storeSettings,
      themeSettings: tenant.themeSettings,
    };
  }

  async validateSubdomain(subdomain: string) {
    const normalized = subdomain.toLowerCase();
    const format = validateSubdomainFormat(normalized);
    if (!format.valid) {
      return { available: false, valid: false, reason: format.reason };
    }

    const existing = await this.prisma.tenant.findUnique({
      where: { subdomain: normalized },
    });

    return {
      available: !existing,
      valid: true,
      subdomain: normalized,
      reason: existing ? 'Subdomain already taken' : undefined,
    };
  }

  async findAll(): Promise<unknown[]> {
    const [tenants, orderCounts] = await Promise.all([
      this.prisma.tenant.findMany({
        include: {
          plan: true,
          storeSettings: true,
          themeSettings: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.orderClient.getOrderCountsByTenant().catch((err) => {
        this.logger.warn(`Order counts unavailable: ${String(err)}`);
        return [] as { tenantId: string; count: number }[];
      }),
    ]);

    const countsByTenant = new Map(
      orderCounts.map((entry) => [entry.tenantId, entry.count]),
    );

    return tenants.map((tenant) => ({
      ...tenant,
      _count: { orders: countsByTenant.get(tenant.id) ?? 0 },
    }));
  }

  async getPlatformStats() {
    const [totalTenants, activeTenants, orderStats, subscriptionStats] =
      await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.tenant.count({ where: { status: TenantStatus.ACTIVE } }),
        this.orderClient.getPlatformOrderCount().catch((err) => {
          this.logger.warn(`Platform order count unavailable: ${String(err)}`);
          return { total: 0 };
        }),
        this.subscriptionClient.getPlatformStats().catch((err) => {
          this.logger.warn(`Platform subscription stats unavailable: ${String(err)}`);
          return { totalMrr: 0, activeCount: 0 };
        }),
      ]);

    return {
      totalTenants,
      activeTenants,
      totalMrr: subscriptionStats.totalMrr,
      totalOrders: orderStats.total,
      growth: 0,
    };
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { storeSettings: true, themeSettings: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findBySubdomain(subdomain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain: subdomain.toLowerCase() },
      include: { storeSettings: true, themeSettings: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateStatus(id: string, status: TenantStatus) {
    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: { status },
    });
    await this.prisma.auditLog.create({
      data: {
        tenantId: id,
        action: 'CONFIG_CHANGE',
        resource: 'tenant',
        resourceId: id,
        metadata: { status },
      },
    });
    return tenant;
  }

  async getAuditLogs(limit = 100) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async mapCustomDomain(tenantId: string, domain: string) {
    const normalized = domain.toLowerCase();
    const existing = await this.prisma.tenant.findFirst({
      where: { customDomain: normalized, id: { not: tenantId } },
    });
    if (existing) {
      throw new ConflictException('Domain already mapped to another tenant');
    }

    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        customDomain: normalized,
        domainVerified: false,
        sslVerified: false,
      },
    });

    return {
      tenantId: tenant.id,
      customDomain: tenant.customDomain,
      domainVerified: tenant.domainVerified,
      sslVerified: tenant.sslVerified,
      dnsRecords: [
        { type: 'CNAME', host: normalized, value: `${tenant.subdomain}.${this.config.get('baseDomain')}` },
        { type: 'TXT', host: `_nexora-verify.${normalized}`, value: `nexora-verify=${tenant.id}` },
      ],
      message: 'Domain mapped. Add DNS records then call POST /domains/verify to confirm ownership.',
    };
  }
}
