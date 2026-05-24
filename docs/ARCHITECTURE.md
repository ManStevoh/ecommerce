# Nexora Commerce — Enterprise Architecture

Production-grade multi-tenant AI-powered SaaS commerce platform (Shopify / BigCommerce scale).

## Platform layers

| Layer | Components |
|-------|------------|
| **Clients** | Storefront :3100, Admin :3200, Super-admin :3300 |
| **API Gateway** | Auth, rate limit, tenant isolation, REST routing :3000 |
| **GraphQL API** | Headless BFF, Apollo Server :3014 → `/graphql` |
| **Microservices** | 15 NestJS services (ports 3001–3014) |
| **Event bus** | `@nexora/event-bus` — BullMQ on Redis |
| **Data** | PostgreSQL, Redis, Meilisearch |
| **Observability** | `@nexora/observability` — JSON logs, correlation IDs, HTTP metrics |

## Microservices map

| Service | Port | Responsibility |
|---------|------|----------------|
| auth-service | 3001 | JWT, RBAC, MFA/OAuth (extensible) |
| tenant-service | 3002 | Tenants, subdomains, domains, platform stats |
| product-service | 3003 | Catalog, inventory, warehouses |
| order-service | 3004 | Orders, event publishing |
| payment-service | 3005 | M-Pesa, Stripe, Paystack, Flutterwave adapters |
| subscription-service | 3006 | Plans, billing, renewals |
| ai-service | 3007 | AI descriptions, SEO, fraud, recommendations |
| notification-service | 3008 | Email/SMS/WhatsApp + event consumers |
| search-service | 3009 | Meilisearch (typo tolerance, facets) |
| analytics-service | 3010 | Revenue, conversion, funnels |
| support-service | 3011 | Tickets, SLA |
| **marketing-service** | 3012 | Campaigns, coupons, segments |
| **cms-service** | 3013 | Pages, landing blocks, media |
| **graphql-api** | 3014 | GraphQL headless API |

## Domain events

Published via `@nexora/event-bus`:

- `order.created` → notification worker (order confirmation email)
- `payment.completed`, `product.updated`, `tenant.provisioned`, …

## Database (30+ models)

Core commerce + enterprise extensions:

- **Marketing:** Campaign, CustomerSegment, Coupon
- **CMS:** Page, ContentBlock, MediaAsset
- **Platform:** ApiKey, AuditLog, EventOutbox (transactional outbox)

## Development phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Core SaaS infra, gateway, auth, tenants | ✅ |
| 2 | Commerce engine (catalog, orders, payments) | ✅ |
| 3 | Marketing, CMS, GraphQL, event bus, search | ✅ (foundation) |
| 4 | AI, analytics pipelines, marketplace | 🔜 |
| 5 | K8s multi-region, SOC2, mobile apps | 🔜 (K8s base manifests started) |

## Kubernetes

Base manifests: `infrastructure/k8s/base/`

```bash
kubectl apply -f infrastructure/k8s/base/
```

## GraphQL

```bash
# Via gateway (tenant-scoped)
POST http://localhost:3000/api/v1/graphql
Headers: x-tenant-id: <uuid>

query { products { id name price } orders { orderNumber status totalAmount } }
```

## API routes (new)

- `GET/POST /api/v1/campaigns`, `/coupons`, `/segments`
- `GET/POST /api/v1/pages`, `/media`
- `POST /api/v1/graphql`

See root `README.md` for quick start.
