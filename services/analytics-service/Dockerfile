FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY services/analytics-service/package.json ./services/analytics-service/
RUN pnpm install --filter @nexora/analytics-service

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/analytics-service/node_modules ./services/analytics-service/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY services/analytics-service ./services/analytics-service
RUN pnpm --filter @nexora/analytics-service build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/services/analytics-service/dist ./dist
COPY --from=build /app/services/analytics-service/package.json ./
COPY --from=deps /app/services/analytics-service/node_modules ./node_modules
EXPOSE 3010
CMD ["node", "dist/main.js"]
