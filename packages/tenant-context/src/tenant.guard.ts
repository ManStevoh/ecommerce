import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { TenantContextService } from './tenant-context.service';

export const TENANT_HEADER = 'x-tenant-id';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantContext: TenantContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string>;
    }>();
    const tenantId =
      request.headers[TENANT_HEADER] ??
      request.headers[TENANT_HEADER.toLowerCase()];

    if (!tenantId?.trim()) {
      throw new BadRequestException(
        `Missing required header: ${TENANT_HEADER}`,
      );
    }

    this.tenantContext.setTenantId(tenantId.trim());
    return true;
  }
}
