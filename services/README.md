# Nexora Commerce Microservices

NestJS services for the commerce domain. All tenant-scoped APIs require the `x-tenant-id` header unless marked `@Public()`.

| Service | Port | Package |
|---------|------|---------|
| product-service | 3003 | `@nexora/product-service` |
| order-service | 3004 | `@nexora/order-service` |
| payment-service | 3005 | `@nexora/payment-service` |
| subscription-service | 3006 | `@nexora/subscription-service` |

## Run locally

```bash
pnpm install
pnpm --filter @nexora/database db:generate
pnpm --filter @nexora/product-service dev
```
