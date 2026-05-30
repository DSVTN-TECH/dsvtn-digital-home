# Database And Swagger

## Database

PostgreSQL is the durable source of truth. Redis is ephemeral and must not hold durable business records.

Useful commands from `dsvtn-digital-home/`:

```bash
docker compose up -d db redis
npx --prefix backend prisma migrate dev
npx --prefix backend prisma db seed
npx --prefix backend prisma studio
```

Inspect these tables during smoke testing:

- `users`
- `volunteer_applications`
- `activities`, `tasks`, `activity_registrations`, `task_preferences`, `assignments`
- `products`, `orders`, `order_items`
- `articles`
- future modules: `notifications`, `badges`, `points_ledger`, `streaks`, `gallery_*`, `campaigns`, `invites`

## Swagger

Open `http://localhost:3001/api/docs`.

Active auth model is cookie + CSRF:

1. Call `POST /api/auth/login`.
2. Browser stores `dsvtn_access`, `dsvtn_refresh`, and `dsvtn_csrf`.
3. For protected mutations, send `X-CSRF-Token` matching the `dsvtn_csrf` cookie.
4. Do not use localStorage Bearer token flows as active browser guidance.

Swagger is for local inspection and manual checks. E2E tests remain the source of truth for automated API behavior.

## Common DB Issues

| Symptom                      | Check                                               |
| ---------------------------- | --------------------------------------------------- |
| Backend cannot connect       | `docker compose ps`, `DATABASE_URL`, DB port 5432   |
| Prisma client type mismatch  | Run Prisma generate after accepted schema migration |
| Missing seed admin           | `npx --prefix backend prisma db seed`               |
| Tests fail due stale DB data | Use test cleanup or recreate local DB intentionally |
| Redis connection errors      | Confirm H08 Redis setup and `REDIS_URL`             |
