FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY services/support-service/package.json ./services/support-service/
RUN pnpm install --filter @nexora/support-service

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/support-service/node_modules ./services/support-service/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY services/support-service ./services/support-service
RUN pnpm --filter @nexora/support-service build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/services/support-service/dist ./dist
COPY --from=build /app/services/support-service/package.json ./
COPY --from=deps /app/services/support-service/node_modules ./node_modules
EXPOSE 3011
CMD ["node", "dist/main.js"]
