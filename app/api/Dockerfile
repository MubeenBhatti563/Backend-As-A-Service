# ---------- Stage 1: Builder ----------
FROM node:24.18-alpine AS builder

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@12.6.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm config set network-concurrency 2 && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-timeout 600000 && \
    pnpm install --frozen-lockfile --config.onlyBuiltDependencies='["unrs-resolver", "@prisma/engines", "prisma"]'

COPY . .

# Generate Prisma Client (uses devDependency CLI)
RUN pnpm --filter api exec prisma generate

# Build NestJS production output
RUN pnpm --filter api build

# Prune devDependencies to leave only production node_modules
RUN pnpm --filter api deploy --prod --legacy /prod/api

# ---------- Stage 2: Runner ----------
FROM node:24.18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apprunner

COPY --from=builder /prod/api ./
COPY --from=builder /workspace/app/api/dist ./dist
COPY --from=builder /workspace/app/api/prisma ./prisma
COPY --from=builder /workspace/app/api/prisma.config.ts ./prisma.config.ts

USER apprunner

EXPOSE 3000

# Run migrations then start the app
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/main.js"]
