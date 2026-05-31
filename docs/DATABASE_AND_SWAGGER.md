# Database and Swagger

How to inspect the database and how to use Swagger with the cookie + CSRF auth
model.

## Inspect the database

PostgreSQL holds the durable state. Run from `dsvtn-digital-home/`.

```bash
docker compose up -d db redis
npx --prefix backend prisma migrate dev
npx --prefix backend prisma db seed
npx --prefix backend prisma studio
```

Prisma Studio opens a browser at `http://localhost:5555` and renders every
table in `schema.prisma`. Useful checks while smoke-testing:

| Concern                | Tables to look at                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Login and accounts     | `users`, `invites`                                                                 |
| Volunteer pipeline     | `volunteer_applications`                                                           |
| Activities and matcher | `activities`, `tasks`, `activity_registrations`, `task_preferences`, `assignments` |
| Shop and fundraising   | `products`, `orders`, `order_items`, `campaigns`                                   |
| Member engagement      | `notifications`, `badges`, `user_badges`, `points_ledger`, `streaks`               |
| Recap content          | `gallery_albums`, `gallery_photos`                                                 |

Direct SQL access also works:

```bash
docker exec -it dsvtn-db psql -U dsvtn -d dsvtn
```

## Swagger UI

Swagger is enabled in non-production environments at:

```
http://localhost:3001/api/docs
```

Use it for manual inspection — the e2e suites remain the source of truth for
behaviour.

### Authenticating in Swagger

The active auth model is cookie + CSRF. Swagger inherits browser cookies,
which makes the flow:

1. Open `/api/docs` and find `POST /api/auth/login`.
2. Click **Try it out** and submit a seeded admin's credentials.
3. The response sets `dsvtn_access`, `dsvtn_refresh`, and `dsvtn_csrf` on the
   browser. Subsequent Swagger calls send the cookies automatically.
4. For unsafe protected requests (`POST` / `PUT` / `PATCH` / `DELETE`), copy
   the value of `dsvtn_csrf` from DevTools cookies and paste it as the
   `X-CSRF-Token` header in the Swagger request editor.

A failed CSRF check returns `403 CSRF_INVALID`. Re-paste the current
`dsvtn_csrf` value and retry.

### What Swagger does not cover

- Some browser-only flows (cookie clearing on logout, redirect targets) are
  better verified directly in the frontend.
- Rate-limit and idempotency behaviour are best exercised by the matching e2e
  test suite.

## Common database issues

| Symptom                                       | Check                                                             |
| --------------------------------------------- | ----------------------------------------------------------------- |
| Backend cannot connect                        | `docker compose ps`, `DATABASE_URL`, port 5432.                   |
| Prisma client out of sync after schema change | Run `npx --prefix backend prisma generate`.                       |
| Missing seed data                             | Run `npx --prefix backend prisma db seed`.                        |
| Tests fail because of stale data              | Clean the test DB or recreate intentionally.                      |
| Migration drift                               | Inspect with `prisma migrate status`; reset only with permission. |

For Redis-specific issues see [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md).
