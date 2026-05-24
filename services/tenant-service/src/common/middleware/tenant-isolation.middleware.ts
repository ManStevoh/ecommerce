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
