FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY services/notification-service/package.json ./services/notification-service/
RUN pnpm install --filter @nexora/notification-service...

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/notification-service/node_modules ./services/notification-service/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY services/notification-service ./services/notification-service
RUN pnpm --filter @nexora/notification-service... build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/services/notification-service/dist ./dist
COPY --from=build /app/services/notification-service/package.json ./
COPY --from=deps /app/services/notification-service/node_modules ./node_modules
EXPOSE 3008
CMD ["node", "dist/main.js"]
