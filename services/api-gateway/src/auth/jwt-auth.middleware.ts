import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Response } from 'express';
import type { JwtPayload } from '@nexora/shared-types';
import { PUBLIC_PATHS } from '../common/constants';
import type { NexoraRequest } from '../common/interfaces';

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: NexoraRequest, res: Response, next: NextFunction): void {
    const path = req.originalUrl.split('?')[0];

    if (this.isPublicPath(path, req.method)) {
      req.isPublic = true;
      next();
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      if (req.tenantId && payload.tenantId !== req.tenantId) {
        throw new UnauthorizedException(
          'Token tenant does not match request tenant context',
        );
      }

      req.user = payload;
      next();
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private isPublicPath(path: string, method?: string): boolean {
    if (path === '/api/v1/orders' && method === 'POST') {
      return true;
    }
    return PUBLIC_PATHS.some((pattern) => pattern.test(path));
  }
}
