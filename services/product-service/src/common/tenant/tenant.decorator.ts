import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TENANT_HEADER } from './tenant.guard';

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    return (
      request.headers[TENANT_HEADER] ?? request.headers[TENANT_HEADER.toLowerCase()] ?? ''
    ).trim();
  },
);
