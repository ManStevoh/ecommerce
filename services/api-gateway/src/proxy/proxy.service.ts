import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createProxyMiddleware, fixRequestBody, type Options } from 'http-proxy-middleware';
import type { NextFunction, RequestHandler, Response } from 'express';
import type { ServerResponse } from 'http';
import { GatewayConfigService } from '../config/gateway-config.service';
import {
  PROXY_ROUTES,
  type ProxyRoute,
  type ProxyServiceTargets,
} from './proxy.routes';
import type { NexoraRequest } from '../common/interfaces';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly proxies = new Map<string, RequestHandler>();
  private readonly targets: ProxyServiceTargets;

  constructor(private readonly config: GatewayConfigService) {
    this.targets = {
      auth: config.authServiceUrl,
      tenant: config.tenantServiceUrl,
      catalog: config.catalogServiceUrl,
      order: config.orderServiceUrl,
      payment: config.paymentServiceUrl,
      subscription: config.subscriptionServiceUrl,
      ai: config.aiServiceUrl,
      notification: config.notificationServiceUrl,
      search: config.searchServiceUrl,
      analytics: config.analyticsServiceUrl,
      support: config.supportServiceUrl,
      marketing: config.marketingServiceUrl,
      cms: config.cmsServiceUrl,
      graphql: config.graphqlServiceUrl,
    };

    const registered = new Set<string>();

    for (const route of PROXY_ROUTES) {
      const target = this.targets[route.targetEnvKey];
      const key = `${route.prefix}:${route.targetEnvKey}`;

      if (!registered.has(key)) {
        this.proxies.set(route.prefix, this.createProxy(target, route));
        registered.add(key);
        this.logger.log(`Registered proxy: ${route.prefix} -> ${target}`);
      }
    }
  }

  getProxyHandler(path: string): RequestHandler | null {
    const route = this.resolveRoute(path);
    if (!route) {
      return null;
    }
    return this.proxies.get(route.prefix) ?? null;
  }

  resolveRoute(path: string): ProxyRoute | null {
    const normalized = path.split('?')[0];
    const sorted = [...PROXY_ROUTES].sort(
      (a, b) => b.prefix.length - a.prefix.length,
    );
    return sorted.find((route) => normalized.startsWith(route.prefix)) ?? null;
  }

  forward(
    req: NexoraRequest,
    res: Response,
    next: NextFunction,
  ): void {
    const path = req.originalUrl;
    const handler = this.getProxyHandler(path);

    if (!handler) {
      throw new NotFoundException(
        `No upstream service configured for path: ${path}`,
      );
    }

    handler(req, res, next);
  }

  private createProxy(target: string, route: ProxyRoute): RequestHandler {
    const pathRewrite: Record<string, string> = {};
    if (route.stripPrefix && route.rewritePrefix) {
      pathRewrite[`^${route.prefix}`] = route.rewritePrefix;
    } else if (route.stripPrefix) {
      pathRewrite[`^${route.prefix}`] = '';
    }

    const options: Options = {
      target,
      changeOrigin: true,
      pathRewrite:
        Object.keys(pathRewrite).length > 0 ? pathRewrite : undefined,
      on: {
        proxyReq: (proxyReq, req) => {
          const nexoraReq = req as NexoraRequest;
          const tenantHeader = this.config.tenantHeader;

          if (nexoraReq.tenantId) {
            proxyReq.setHeader(tenantHeader, nexoraReq.tenantId);
          }

          if (nexoraReq.tenantSlug) {
            proxyReq.setHeader('x-tenant-slug', nexoraReq.tenantSlug);
          }

          if (nexoraReq.user) {
            proxyReq.setHeader('x-user-id', nexoraReq.user.sub);
            proxyReq.setHeader('x-user-email', nexoraReq.user.email);
            proxyReq.setHeader('x-user-role', nexoraReq.user.role);
          }

          const requestId = req.headers['x-request-id'];
          if (requestId) {
            proxyReq.setHeader('x-request-id', requestId as string);
          }

          if ((req as any).body) {
            fixRequestBody(proxyReq, req);
          }
        },
        error: (err, _req, res) => {
          this.logger.error(`Proxy error for ${route.prefix}: ${err.message}`);
          if ('writeHead' in res && !res.headersSent) {
            (res as ServerResponse).writeHead(502, {
              'Content-Type': 'application/json',
            });
            (res as ServerResponse).end(
              JSON.stringify({
                success: false,
                error: {
                  code: 'BAD_GATEWAY',
                  message: 'Upstream service unavailable',
                },
                timestamp: new Date().toISOString(),
              }),
            );
          }
        },
      },
    };

    return createProxyMiddleware(options);
  }
}
