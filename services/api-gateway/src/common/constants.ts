export const TENANT_CONTEXT_KEY = 'tenantId';
export const TENANT_SLUG_KEY = 'tenantSlug';
export const JWT_PAYLOAD_KEY = 'user';
export const IS_PUBLIC_KEY = 'isPublic';

/** Routes that require JWT but not tenant context (platform super-admin). */
export const PLATFORM_PATHS: RegExp[] = [
  /^\/api\/v1\/tenants$/,
  /^\/api\/v1\/tenants\/platform-stats$/,
  /^\/api\/v1\/tenants\/provision$/,
  /^\/api\/v1\/tenants\/audit-logs$/,
  /^\/api\/v1\/tenants\/[^/]+\/status$/,
  /^\/api\/v1\/subscriptions\/platform$/,
  /^\/api\/v1\/subscriptions\/platform\/stats$/,
  /^\/api\/v1\/plans\/admin\/all$/,
  /^\/api\/v1\/plans\/admin$/,
  /^\/api\/v1\/plans\/admin\/[^/]+$/,
  /^\/api\/v1\/platform\//,
  /^\/api\/v1\/graphql$/,
];

export const PUBLIC_PATHS: RegExp[] = [
  /^\/health$/,
  /^\/health\//,
  /^\/api\/v1\/auth\/login$/,
  /^\/api\/v1\/auth\/register$/,
  /^\/api\/v1\/auth\/refresh$/,
  /^\/api\/v1\/auth\/forgot-password$/,
  /^\/api\/v1\/auth\/reset-password$/,
  /^\/api\/v1\/auth\/oauth\//,
  /^\/api\/v1\/tenants\/by-subdomain\//,
  /^\/api\/v1\/tenants\/validate-subdomain$/,
  /^\/api\/v1\/products$/,
  /^\/api\/v1\/catalog\/products$/,
  /^\/api\/v1\/categories$/,
  /^\/api\/v1\/catalog\/categories$/,
  /^\/api\/v1\/plans$/,
  /^\/api\/v1\/search\/products$/,
  /^\/api\/v1\/search\/index$/,
  /^\/api\/v1\/payments$/,
  /^\/api\/v1\/payments\/mpesa\/stk-push$/,
  /^\/api\/v1\/webhooks\//,
  /^\/api\/v1\/providers$/,
  /^\/api\/v1\/pages\/by-slug\//,
  /^\/api\/v1\/platform\/pages\/public\//,
  /^\/api\/v1\/platform\/site\/public$/,
  /^\/api\/v1\/ai\/recommendations$/,
  /^\/api\/v1\/ai\/tickets\/classify$/,
  /^\/api\/v1\/reviews$/,
  /^\/api\/v1\/media\/files\//,
  /^\/api\/v1\/tickets$/,
  /^\/api\/v1\/orders\/public\//,
  /^\/api\/v1\/theme-settings\/presets$/,
  /^\/api\/v1\/theme-settings\/layouts$/,
];
