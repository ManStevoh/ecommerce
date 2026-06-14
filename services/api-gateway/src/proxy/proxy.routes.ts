export interface ProxyRoute {
  prefix: string;
  targetEnvKey: keyof ProxyServiceTargets;
  stripPrefix: boolean;
  rewritePrefix?: string;
}

export interface ProxyServiceTargets {
  auth: string;
  tenant: string;
  catalog: string;
  order: string;
  payment: string;
  subscription: string;
  ai: string;
  notification: string;
  search: string;
  analytics: string;
  support: string;
  marketing: string;
  cms: string;
  graphql: string;
}

export const PROXY_ROUTES: ProxyRoute[] = [
  { prefix: '/api/v1/auth', targetEnvKey: 'auth', stripPrefix: false },
  { prefix: '/api/v1/tenants', targetEnvKey: 'tenant', stripPrefix: false },
  { prefix: '/api/v1/store-settings', targetEnvKey: 'tenant', stripPrefix: false },
  { prefix: '/api/v1/theme-settings', targetEnvKey: 'tenant', stripPrefix: false },
  { prefix: '/api/v1/domains', targetEnvKey: 'tenant', stripPrefix: false },
  {
    prefix: '/api/v1/catalog',
    targetEnvKey: 'catalog',
    stripPrefix: true,
    rewritePrefix: '/api/v1/products',
  },
  { prefix: '/api/v1/products', targetEnvKey: 'catalog', stripPrefix: false },
  { prefix: '/api/v1/categories', targetEnvKey: 'catalog', stripPrefix: false },
  { prefix: '/api/v1/brands', targetEnvKey: 'catalog', stripPrefix: false },
  { prefix: '/api/v1/attributes', targetEnvKey: 'catalog', stripPrefix: false },
  { prefix: '/api/v1/variants', targetEnvKey: 'catalog', stripPrefix: false },
  { prefix: '/api/v1/inventory', targetEnvKey: 'catalog', stripPrefix: false },
  { prefix: '/api/v1/warehouses', targetEnvKey: 'catalog', stripPrefix: false },
  { prefix: '/api/v1/reviews', targetEnvKey: 'catalog', stripPrefix: false },
  { prefix: '/api/v1/wishlist', targetEnvKey: 'catalog', stripPrefix: false },
  { prefix: '/api/v1/orders', targetEnvKey: 'order', stripPrefix: false },
  { prefix: '/api/v1/fulfillment', targetEnvKey: 'order', stripPrefix: false },
  { prefix: '/api/v1/refunds', targetEnvKey: 'order', stripPrefix: false },
  { prefix: '/api/v1/returns', targetEnvKey: 'order', stripPrefix: false },
  { prefix: '/api/v1/invoices', targetEnvKey: 'order', stripPrefix: false },
  { prefix: '/api/v1/cart-conversion', targetEnvKey: 'order', stripPrefix: false },
  { prefix: '/api/v1/abandoned-carts', targetEnvKey: 'order', stripPrefix: false },
  { prefix: '/api/v1/outbox', targetEnvKey: 'order', stripPrefix: false },
  { prefix: '/api/v1/payments', targetEnvKey: 'payment', stripPrefix: false },
  { prefix: '/api/v1/providers', targetEnvKey: 'payment', stripPrefix: false },
  { prefix: '/api/v1/webhooks', targetEnvKey: 'payment', stripPrefix: false },
  { prefix: '/api/v1/subscriptions', targetEnvKey: 'subscription', stripPrefix: false },
  { prefix: '/api/v1/plans', targetEnvKey: 'subscription', stripPrefix: false },
  { prefix: '/api/v1/trials', targetEnvKey: 'subscription', stripPrefix: false },
  { prefix: '/api/v1/renewals', targetEnvKey: 'subscription', stripPrefix: false },
  { prefix: '/api/v1/usage', targetEnvKey: 'subscription', stripPrefix: false },
  { prefix: '/api/v1/ai', targetEnvKey: 'ai', stripPrefix: false },
  { prefix: '/api/v1/notifications', targetEnvKey: 'notification', stripPrefix: false },
  { prefix: '/api/v1/events', targetEnvKey: 'notification', stripPrefix: false },
  { prefix: '/api/v1/search', targetEnvKey: 'search', stripPrefix: false },
  { prefix: '/api/v1/analytics', targetEnvKey: 'analytics', stripPrefix: false },
  { prefix: '/api/v1/tickets', targetEnvKey: 'support', stripPrefix: false },
  { prefix: '/api/v1/campaigns', targetEnvKey: 'marketing', stripPrefix: false },
  { prefix: '/api/v1/coupons', targetEnvKey: 'marketing', stripPrefix: false },
  { prefix: '/api/v1/segments', targetEnvKey: 'marketing', stripPrefix: false },
  { prefix: '/api/v1/pages', targetEnvKey: 'cms', stripPrefix: false },
  { prefix: '/api/v1/platform', targetEnvKey: 'cms', stripPrefix: false },
  { prefix: '/api/v1/media', targetEnvKey: 'cms', stripPrefix: false },
  {
    prefix: '/api/v1/graphql',
    targetEnvKey: 'graphql',
    stripPrefix: true,
    rewritePrefix: '/graphql',
  },
];
