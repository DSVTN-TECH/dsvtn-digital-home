<div align="center">

# ĐSVTN Digital Home

**Internal management platform & public portal for Đội Sinh viên Tình nguyện**

[![Node](https://img.shields.io/badge/node-24.16.0-brightgreen)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11-red)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-d82c20)](https://redis.io)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

</div>

---

## Overview

ĐSVTN Digital Home is a full-stack platform for a student volunteer team. It
replaces spreadsheet and chat coordination with one application covering
recruitment, account provisioning, activity and task assignment, a fundraising
shop, content, and member engagement.

| Module                | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| Volunteer Recruitment | Public application form with admin review workflow.                        |
| User Provisioning     | Admin-only account creation plus token-based invites (no self-signup).     |
| Activity Management   | Activities, tasks with slot capacities, member registrations.              |
| Task Matcher          | Deterministic greedy algorithm matching volunteers to tasks by preference. |
| Fundraising Shop      | Public catalogue, orders, and a logistic order queue.                      |
| Campaigns             | Fundraising campaigns tied to shop orders.                                 |
| Articles / CMS        | Lightweight markdown content for public news.                              |
| Member Engagement     | Notifications, profile, badges, points, streaks, gallery recaps.           |
| Reports               | Admin dashboard and overview aggregations with CSV export.                 |

### Key design decisions

- **Greedy deterministic matcher** — no AI or solver; same input always yields the same output.
- **httpOnly cookie auth + CSRF** — access/refresh cookies, never localStorage tokens.
- **Redis-backed request hardening** — rate limits, cache, queues, locks, idempotency.
- **URL-only payment proof** — no binary uploads; members paste a link.
- **Role-based access** — `ADMIN`, `MEMBER`, `LOGISTIC`, enforced server-side.

---

## Documentation

Full engineering docs live in [`docs/`](docs/README.md) and are self-contained.

| Doc                                                  | Purpose                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| [`docs/OVERVIEW.md`](docs/OVERVIEW.md)               | Modules, roles, business rules.          |
| [`docs/LOCAL_SETUP.md`](docs/LOCAL_SETUP.md)         | Install, env, infra, migrate, seed, run. |
| [`docs/RUN_AND_USE.md`](docs/RUN_AND_USE.md)         | URLs, demo accounts, role smoke flows.   |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)       | Runtime, layering, auth, Redis usage.    |
| [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)       | Endpoint groups by domain.               |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Common local issues.                     |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)       | Branching, commits, gates.               |

---

## Architecture

```
Browser (Next.js 15 / React 19 / Tailwind v4 / shadcn/ui)
        │  REST over HTTP, httpOnly cookies + CSRF
        ▼
NestJS 11 API  (/api)
   Controller → Service → Repository → Prisma
                   │
        Event → Queue → side-effect handlers
        ▼                         ▼
  PostgreSQL 17 (durable)   Redis 7 (rate limit, cache,
                            queue, lock, idempotency)
```

The backend is a single NestJS process. Redis is required locally for
cross-cutting concerns; it is never the source of truth. See
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for detail.

---

## Tech stack

| Layer                | Technology                                      | Version |
| -------------------- | ----------------------------------------------- | ------- |
| Runtime              | Node.js                                         | 24.16.0 |
| Language             | TypeScript                                      | 5.8     |
| Backend              | NestJS                                          | 11      |
| ORM                  | Prisma                                          | 6       |
| Database             | PostgreSQL                                      | 17      |
| Cache / queue / lock | Redis                                           | 7       |
| Frontend             | Next.js (App Router)                            | 15      |
| UI                   | React + Tailwind CSS + shadcn/ui                | 19 / v4 |
| Validation           | class-validator (backend), zod (frontend + env) | —       |
| Auth                 | httpOnly cookie JWT + CSRF                      | —       |

---

## Quick start

Prerequisites: Node.js 24.16.0 (`.nvmrc`), npm 10+, Docker + Docker Compose, Git.

```bash
# 1. install (root tooling + both apps)
npm install
npm install --prefix backend
npm install --prefix frontend

# 2. configure env (set JWT_SECRET to 32+ chars in backend/.env)
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 3. start infrastructure
docker compose up -d db redis

# 4. migrate + seed
npx --prefix backend prisma migrate dev
npx --prefix backend prisma db seed

# 5. run (two terminals)
npm --prefix backend run start:dev    # http://localhost:3001/api
npm --prefix frontend run dev         # http://localhost:3000
```

| Surface  | URL                                |
| -------- | ---------------------------------- |
| Frontend | `http://localhost:3000`            |
| API      | `http://localhost:3001/api`        |
| Health   | `http://localhost:3001/api/health` |
| Swagger  | `http://localhost:3001/api/docs`   |

Demo accounts (local-only) are listed in
[`docs/RUN_AND_USE.md`](docs/RUN_AND_USE.md). The seeded admin is
`admin@dsvtn.vn` / `changeme`.

Full walkthrough: [`docs/LOCAL_SETUP.md`](docs/LOCAL_SETUP.md).

