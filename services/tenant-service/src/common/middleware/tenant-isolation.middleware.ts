import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantIsolationMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const path = req.originalUrl.split('?')[0];
    // Bypass tenant validation for global/platform tenant routes
    if (
      path === '/api/v1/tenants' ||
      path === '/api/tenants' ||
      path === '/api/v1/tenants/platform-stats' ||
      path === '/api/tenants/platform-stats' ||
      path === '/api/v1/tenants/audit-logs' ||
      path === '/api/tenants/audit-logs' ||
      path === '/api/v1/tenants/provision' ||
      path === '/api/tenants/provision' ||
      path === '/api/v1/tenants/validate-subdomain' ||
      path === '/api/tenants/validate-subdomain' ||
      path.startsWith('/api/v1/tenants/by-subdomain/') ||
      path.startsWith('/api/tenants/by-subdomain/') ||
      /^\/api\/(v1\/)?tenants\/[^/]+$/.test(path) ||
      /^\/api\/(v1\/)?tenants\/[^/]+\/status$/.test(path) ||
      // Static reference data — no tenant context needed
      path === '/api/v1/theme-settings/presets' ||
      path === '/api/theme-settings/presets' ||
      path === '/api/v1/theme-settings/layouts' ||
      path === '/api/theme-settings/layouts'
    ) {
      return next();
    }

    const tenantId =
      (req.headers['x-tenant-id'] as string) ??
      req.query.tenantId?.toString();

    const host = req.headers['x-tenant-host'] as string | undefined;
    const subdomainHeader = req.headers['x-tenant-subdomain'] as
      | string
      | undefined;

    let tenant = null;

    if (tenantId) {
      tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    } else if (subdomainHeader) {
      tenant = await this.prisma.tenant.findUnique({
        where: { subdomain: subdomainHeader.toLowerCase() },
      });
    } else if (host) {
      const subdomain = this.extractSubdomain(host);
      if (subdomain) {
        tenant = await this.prisma.tenant.findUnique({
          where: { subdomain },
        });
      } else {
        tenant = await this.prisma.tenant.findFirst({
          where: { customDomain: host.toLowerCase() },
        });
      }
    }

    if (!tenantId && !host && !subdomainHeader) {
      throw new BadRequestException(
        'Tenant context required: provide X-Tenant-Id, X-Tenant-Subdomain, or X-Tenant-Host header',
      );
    }

    if (!tenant) {
      throw new NotFoundException('Tenant not found for provided context');
    }

    req.tenant = {
      tenantId: tenant.id,
      subdomain: tenant.subdomain,
      customDomain: tenant.customDomain,
    };
    req.tenantId = tenant.id;

    next();
  }

  private extractSubdomain(host: string): string | null {
    const normalized = host.split(':')[0].toLowerCase();
    const parts = normalized.split('.');
    if (parts.length < 3) return null;
    const subdomain = parts[0];
    if (subdomain === 'www' || subdomain === 'api') return null;
    return subdomain;
  }
}
