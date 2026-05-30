# Local Setup

Run all commands from `dsvtn-digital-home/`.

## 1. Install

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

## 2. Environment

Create local env files from examples when available. Do not commit `.env`.

Backend must include:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=change-me-local
ALLOWED_ORIGINS=http://localhost:3000
COOKIE_SECURE=false
REDIS_URL=redis://localhost:6379
RATE_LIMIT_ENABLED=true
CACHE_DEFAULT_TTL_SECONDS=60
QUEUE_ENABLED=true
```

Frontend must point to backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_DATA_SOURCE=api
```

## 3. Start Local Infrastructure

```bash
docker compose up -d db redis
docker compose ps
```

Expected services:

| Service    | Port | Purpose                                        |
| ---------- | ---: | ---------------------------------------------- |
| PostgreSQL | 5432 | Durable app data                               |
| Redis      | 6379 | Rate limits, cache, queues, locks, idempotency |

Do not run `docker compose down -v` unless you intentionally want to wipe local DB data.

## 4. Database

```bash
npx --prefix backend prisma migrate dev
npx --prefix backend prisma db seed
npx --prefix backend prisma studio
```

Prisma Studio opens a local DB browser. Use it to inspect seeded users, applications, activities, products, orders, and later notification/profile/gamification data.

## 5. Start Apps

Use two terminals:

```bash
npm --prefix backend run start:dev
```

```bash
npm --prefix frontend run dev
```

Expected URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`
- Prisma Studio: printed by Prisma, usually `http://localhost:5555`

## 6. First Verification

- Open `/login`.
- Login with seeded admin from `docs/08-data/SEED_DATA.md`.
- Confirm browser receives auth cookies.
- Open Swagger and verify endpoints under `/api/docs`.
- Open public pages: `/`, `/volunteer`, `/news`, `/shop`.
- Open admin pages: `/admin`, `/admin/users`, `/admin/activities`.

See `RUN_AND_USE.md` for role smoke flows.
