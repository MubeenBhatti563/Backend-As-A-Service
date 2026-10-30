# ---------- Stage 1: Builder ----------
FROM node:24.18-alpine AS builder

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir  /pnpm/store && \
    pnpm config set network-concurrency 2 && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-timeout 600000 && \
    pnpm  install --frozen-lockfile --config.onlyBuiltDependencies='["unrs-resolver"]'

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter web build

# ---------- Stage 2: Production ----------
FROM node:24.18-alpine AS prod-deps

WORKDIR /workspace

ENV NODE_ENV=production
ENV PORT=4000
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nextjs && \
    adduser -S nextjs -G nextjs

COPY --from=builder \
    --chown=nextjs:nextjs \
    /workspace/app/web/.next/standalone ./

COPY --from=builder \
    --chown=nextjs:nextjs \
    /workspace/app/web/.next/static ./app/web/.next/static

COPY --from=builder \
    --chown=nextjs:nextjs \
    /workspace/app/web/public ./app/web/public

USER nextjs
EXPOSE 4000

CMD ["node", "app/web/server.js"]
