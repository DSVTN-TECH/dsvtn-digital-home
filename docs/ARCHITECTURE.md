# Architecture Quick Reference

## Runtime

Browser -> Next.js -> NestJS -> PostgreSQL + Redis.

Redis is required locally for:

- rate limits,
- public/aggregate cache,
- queue-backed side effects,
- short locks,
- idempotency keys.

The backend remains a NestJS monolith. Redis does not mean microservices.

## Layering

Controller -> Service -> Repository -> Database.

Side effects go through event/queue primitives after durable domain writes.

## Auth

httpOnly cookies only. No localStorage JWT target.

- access cookie,
- refresh cookie,
- readable CSRF token/header pair,
- credentialed CORS.

## Source docs

- `../docs/03-architecture/REQUEST_LIFECYCLE.md`
- `../docs/03-architecture/REDIS_SCALE_PLAN.md`
- `../docs/09-security/AUTH.md`
