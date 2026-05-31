# Local Setup

A complete walkthrough to run the full product on your machine. Run every
command from the repository root (`dsvtn-digital-home/`) unless noted.

## Prerequisites

| Tool                    | Version | Notes                                             |
| ----------------------- | ------- | ------------------------------------------------- |
| Node.js                 | 24.16.0 | Matches `.nvmrc`. Use `nvm use` (or nvm-windows). |
| npm                     | 10+     | Bundled with Node.                                |
| Docker + Docker Compose | Latest  | Runs PostgreSQL and Redis locally.                |
| Git                     | 2.30+   | —                                                 |

## 1. Install dependencies

The repo is split into root tooling, backend, and frontend. Install all three.

```bash
npm install                      # root: Husky + lint-staged hooks
npm install --prefix backend
npm install --prefix frontend
```

## 2. Configure environment

Create the backend and frontend env files from their examples. Never commit
`.env` files.

```bash
# from repo root
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### Backend (`backend/.env`)

Validated by zod on startup (`backend/src/config/env.schema.ts`). The process
will refuse to boot with a clear error if a required value is missing or
invalid.

| Variable                    | Required | Default                  | Notes                                                                                          |
| --------------------------- | -------- | ------------------------ | ---------------------------------------------------------------------------------------------- |
| `DATABASE_URL`              | yes      | local Docker URL         | PostgreSQL connection string.                                                                  |
| `DIRECT_URL`                | no       | —                        | Set equal to `DATABASE_URL` locally; used by Prisma when `DATABASE_URL` goes through a pooler. |
| `JWT_SECRET`                | yes      | —                        | **Minimum 32 characters.** A shorter value fails env validation.                               |
| `JWT_EXPIRES_IN`            | no       | `7d`                     | Access token lifetime.                                                                         |
| `ALLOWED_ORIGINS`           | no       | `http://localhost:3000`  | Comma-separated CORS origins.                                                                  |
| `COOKIE_SECURE`             | no       | `false`                  | Keep `false` for local HTTP; auto-secure in production.                                        |
| `REDIS_URL`                 | no       | `redis://localhost:6379` | Redis connection string.                                                                       |
| `RATE_LIMIT_ENABLED`        | no       | `true`                   | Set `false` to disable rate limiting while developing.                                         |
| `CACHE_DEFAULT_TTL_SECONDS` | no       | `60`                     | Default cache TTL.                                                                             |
| `QUEUE_ENABLED`             | no       | `true`                   | Set `false` to run side-effect handlers inline.                                                |
| `PORT`                      | no       | `3001`                   | Backend HTTP port.                                                                             |
| `NODE_ENV`                  | no       | `development`            | `development` enables Swagger.                                                                 |
| `EMAIL_API_KEY`             | no       | —                        | Optional; without it, emails are logged, not sent.                                             |
| `EMAIL_FROM`                | no       | —                        | Sender address when email is configured.                                                       |

A valid local minimum looks like:

```env
DATABASE_URL=postgresql://dsvtn:dsvtn_dev@localhost:5432/dsvtn
DIRECT_URL=postgresql://dsvtn:dsvtn_dev@localhost:5432/dsvtn
JWT_SECRET=local-dev-secret-change-me-at-least-32-characters
ALLOWED_ORIGINS=http://localhost:3000
COOKIE_SECURE=false
REDIS_URL=redis://localhost:6379
RATE_LIMIT_ENABLED=true
CACHE_DEFAULT_TTL_SECONDS=60
QUEUE_ENABLED=true
```

### Frontend (`frontend/.env.local`)

| Variable                  | Required | Default                     | Notes                                                      |
| ------------------------- | -------- | --------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`     | yes      | `http://localhost:3001/api` | Backend API base URL.                                      |
| `NEXT_PUBLIC_DATA_SOURCE` | yes      | `mock`                      | `api` hits the real backend; `mock` uses in-repo fixtures. |

To exercise the full stack against the backend, set:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_DATA_SOURCE=api
```

## 3. Start local infrastructure

```bash
docker compose up -d db redis
docker compose ps
```

| Service    | Port | Purpose                                              |
| ---------- | ---: | ---------------------------------------------------- |
| PostgreSQL | 5432 | Durable application data.                            |
| Redis      | 6379 | Rate limits, cache, queues, locks, idempotency keys. |

Do not run `docker compose down -v` unless you intend to wipe local DB data.

## 4. Migrate and seed the database

```bash
npx --prefix backend prisma migrate dev
npx --prefix backend prisma db seed
```

The seed is idempotent (keyed on stable identifiers) and creates demo users,
applications, activities/tasks, articles, products, a campaign, badges, and a
gallery album. See [`RUN_AND_USE.md`](RUN_AND_USE.md) for the demo accounts.

To inspect data visually:

```bash
npx --prefix backend prisma studio
```

## 5. Start the apps

Use two terminals.

```bash
# terminal 1 — backend
npm --prefix backend run start:dev
```

```bash
# terminal 2 — frontend
npm --prefix frontend run dev
```

| Surface       | URL                                    |
| ------------- | -------------------------------------- |
| Frontend      | `http://localhost:3000`                |
| Backend API   | `http://localhost:3001/api`            |
| Health check  | `http://localhost:3001/api/health`     |
| Swagger       | `http://localhost:3001/api/docs`       |
| Prisma Studio | `http://localhost:5555` (when started) |

## 6. First verification

- `GET http://localhost:3001/api/health` returns a healthy status.
- Open `/login` and sign in with the seeded admin (see [`RUN_AND_USE.md`](RUN_AND_USE.md)).
- Confirm the browser receives `dsvtn_access`, `dsvtn_refresh`, and `dsvtn_csrf` cookies.
- Open Swagger and confirm endpoints render under `/api/docs`.
- Open public pages: `/`, `/volunteer`, `/news`, `/shop`.
- Open admin pages: `/admin`, `/admin/users`, `/admin/activities`.

If something fails, see [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md).

> Windows note: these commands work in PowerShell 7+. The `cp`/`npx --prefix`
> forms shown here are cross-platform; if `cp` is unavailable, use
> `Copy-Item backend/.env.example backend/.env`.
