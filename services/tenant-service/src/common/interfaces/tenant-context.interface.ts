export interface TenantContext {
  tenantId: string;
  subdomain: string;
  customDomain?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
      tenantId?: string;
    }
  }
}
