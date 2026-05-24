import { All, Controller, Next, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { NextFunction, Response } from 'express';
import type { NexoraRequest } from '../common/interfaces';
import { ProxyService } from './proxy.service';

@Controller('v1')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All(['auth', 'auth/*path'])
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  proxyAuth(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['tenants', 'tenants/*path'])
  proxyTenants(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['catalog', 'catalog/*path', 'products', 'products/*path', 'categories', 'categories/*path', 'brands', 'brands/*path'])
  proxyCatalog(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['orders', 'orders/*path'])
  proxyOrders(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['payments', 'payments/*path'])
  proxyPayments(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['subscriptions', 'subscriptions/*path', 'plans', 'plans/*path', 'trials', 'trials/*path'])
  proxySubscriptions(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['ai', 'ai/*path'])
  proxyAi(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['notifications', 'notifications/*path'])
  proxyNotifications(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['search', 'search/*path'])
  proxySearch(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['analytics', 'analytics/*path'])
  proxyAnalytics(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['tickets', 'tickets/*path', 'support', 'support/*path'])
  proxySupport(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['campaigns', 'campaigns/*path', 'coupons', 'coupons/*path', 'segments', 'segments/*path'])
  proxyMarketing(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['pages', 'pages/*path', 'media', 'media/*path'])
  proxyCms(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }

  @All(['graphql', 'graphql/*path'])
  proxyGraphql(
    @Req() req: NexoraRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): void {
    this.proxyService.forward(req, res, next);
  }
}
