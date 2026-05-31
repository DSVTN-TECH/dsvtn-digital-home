# Architecture

A high-level view of how the product runs locally and how requests flow through
the system.

## Runtime topology

```
┌──────────────────────────────────────────────────┐
│                   Browser                         │
│        Next.js 15 (App Router) · React 19        │
│        Tailwind v4 · shadcn/ui                   │
└─────────────────────┬─────────────────────────────┘
                      │ HTTPS (HTTP locally) · cookies
                      ▼
┌──────────────────────────────────────────────────┐
│             NestJS 11 REST API                   │
│   /api · cookie auth · CSRF · validation · RBAC  │
│                                                   │
│   Controller → Service → Repository → DB         │
│                       ↓                           │
│        EventEmitter → Queue → Side effects       │
└─────────────────────┬─────────────────────────────┘
                      │ Prisma 6
                      ▼
┌──────────────────────────────────────────────────┐
│             PostgreSQL 17  (durable)              │
└──────────────────────────────────────────────────┘
                      ▲
                      │ ioredis
                      ▼
┌──────────────────────────────────────────────────┐
│   Redis 7  (rate limit, cache, queue, lock,      │
│             idempotency keys — ephemeral only)   │
└──────────────────────────────────────────────────┘
```

The backend is a single NestJS process. Redis is required for local development
but does not change that — it is shared infrastructure for cross-cutting
concerns, not a microservices boundary.

## Layering rules

```
Controller → Service → Repository → Database
                ↓
      Domain Event → Queue → Handler (side effects)
```

Hard rules:

- Controllers never call Prisma directly — they delegate to a service.
- Services depend on the abstract repository (`XxxRepository`) injected via DI
  token; never import `PrismaXxxRepository` from a service.
- One module never writes another module's tables — it raises an event and the
  owning module reacts.
- Side-effect handlers run after the durable transaction commits. Handlers must
  be idempotent; a handler failure does not roll the parent transaction back.
- Frontend components never call `fetch` directly — they go through a
  data-source (`lib/datasource/*`) or `apiFetch` (`lib/api.ts`).

## Auth model

Cookie-based, not localStorage Bearer.

- `dsvtn_access` — httpOnly, `SameSite=Lax`, short TTL.
- `dsvtn_refresh` — httpOnly, `SameSite=Lax`, longer TTL.
- `dsvtn_csrf` — readable by JS (no HttpOnly), used as the `X-CSRF-Token`
  header on protected mutations.

CSRF is enforced by `common/security/csrf.middleware.ts`. CORS is credentialed
and restricted to `ALLOWED_ORIGINS`. Disabled users and accounts with
`must_change_password = true` are rejected on business routes.

## Validation

- Backend: `class-validator` + `class-transformer` enforced by a global
  `ValidationPipe` configured with `whitelist`, `forbidNonWhitelisted`, and
  `transform`. Unknown fields are stripped or rejected.
- Frontend: zod schemas with `react-hook-form`.
- Environment: zod schema in `backend/src/config/env.schema.ts` runs on boot
  and aborts startup with a readable error if anything is invalid.

## Error contract

All errors flow through `common/filters/AllExceptionsFilter` and return a
consistent JSON shape with a `code`, `message`, optional `details`, and a
`requestId`. Rate-limit errors include `retryAfterSeconds`. See
[`BACKEND_STRUCTURE.md`](BACKEND_STRUCTURE.md) for the codes catalogue.

## Redis usage

Redis is required for development; it is never the source of truth.

| Concern              | Provider                                    | Key pattern               | TTL                                            |
| -------------------- | ------------------------------------------- | ------------------------- | ---------------------------------------------- |
| Rate limit           | `common/rate-limit/RateLimitGuard`          | `rl:{scope}:{identifier}` | seconds-scale                                  |
| Cache                | `common/cache/CacheService`                 | `cache:{namespace}:{key}` | per-call (default `CACHE_DEFAULT_TTL_SECONDS`) |
| Queue (side effects) | `common/queue/QueueService`                 | internal                  | per-job                                        |
| Distributed lock     | `common/lock/LockService`                   | `lock:{resource}:{id}`    | 30s typical                                    |
| Idempotency keys     | `common/idempotency/IdempotencyInterceptor` | `idem:{route}:{key}`      | minutes-scale                                  |

Behaviour when Redis is unavailable:

- Rate limit falls back to in-memory accounting (best-effort).
- Cache bypasses and queries the database.
- Locks degrade gracefully; conflicting concurrent matcher runs return 409.
- Queue handlers run inline when `QUEUE_ENABLED=false`.

## Module map

Backend modules (`backend/src/modules/`):

```
auth · users · invites · volunteer-applications · articles
activities · matching · shop
notifications · profile · badges · gamification
gallery · campaigns · reports
```

Cross-cutting providers (`backend/src/common/`):

```
redis · cache · queue · lock · rate-limit · idempotency
events · email · filters · repository · security
```

Frontend route groups (`frontend/app/`):

```
(public) · login · auth/change-password · invite/accept
admin/* · member/* · logistic/*
```
