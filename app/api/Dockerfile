# ---------- Stage 1: Builder ----------
FROM node:24.18-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm config set network-concurrency 2 && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-timeout 600000 && \
    pnpm install --frozen-lockfile --config.onlyBuiltDependencies='["unrs-resolver", "@prisma/engines", "prisma"]'

COPY . .

# Generate Prisma Client (uses devDependency CLI)
RUN pnpm prisma generate

# Build NestJS production output
RUN pnpm run build

# Prune devDependencies to leave only production node_modules
RUN pnpm prune --prod

# ---------- Stage 2: Runner ----------
FROM node:24.18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apprunner

# Copy pruned production node_modules & package.json
COPY --from=builder /app/node_modules ./node_modules

# Copy the generated Prisma client engine binaries (lives in .prisma, not @prisma/client)
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/package.json ./package.json

# Copy Prisma schema/migrations, config & compiled NestJS dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/dist ./dist

USER apprunner

EXPOSE 3000

# Run migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
