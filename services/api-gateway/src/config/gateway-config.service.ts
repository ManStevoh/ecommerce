import { Injectable } from '@nestjs/common';
import { loadGatewayEnv, type GatewayEnv } from '@nexora/config';

@Injectable()
export class GatewayConfigService {
  private readonly env: GatewayEnv;

  constructor() {
    this.env = loadGatewayEnv();
  }

  get nodeEnv(): string {
    return this.env.NODE_ENV;
  }

  get port(): number {
    return this.env.PORT;
  }

  get host(): string {
    return this.env.HOST;
  }

  get jwtSecret(): string {
    return this.env.JWT_SECRET;
  }

  get jwtExpiresIn(): string {
    return this.env.JWT_EXPIRES_IN;
  }

  get corsOrigins(): string[] {
    return this.env.CORS_ORIGINS;
  }

  get rateLimitTtl(): number {
    return this.env.RATE_LIMIT_TTL;
  }

  get rateLimitMax(): number {
    return this.env.RATE_LIMIT_MAX;
  }

  get tenantHeader(): string {
    return this.env.TENANT_HEADER;
  }

  get baseDomain(): string {
    return this.env.BASE_DOMAIN;
  }

  get authServiceUrl(): string {
    return this.env.AUTH_SERVICE_URL;
  }

  get tenantServiceUrl(): string {
    return this.env.TENANT_SERVICE_URL;
  }

  get catalogServiceUrl(): string {
    return this.env.CATALOG_SERVICE_URL;
  }

  get orderServiceUrl(): string {
    return this.env.ORDER_SERVICE_URL;
  }

  get paymentServiceUrl(): string {
    return this.env.PAYMENT_SERVICE_URL;
  }

  get subscriptionServiceUrl(): string {
    return this.env.SUBSCRIPTION_SERVICE_URL;
  }

  get aiServiceUrl(): string {
    return this.env.AI_SERVICE_URL;
  }

  get notificationServiceUrl(): string {
    return this.env.NOTIFICATION_SERVICE_URL;
  }

  get searchServiceUrl(): string {
    return this.env.SEARCH_SERVICE_URL;
  }

  get analyticsServiceUrl(): string {
    return this.env.ANALYTICS_SERVICE_URL;
  }

  get supportServiceUrl(): string {
    return this.env.SUPPORT_SERVICE_URL;
  }

  get marketingServiceUrl(): string {
    return this.env.MARKETING_SERVICE_URL;
  }

  get cmsServiceUrl(): string {
    return this.env.CMS_SERVICE_URL;
  }

  get graphqlServiceUrl(): string {
    return this.env.GRAPHQL_SERVICE_URL;
  }
}
