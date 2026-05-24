import { httpJson } from '../http/http-client';

export type TenantRecord = {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  customDomain?: string | null;
};

export class TenantServiceClient {
  constructor(private readonly baseUrl: string) {}

  async listTenants(): Promise<TenantRecord[]> {
    return httpJson(`${this.baseUrl}/api/v1/tenants`);
  }

  async getTenantBySubdomain(subdomain: string): Promise<TenantRecord | null> {
    try {
      return await httpJson<TenantRecord>(
        `${this.baseUrl}/api/v1/tenants/by-subdomain/${encodeURIComponent(subdomain)}`,
      );
    } catch {
      return null;
    }
  }
}

export function createTenantServiceClient(baseUrl?: string): TenantServiceClient {
  return new TenantServiceClient(
    baseUrl ?? process.env.API_GATEWAY_URL ?? 'http://localhost:3000',
  );
}