---

## Environment variables

Backend (`backend/.env`) is validated by zod on startup; the process aborts
with a clear message if anything is invalid.

| Variable                       | Required | Default                  | Notes                                     |
| ------------------------------ | -------- | ------------------------ | ----------------------------------------- |
| `DATABASE_URL`                 | yes      | —                        | PostgreSQL connection string.             |
| `DIRECT_URL`                   | no       | —                        | Set equal to `DATABASE_URL` locally.      |
| `JWT_SECRET`                   | yes      | —                        | Minimum 32 characters.                    |
| `JWT_EXPIRES_IN`               | no       | `7d`                     | Access token lifetime.                    |
| `ALLOWED_ORIGINS`              | no       | `http://localhost:3000`  | Comma-separated CORS origins.             |
| `COOKIE_SECURE`                | no       | `false`                  | Keep `false` for local HTTP.              |
| `REDIS_URL`                    | no       | `redis://localhost:6379` | Redis connection string.                  |
| `RATE_LIMIT_ENABLED`           | no       | `true`                   | Disable while developing if needed.       |
| `CACHE_DEFAULT_TTL_SECONDS`    | no       | `60`                     | Default cache TTL.                        |
| `QUEUE_ENABLED`                | no       | `true`                   | Run handlers inline when `false`.         |
| `PORT`                         | no       | `3001`                   | Backend HTTP port.                        |
| `NODE_ENV`                     | no       | `development`            | `development` enables Swagger.            |
| `EMAIL_API_KEY` / `EMAIL_FROM` | no       | —                        | Optional; emails are logged without them. |

Frontend (`frontend/.env.local`): `NEXT_PUBLIC_API_URL` and
`NEXT_PUBLIC_DATA_SOURCE` (`mock` fixtures or `api` for the real backend).

---

## Scripts

```bash
# from repo root
npm run typecheck:all
npm run lint:all
npm run format:all

# backend (npm --prefix backend run <script>)
start:dev · build · lint · typecheck · test · test:e2e · test:cov
test:serial · test:e2e:serial · test:e2e:file

# frontend (npm --prefix frontend run <script>)
dev · build · lint · typecheck · test:e2e
```

Database (from repo root):

```bash
npx --prefix backend prisma migrate dev      # create + apply migration
npx --prefix backend prisma generate         # regenerate client
npx --prefix backend prisma studio           # visual DB browser :5555
npx --prefix backend prisma db seed          # re-seed demo data
```

---

## Project structure

```
dsvtn-digital-home/
├── backend/                 NestJS 11 + Prisma 6
│   ├── prisma/              schema.prisma · seed.ts · migrations/
│   └── src/
│       ├── main.ts          prefix · filters · CSRF · pipes · CORS · Swagger
│       ├── config/          zod env validation
│       ├── common/          redis · cache · queue · lock · rate-limit ·
│       │                    idempotency · events · email · filters ·
│       │                    repository · security
│       └── modules/         auth · users · invites · volunteer-applications ·
│                            articles · activities · matching · shop ·
│                            notifications · profile · badges · gamification ·
│                            gallery · campaigns · reports
├── frontend/                Next.js 15 + React 19
│   ├── app/                 (public) · login · auth · invite · admin ·
│   │                        member · logistic
│   ├── components/          ui · shared · forms · shop · tables
│   ├── lib/                 api.ts · auth.ts · datasource/ · mock/
│   ├── hooks/ · types/
│   └── tests/               Playwright specs
├── docker-compose.yml       PostgreSQL 17 + Redis 7
├── docs/                    engineering docs (self-contained)
└── package.json             root scripts + Husky
```

See [`docs/BACKEND_STRUCTURE.md`](docs/BACKEND_STRUCTURE.md) and
[`docs/FRONTEND_STRUCTURE.md`](docs/FRONTEND_STRUCTURE.md) for detail.

---

## Testing

```bash
npm run typecheck:all
npm run lint:all
npm --prefix backend run test         # unit (Jest)
npm --prefix backend run test:e2e     # integration (needs DB + Redis)
npm --prefix frontend run build       # frontend build check
```

On low-RAM machines use the serial variants
(`test:serial`, `test:e2e:serial`, `test:e2e:file`). Coverage thresholds are
enforced. See [`docs/TESTING.md`](docs/TESTING.md) for the per-change matrix.

---

## Contributing

Internal project. Branch off `develop`, make focused commits with conventional
messages, and run the relevant gates before committing. Agents must never
`git push` or `git add .`. See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

Code style essentials:

- TypeScript strict; no `any` without an explanatory comment.
- `class-validator` DTOs for all request bodies; no raw `req.body` access.
- Never return `password_hash` in any response.
- Money values are always integer cents, never floats.

---

## Deployment

Deployment is intentionally deferred until the full local product is verified.
No staging, production, CD, or Dockerfile finalization work is active yet.

---

## License

[MIT](LICENSE) © Đội Sinh viên Tình nguyện
