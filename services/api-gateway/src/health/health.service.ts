import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GatewayConfigService } from '../config/gateway-config.service';

export interface ServiceHealth {
  name: string;
  url: string;
  status: 'up' | 'down';
  latencyMs?: number;
  error?: string;
}

export interface GatewayHealth {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  uptime: number;
  timestamp: string;
  services: ServiceHealth[];
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(private readonly config: GatewayConfigService) {}

  async check(): Promise<GatewayHealth> {
    const services = await Promise.all([
      this.pingService('auth', this.config.authServiceUrl),
      this.pingService('tenant', this.config.tenantServiceUrl),
      this.pingService('catalog', this.config.catalogServiceUrl),
      this.pingService('order', this.config.orderServiceUrl),
      this.pingService('payment', this.config.paymentServiceUrl),
      this.pingService('subscription', this.config.subscriptionServiceUrl),
      this.pingService('ai', this.config.aiServiceUrl),
      this.pingService('notification', this.config.notificationServiceUrl),
      this.pingService('search', this.config.searchServiceUrl),
      this.pingService('analytics', this.config.analyticsServiceUrl),
      this.pingService('support', this.config.supportServiceUrl),
    ]);

    const downCount = services.filter((s) => s.status === 'down').length;
    let status: GatewayHealth['status'] = 'ok';

    if (downCount === services.length) {
      status = 'error';
    } else if (downCount > 0) {
      status = 'degraded';
    }

    return {
      status,
      version: '0.1.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      services,
    };
  }

  liveness(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  private async pingService(
    name: string,
    url: string,
  ): Promise<ServiceHealth> {
    const healthUrl = `${url.replace(/\/$/, '')}/health`;
    const start = Date.now();

    try {
      await axios.get(healthUrl, { timeout: 3000 });
      return {
        name,
        url: healthUrl,
        status: 'up',
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return {
        name,
        url: healthUrl,
        status: 'down',
        error: message,
      };
    }
  }
}
