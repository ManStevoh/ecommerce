import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const role = request.headers['x-user-role'];
    if (role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Platform admin access required');
    }
    return true;
  }
}
