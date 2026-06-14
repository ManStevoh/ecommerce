FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY services/search-service/package.json ./services/search-service/
RUN pnpm install --filter @nexora/search-service...

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/search-service/node_modules ./services/search-service/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY services/search-service ./services/search-service
RUN pnpm --filter @nexora/search-service... build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/services/search-service/dist ./dist
COPY --from=build /app/services/search-service/package.json ./
COPY --from=deps /app/services/search-service/node_modules ./node_modules
EXPOSE 3009
CMD ["node", "dist/main.js"]
