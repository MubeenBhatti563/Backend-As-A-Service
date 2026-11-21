# Authentication Strategy: Canonical Auth vs API Auth

This document outlines the authentication architecture and threat model for the BaaS platform.

## 1. Canonical Authentication: Dashboard / Web Client
- **Mechanism**: Stateful HTTP-only Cookie (`sessionId`)
- **Engine**: Fastify Session (`@fastify/session`) backed by `RedisSessionStore` and tracked in PostgreSQL (`sessions` table).
- **Endpoint**: `POST /api/v1/auth/login`
- **Security Flags**:
  - `httpOnly`: `true` (prohibits JavaScript access; mitigates XSS token theft).
  - `sameSite`: Configurable via `COOKIE_SAME_SITE` (`lax` in development, `none` or `strict` depending on multi-domain architecture in production).
  - `secure`: `true` in production (`COOKIE_SECURE=true`), ensuring transmission only over HTTPS.
  - `rolling`: `false` with explicit TTL renewal via `@Post('/auth/heartbeat')`.
  - Fail-fast enforcement: The server fails to boot in production if `SESSION_SECRET` is missing or shorter than 32 characters.

### Session Lifecycle & Alignment
All session lifetimes derive from a single source of truth in `session.constants.ts`:
- **Unremembered Login**: `SHORT_SESSION_TTL_MS` (12 hours)
- **Remember Me**: `REMEMBER_ME_TTL_MS` (7 days)
- **Cache Invalidation**: On password reset and password change, Redis session keys (`sess:<id>`) are purged **atomically after** the PostgreSQL transaction successfully commits, preventing stale or resurrected session states.

---

## 2. API & Service Operations: Programmatic & SDK Auth
- **Mechanism**: Bearer Tokens (JWT) and Project API Keys (`x-api-key`)
- **Usage**:
  - **Project API Keys**: Client apps (`pk_live_...`) and backend microservices (`sk_live_...`) query database tables and storage.
  - **Bearer JWT**: Stateless authentication for service-to-service calls or external integrations.
- **Swagger / OpenAPI**: Configured with explicit security definitions:
  - `sessionId` (Cookie Auth)
  - `bearer-jwt` (HTTP Bearer JWT)
  - `api-key` (Header API Key: `x-api-key`)
