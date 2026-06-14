# Nexora Commerce

**Enterprise multi-tenant AI-powered SaaS commerce ecosystem** — engineered for production and international scale (Shopify / BigCommerce / African commerce infrastructure class).

Not an MVP. **API-first**, **headless-ready**, **event-driven**, **cloud-native**.

## Platform stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind, ShadCN, TanStack Query |
| Backend | NestJS microservices (15 services) |
| APIs | REST (gateway) + GraphQL (Apollo) |
| Data | PostgreSQL, Redis, Meilisearch |
| Events | BullMQ via `@nexora/event-bus` |
| Infra | Docker Compose, Kubernetes base manifests |

Full architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Implemented capabilities

| Capability | Status |
|------------|--------|
| Multi-tenant SaaS (subdomains, isolation) | ✅ |
| API Gateway (JWT, rate limit, tenant routing) | ✅ |
| Auth (register, login, JWT, RBAC) | ✅ |
| Commerce (products, orders, payments, subscriptions) | ✅ |
| **Marketing** (campaigns, coupons, segments) | ✅ |
| **CMS** (pages, drag-drop blocks, media) | ✅ |
| **GraphQL headless API** | ✅ |
| **Event bus** (order → notification pipeline) | ✅ |
| **Meilisearch** (real client, tenant indexes) | ✅ |
| Support tickets (persisted) | ✅ |
| Observability (correlation IDs, structured logs) | ✅ |
| Super-admin + store admin + storefront | ✅ |
| **Platform marketing site** (CMS from super-admin) | ✅ |
| Prisma schema (30 models) + migrations | ✅ |
| K8s base manifests | ✅ |

## Architecture

```text
Clients → API Gateway :3000 → 15 Microservices
              │
              ├── GraphQL :3014 (/graphql)
              ├── REST /api/v1/*
              └── Event Bus (Redis/BullMQ)
                        │
        PostgreSQL + Redis + Meilisearch
```

## Quick start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop (Postgres, Redis, Meilisearch)

### Install & run

```bash
pnpm install
pnpm docker:up
pnpm db:push
pnpm db:generate
pnpm db:seed
pnpm dev:core        # backend services
pnpm dev:frontends   # Next.js apps
```

### Environment

```bash
copy .env.example .env
copy services\api-gateway\.env.example services\api-gateway\.env
```

Storefront / admin `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_TENANT_ID=<from-seed-output>
```

### Apps

| App | URL |
|-----|-----|
| API Gateway | http://localhost:3000/health |
| GraphQL (via gateway) | POST http://localhost:3000/api/v1/graphql |
| Storefront | http://localhost:3100 |
| Store admin | http://localhost:3200/login |
| Super admin | http://localhost:3300/login |
| **Platform site** (pre-subscribe landing) | http://localhost:3400 |

### Seed credentials

| Role | Email | Password |
|------|-------|----------|
| Super admin | admin@nexora.cloud | Admin123! |
| Store owner | owner@freshfish.demo | Admin123! |

## Service ports

| Service | Port |
|---------|------|
| api-gateway | 3000 |
| auth-service | 3001 |
| tenant-service | 3002 |
| product-service | 3003 |
| order-service | 3004 |
| payment-service | 3005 |
| subscription-service | 3006 |
| ai-service | 3007 |
| notification-service | 3008 |
| search-service | 3009 |
| analytics-service | 3010 |
| support-service | 3011 |
| **marketing-service** | **3012** |
| **cms-service** | **3013** |
| **graphql-api** | **3014** |

## API examples

```bash
# GraphQL products
curl -X POST http://localhost:3000/api/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: <tenant-id>" \
  -d "{\"query\":\"{ products { id name price } }\"}"

# Create coupon
curl -X POST http://localhost:3000/api/v1/coupons \
  -H "Authorization: Bearer <token>" \
  -H "x-tenant-id: <tenant-id>" \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"SAVE10\",\"type\":\"PERCENTAGE\",\"value\":10}"

# CMS landing page
curl -X POST http://localhost:3000/api/v1/pages \
  -H "Authorization: Bearer <token>" \
  -H "x-tenant-id: <tenant-id>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Home\",\"slug\":\"home\",\"blocks\":[{\"type\":\"HERO\",\"sortOrder\":0,\"config\":{\"headline\":\"Welcome\"}}]}"
```

## Roadmap (enterprise phases)

| Phase | Focus |
|-------|-------|
| **1–2** | Core SaaS + commerce engine | ✅ |
| **3** | Marketing, CMS, GraphQL, events, search | ✅ foundation |
| **4** | Live payments (M-Pesa Daraja, Stripe), OpenAI, analytics warehouse |
| **5** | Multi-region K8s, theme marketplace, mobile apps, SOC2 |

## License

Proprietary — Nexora Commerce.
