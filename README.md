# Backend-As-A-Service (BaaS)

A full-stack Backend-as-a-Service platform monorepo. It provides a NestJS API for user authentication, project management, API keys, and subscription plans, alongside a Next.js web application for marketing pages and a user dashboard.

## Tech Stack

| Layer | Technology |
|---|---|
| API | [NestJS 12](https://nestjs.com) on Fastify, Prisma 7 (PostgreSQL adapter), Passport JWT, BullMQ, Zod, Swagger |
| Web | [Next.js 16](https://nextjs.org) (App Router), React 19, MUI 9, TanStack Query, Zustand, react-hook-form |
| Database | PostgreSQL 18 + Prisma ORM |
| Cache / Queues | Redis 7 (sessions, rate limiting, email job queue via BullMQ) |
| Shared | `@baas/types` — shared TypeScript types consumed by both apps |
| Tooling | pnpm workspaces, oxlint / ESLint, Jest, Docker Compose, GitHub Actions CI |

## Repository Structure

```
.
├── app/
│   ├── api/          # NestJS backend (auth, projects, plans, workers, infra)
│   │   ├── prisma/   # Schema, migrations, seed script
│   │   └── src/
│   │       ├── common/    # Response interceptors, exception filters
│   │       ├── infra/     # Prisma, Redis, Email (Resend) services
│   │       ├── modules/   # auth, project, plan feature modules
│   │       └── workers/   # BullMQ email processors
│   └── web/          # Next.js frontend
│       └── src/
│           ├── app/          # Routes: landing page, /auth, /dashboard, /upgrade
│           ├── components/   # Layout, common UI, home-page sections
│           ├── features/     # auth & projects feature code
│           └── lib/, stores/, theme/ ...
├── packages/
│   └── types/        # @baas/types — shared API/domain types
└── docker-compose.yaml  # db, redis, api, web services
```

## Domain Model

The Prisma schema covers: `PlatformUser`, `Project`, `ApiKey`, `Session`, `VerificationToken`, `Plan`, `Subscription`, `ProjectUsage`, and `ActivityLog` — supporting multi-tenant projects with per-project API keys, device-aware sessions, and plan-based subscriptions.

## Getting Started

### Prerequisites

- Node.js ≥ 24
- pnpm 12 (`corepack enable` or `npm i -g pnpm@12`)
- Docker (for local Postgres/Redis) — or your own instances

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Create `app/api/.env` (used directly by docker-compose too). Typical variables:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=baas_db
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/baas_db?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=change-me

# Auth
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Misc
CORS_ORIGINS=http://localhost:4000
RESEND_API_KEY=...
```

And `app/web/.env` with `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1`.

### 3. Start infrastructure

```bash
docker compose up -d db cache
```

### 4. Run migrations & seed

```bash
pnpm db:generate   # prisma generate
pnpm db:migrate    # prisma migrate dev
```

### 5. Run in development

```bash
pnpm dev           # runs api (:3000) and web (:4000) in parallel
pnpm dev:api       # API only
pnpm dev:web       # Web only
```

- API: http://localhost:3000/api/v1
- API docs (Swagger): http://localhost:3000/api/v1/docs
- Web: http://localhost:4000

## Full Stack with Docker

```bash
docker compose up --build
```

This starts Postgres, Redis, the API (port 3000), and the web app (port 4000) with health-check-based startup ordering.

## Scripts (root)

| Command | Description |
|---|---|
| `pnpm dev` | Run API and web in parallel (dev mode) |
| `pnpm build` | Build both apps |
| `pnpm lint` | Lint API (oxlint) and web (ESLint) |
| `pnpm test` / `pnpm test:api` | Run API unit tests (Jest) |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run/create Prisma migrations |

## API Highlights

- Global prefix `/api/v1`, OpenAPI docs at `/api/v1/docs`
- Session + JWT (access/refresh) auth with Argon2 password hashing
- Redis-backed session store and rate limiting (`@nestjs/throttler` + Redis storage)
- Transactional emails (verification, password reset) via Resend + BullMQ workers
- Consistent response envelope via a transform interceptor and global exception filter

## CI

GitHub Actions (`.github/workflows/ci.yml`) installs with `--frozen-lockfile`, then runs lint, builds shared types and apps against a Postgres service.
