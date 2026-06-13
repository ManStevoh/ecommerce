import { All, Controller, Next, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { NextFunction, Response } from 'express';
import type { NexoraRequest } from '../common/interfaces';
import { ProxyService } from './proxy.service';

@Controller('v1')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All(['auth', 'auth/*'])
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  proxyAuth(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All('*')
  proxyWildcard(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }
}
