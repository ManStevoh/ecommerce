FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY services/ai-service/package.json ./services/ai-service/
RUN pnpm install --filter @nexora/ai-service

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/ai-service/node_modules ./services/ai-service/node_modules
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY services/ai-service ./services/ai-service
RUN pnpm --filter @nexora/ai-service build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/services/ai-service/dist ./dist
COPY --from=build /app/services/ai-service/package.json ./
COPY --from=deps /app/services/ai-service/node_modules ./node_modules
EXPOSE 3007
CMD ["node", "dist/main.js"]
