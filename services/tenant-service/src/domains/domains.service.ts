import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as dns } from 'dns';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { MapDomainDto } from '../tenants/dto/map-domain.dto';

@Injectable()
export class DomainsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantsService: TenantsService,
  ) {}

  async mapDomain(tenantId: string, dto: MapDomainDto) {
    return this.tenantsService.mapCustomDomain(tenantId, dto.domain);
  }

  async verifyDomain(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant?.customDomain) {
      throw new NotFoundException('No custom domain configured');
    }

    const verified = await this.checkDnsVerification(
      tenant.customDomain,
      tenant.id,
    );

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { domainVerified: verified },
    });

    return {
      tenantId: updated.id,
      domain: updated.customDomain,
      domainVerified: updated.domainVerified,
      message: verified
        ? 'Domain TXT record verified'
        : 'Add TXT record _nexora-verify with nexora-verify=<tenantId>',
    };
  }

  async verifySsl(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const sslVerified = Boolean(tenant.customDomain && tenant.domainVerified);

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { sslVerified },
    });

    return {
      tenantId: updated.id,
      domain: updated.customDomain ?? `${updated.subdomain}.nexora.store`,
      sslVerified: updated.sslVerified,
      certificateStatus: sslVerified ? 'issued_dev' : 'pending',
      message: sslVerified
        ? 'SSL marked active for verified domain (use ACME in production)'
        : 'Verify domain DNS before issuing SSL',
    };
  }

  private async checkDnsVerification(
    domain: string,
    tenantId: string,
  ): Promise<boolean> {
    const expected = `nexora-verify=${tenantId}`;
    try {
      const records = await dns.resolveTxt(`_nexora-verify.${domain}`);
      return records.some((entry) =>
        entry.some((part) => part.includes(expected)),
      );
    } catch {
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      return false;
    }
  }
}
