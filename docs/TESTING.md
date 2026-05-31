# Testing

What to run before considering a change complete. Run every command from the
repo root (`dsvtn-digital-home/`).

## Required quality gates

```bash
# typecheck both apps
npm run typecheck:all

# lint both apps
npm run lint:all

# backend unit tests
npm --prefix backend run test

# backend e2e (requires Postgres + Redis up)
npm --prefix backend run test:e2e

# frontend production build (covers Next.js build-time errors)
npm --prefix frontend run build
```

When the machine is RAM-constrained, prefer the serial variants:

```bash
npm --prefix backend run test:serial
npm --prefix backend run test:e2e:serial
npm --prefix backend run test:e2e:file -- test/<file>.e2e-spec.ts
```

Never run unit and e2e in parallel on a machine that already runs the
frontend dev server — each e2e worker boots the full app, Prisma, and Redis.

## What to run for which change

| Change                                                             | Required local checks                                           |
| ------------------------------------------------------------------ | --------------------------------------------------------------- |
| Backend service / guard / pure helper                              | typecheck + lint + backend unit.                                |
| Backend HTTP endpoint                                              | typecheck + lint + backend unit + backend e2e.                  |
| Prisma schema                                                      | migration + `prisma generate` + backend e2e.                    |
| Redis-backed concern (rate limit, cache, queue, lock, idempotency) | unit + e2e (e2e is required).                                   |
| Frontend page or component                                         | typecheck + lint + `next build`; smoke the page in the browser. |
| Docs only                                                          | grep for stale references and route/task matrix consistency.    |

## Auth and infrastructure cases

These cases are exercised by the existing e2e suite. Re-run them whenever the
related code changes:

- Login sets httpOnly access/refresh cookies plus a readable CSRF cookie.
- `/auth/me`, refresh, logout, and change-password work end-to-end.
- A protected mutation without `X-CSRF-Token` returns `403 CSRF_INVALID`.
- A disabled user with a valid cookie is rejected.
- A user with `must_change_password = true` cannot reach business routes.
- Logout clears all three auth cookies.
- A rate-limited endpoint returns `429` with `details.retryAfterSeconds`.
- Idempotent replays return the documented behaviour (cached response or
  `409` when conflicting).
- Concurrent matcher runs: one succeeds, the other returns `409`.
- Redis unavailable: rate limit falls back to in-memory accounting; cache is
  bypassed; queue handlers run inline if `QUEUE_ENABLED=false`.

## Matcher invariants

When changing the matcher (`backend/src/modules/matching/matcher.ts`):

- No task receives more assignments than its `slotCount`.
- Each member receives at most one assignment per run.
- `assignments ∪ waitlist = all submitted registrations`.
- Same input → same output (deterministic).
- Edge cases pass: no tasks, no registrations, zero slots.

## Manual smoke (per role)

After auth or shell changes, walk the per-role flows in
[`RUN_AND_USE.md`](RUN_AND_USE.md):

- Public: volunteer application, news, shop checkout, fundraising.
- Admin: users/accounts, volunteer review, activities/tasks/matcher,
  articles, products/orders, reports, campaigns, gallery.
- Member: change-password if needed, activities, registration, assignments,
  notifications/profile/streak/recap/feed/impact.
- Logistic: order queue and allowed status transitions only.

## Things to avoid

- Mocking Prisma in integration tests; e2e uses the real DB.
- Tests that depend on execution order.
- Skipping a failing test "to fix later" — fix before merge.
- Running the test suite against the production database.
- Lowering coverage thresholds.
