/** Logical ownership of Prisma models per microservice (shared DB today). */
export const SCHEMA_DOMAINS = {
  platform: [
    'Tenant',
    'User',
    'Plan',
    'Subscription',
    'EventOutbox',
    'RefreshToken',
    'Session',
  ],
  tenant: ['StoreSettings', 'ThemeSettings', 'Domain'],
  catalog: [
    'Product',
    'ProductVariant',
    'Category',
    'Brand',
    'ProductAttribute',
    'Warehouse',
    'InventoryLevel',
    'ProductReview',
    'WishlistItem',
  ],
  order: [
    'Order',
    'OrderItem',
    'AbandonedCart',
    'Invoice',
    'Fulfillment',
    'Return',
    'Refund',
  ],
  marketing: ['Campaign', 'Coupon', 'CustomerSegment'],
  cms: ['Page', 'ContentBlock', 'MediaAsset'],
  payment: ['Payment', 'PaymentMethod'],
} as const;

export type SchemaDomain = keyof typeof SCHEMA_DOMAINS;

export function serviceForModel(model: string): SchemaDomain | 'unknown' {
  for (const [domain, models] of Object.entries(SCHEMA_DOMAINS)) {
    if ((models as readonly string[]).includes(model)) {
      return domain as SchemaDomain;
    }
  }
  return 'unknown';
}
