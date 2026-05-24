import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { GatewayConfigService } from '../config/gateway-config.service';
import {
  PLATFORM_PATHS,
  PUBLIC_PATHS,
  TENANT_CONTEXT_KEY,
  TENANT_SLUG_KEY,
} from '../common/constants';
import type { NexoraRequest } from '../common/interfaces';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly config: GatewayConfigService) {}

  use(req: NexoraRequest, res: Response, next: NextFunction): void {
    const path = req.originalUrl.split('?')[0];

    if (path.startsWith('/health')) {
      next();
      return;
    }

    const headerName = this.config.tenantHeader.toLowerCase();
    const headerTenantId = req.headers[headerName] as string | undefined;

    if (headerTenantId) {
      req[TENANT_CONTEXT_KEY] = headerTenantId;
      req.tenantId = headerTenantId;
      next();
      return;
    }

    const subdomain = this.extractSubdomain(req.hostname);

    if (subdomain) {
      req[TENANT_SLUG_KEY] = subdomain;
      req.tenantSlug = subdomain;
      next();
      return;
    }

    if (this.isPublicPath(path, req.method)) {
      next();
      return;
    }

    if (this.isPlatformPath(path)) {
      next();
      return;
    }

    throw new BadRequestException(
      `Tenant context required. Provide ${this.config.tenantHeader} header or use a tenant subdomain.`,
    );
  }

  private extractSubdomain(hostname: string): string | null {
    const baseDomain = this.config.baseDomain;
    const host = hostname.split(':')[0];

    if (host === baseDomain || host === 'localhost' || host === '127.0.0.1') {
      return null;
    }

    if (host.endsWith(`.${baseDomain}`)) {
      const subdomain = host.slice(0, -(baseDomain.length + 1));
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        return subdomain;
      }
    }

    const parts = host.split('.');
    if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'api') {
      return parts[0];
    }

    return null;
  }

  private isPublicPath(path: string, method?: string): boolean {
    if (path === '/api/v1/orders' && method === 'POST') {
      return true;
    }
    return PUBLIC_PATHS.some((p) => p.test(path)) || path.startsWith('/health');
  }

  private isPlatformPath(path: string): boolean {
    return PLATFORM_PATHS.some((p) => p.test(path));
  }
}
