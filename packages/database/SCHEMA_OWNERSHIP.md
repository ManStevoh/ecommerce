# Database schema ownership

Nexora uses a **single PostgreSQL database** with one Prisma schema (`packages/database/prisma/schema.prisma`). Models are grouped by **logical service domain** for future extraction.

| Domain | Service | Models |
|--------|---------|--------|
| `platform` | auth, subscription | Tenant, User, EventOutbox, … |
| `tenant` | tenant-service | ThemeSettings, StoreSettings, Domain |
| `catalog` | product-service | Product, ProductVariant, InventoryLevel, … |
| `order` | order-service | Order, OrderItem, AbandonedCart, … |
| `marketing` | marketing-service | Campaign, Coupon, CustomerSegment |
| `cms` | cms-service | Page, ContentBlock, MediaAsset |
| `payment` | payment-service | Payment, PaymentMethod |

Programmatic map: `packages/database/src/schema-domains.ts`.

## Event outbox

`EventOutbox` stores domain events written in the same transaction as business data. The order-service `OutboxPublisher` drains pending rows into BullMQ via `@nexora/event-bus`.

## Future: per-service databases

To split databases later:

1. Move each domain’s models into a dedicated Prisma schema package.
2. Replace cross-service FKs with IDs + integration clients (already used for stock).
3. Run migrations per database; keep `EventOutbox` in the writer service or a shared platform DB.
