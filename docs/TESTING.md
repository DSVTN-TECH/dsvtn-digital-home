# Testing Quick Reference

Run from `dsvtn-digital-home/`.

## Required Gates

```bash
npm run typecheck:all
npm run lint:all
npm --prefix backend run test
npm --prefix backend run test:e2e
npm --prefix frontend run build
```

## When To Run What

| Change                                  | Required                                           |
| --------------------------------------- | -------------------------------------------------- |
| Backend service/guard/helper            | Backend unit tests                                 |
| Backend endpoint                        | Backend unit + e2e                                 |
| Prisma schema                           | Migration + generate + backend e2e                 |
| Redis/rate/cache/queue/lock/idempotency | Unit + integration/e2e                             |
| Frontend page/component                 | Frontend build and UX state smoke                  |
| Docs-only                               | Consistency scans and route/task matrix validation |

## Cookie/Redis Hardening Cases

- Login sets httpOnly access/refresh cookies and readable CSRF cookie.
- `/auth/me`, refresh, logout, change-password work.
- Missing CSRF on protected mutation returns 403.
- Rate-limited endpoint returns documented 429.
- Idempotency replay returns documented replay/conflict behavior.
- Redis lock conflict is deterministic.
- Queue side effect retries/dead-letters as documented.
- Cache TTL/invalidation works or is explicitly not applicable.

## Manual Role Smoke

- Public: volunteer application, news, shop checkout.
- Admin: users, volunteer review, activities/tasks/matcher, articles, products/orders, reports.
- Member: change-password if needed, activities, registration, assignments, notifications/profile/streak/recap/feed/impact.
- Logistic: order queue/status only.
