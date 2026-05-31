<div align="center">

# ĐSVTN Digital Home

**Backoffice system & public portal for Đội Sinh viên Tình nguyện**

[![CI](https://github.com/your-org/dsvtn-digital-home/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/dsvtn-digital-home/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-24.16.0-brightgreen)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11-red)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)](https://postgresql.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

[Live Demo](https://dsvtn.vercel.app) · [API Docs](https://dsvtn-api.railway.app/api/docs) · [Project Docs](../docs/00-index.md)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

ĐSVTN Digital Home is a full-stack internal management platform built for **Đội Sinh viên Tình nguyện** (ĐSVTN). It replaces manual spreadsheet workflows with a centralised web application covering:

| Module                    | Description                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------- |
| **Volunteer Recruitment** | Public application form with admin review workflow                                     |
| **Activity Management**   | Create activities, define tasks with slot capacities                                   |
| **Task Matcher**          | Deterministic greedy algorithm matching volunteers to tasks based on preference scores |
| **Fundraising Shop**      | Public product catalogue + order management for logistic staff                         |
| **User Provisioning**     | Admin-only internal account creation (no self-signup)                                  |
| **Articles / CMS**        | Lightweight content management for public-facing news                                  |

### Key Design Decisions

- **Greedy Deterministic Matcher** — no AI, no Integer Programming; reproducible results, no external dependencies
- **URL-only payment proof** — no binary uploads in MVP; members paste a link
- **Stateless JWT auth** — no session store, simple horizontal scaling
- **Role-based access** — `ADMIN`, `MEMBER`, `LOGISTIC` with server-enforced guards

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                   Client Browser                  │
│              Next.js 15 (App Router)              │
│         Tailwind v4 + shadcn/ui + React 19        │
└─────────────────────┬────────────────────────────┘
                      │ HTTPS / REST
                      ▼
┌──────────────────────────────────────────────────┐
│               NestJS 11 REST API                  │
│    /api  ·  JWT Auth  ·  RBAC  ·  Validation      │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Auth    │  │  Users   │  │   Volunteer    │  │
│  │  Module  │  │  Module  │  │  Applications  │  │
│  └──────────┘  └──────────┘  └────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │Activities│  │ Matching │  │     Shop       │  │
│  │  Module  │  │  Module  │  │    Module      │  │
│  └──────────┘  └──────────┘  └────────────────┘  │
└─────────────────────┬────────────────────────────┘
                      │ Prisma ORM
                      ▼
┌──────────────────────────────────────────────────┐
│              PostgreSQL 17                        │
│   11 tables · UUID PKs · Enum types              │
└──────────────────────────────────────────────────┘
```

**Deploy topology (Combo A — recommended):**

```
GitHub → CI (Actions) → main branch merge
                           ├── Backend  → Railway (Docker image)
                           └── Frontend → Vercel  (Next.js native)
                                DB      → Railway Postgres / Neon
```

---

## Tech Stack

### Core

| Layer    | Technology               | Version   |
| -------- | ------------------------ | --------- |
| Runtime  | Node.js                  | `24.16.0` |
| Language | TypeScript               | `5.8`     |
| Frontend | Next.js (App Router)     | `15`      |
| UI       | Tailwind CSS + shadcn/ui | `v4`      |
| Backend  | NestJS                   | `11`      |
| ORM      | Prisma                   | `6`       |
| Database | PostgreSQL               | `17`      |

### Backend Packages

| Package                                 | Purpose                   |
| --------------------------------------- | ------------------------- |
| `@nestjs/jwt` + `passport-jwt`          | JWT auth                  |
| `@nestjs/config` + `zod`                | Env validation on startup |
| `class-validator` + `class-transformer` | DTO input validation      |
| `bcrypt`                                | Password hashing          |
| `@nestjs/swagger`                       | Auto-generated API docs   |

### Frontend Packages

| Package                   | Purpose                        |
| ------------------------- | ------------------------------ |
| `react-hook-form` + `zod` | Form state + client validation |
| `lucide-react`            | Icon library                   |

### Dev Tooling

| Tool                   | Purpose          |
| ---------------------- | ---------------- |
| ESLint 9 (flat config) | Linting          |
| Prettier 3             | Code formatting  |
| Husky 9 + lint-staged  | Pre-commit hooks |
| Docker Compose         | Local PostgreSQL |
| GitHub Actions         | CI/CD pipeline   |

---

## Prerequisites

| Tool                    | Version   | Install                                           |
| ----------------------- | --------- | ------------------------------------------------- |
| Node.js                 | `24.16.0` | [nvm](https://github.com/nvm-sh/nvm)              |
| npm                     | `10+`     | Bundled with Node                                 |
| Docker + Docker Compose | Latest    | [Docker Desktop](https://docs.docker.com/desktop) |
| Git                     | `2.30+`   | [git-scm.com](https://git-scm.com)                |

> **Windows users:** Use [nvm-windows](https://github.com/coreybutler/nvm-windows) or WSL2.

---

## Getting Started

### 1 — Clone & use correct Node version

```bash
git clone https://github.com/your-org/dsvtn-digital-home.git
cd dsvtn-digital-home
nvm use                  # reads .nvmrc → 24.16.0
```

### 2 — Install dependencies

```bash
# Root dev tools (Husky, lint-staged)
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3 — Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Open .env and set:
#   JWT_SECRET   → any random string ≥ 32 characters
#   DATABASE_URL → keep default for local Docker

# Frontend
cd ../frontend
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL is pre-filled for local dev
```

### 4 — Start the database

```bash
# From repo root
docker compose up -d db

# Verify it's healthy
docker compose ps
```

### 5 — Migrate & seed

```bash
cd backend

# Run migrations
npx prisma migrate dev

# Seed admin account
npx prisma db seed
```

### 6 — Start development servers

```bash
# Terminal 1 — Backend
cd backend && npm run start:dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Verify

| URL                                | Expected             |
| ---------------------------------- | -------------------- |
| `http://localhost:3000`            | Landing page         |
| `http://localhost:3001/api/health` | `{ "status": "ok" }` |
| `http://localhost:3001/api/docs`   | Swagger UI           |

**Default admin credentials** (seed data — change immediately):

```
Email:    admin@dsvtn.vn
Password: changeme
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable          | Required | Default                 | Description                                   |
| ----------------- | -------- | ----------------------- | --------------------------------------------- |
| `DATABASE_URL`    | ✅       | —                       | PostgreSQL connection string                  |
| `JWT_SECRET`      | ✅       | —                       | JWT signing secret, **min 32 chars**          |
| `JWT_EXPIRES_IN`  |          | `7d`                    | Token expiry duration                         |
| `PORT`            |          | `3001`                  | HTTP port                                     |
| `NODE_ENV`        |          | `development`           | Runtime environment                           |
| `ALLOWED_ORIGINS` |          | `http://localhost:3000` | Comma-separated CORS origins                  |
| `EMAIL_API_KEY`   |          | _(empty)_               | Email provider API key — app works without it |
| `EMAIL_FROM`      |          | _(empty)_               | Sender address for transactional email        |

> The app performs **fail-fast validation** on startup using Zod. A missing or invalid `JWT_SECRET` or `DATABASE_URL` will prevent the process from starting — you will see a clear error message.

### Frontend (`frontend/.env.local`)

| Variable              | Required | Default                     | Description          |
| --------------------- | -------- | --------------------------- | -------------------- |
| `NEXT_PUBLIC_API_URL` | ✅       | `http://localhost:3001/api` | Backend API base URL |

---

## Development

### Scripts

```bash
# Backend
cd backend
npm run start:dev     # watch mode with hot-reload
npm run start:debug   # watch + debug port 9229
npm run build         # production build
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier
npm run typecheck     # tsc --noEmit
npm run test          # unit tests (Jest)
npm run test:watch    # watch mode
npm run test:cov      # coverage report
npm run test:e2e      # integration tests

# Frontend
cd frontend
npm run dev           # development server
npm run build         # production build
npm run lint          # ESLint (next lint)
npm run format        # Prettier
npm run typecheck     # tsc --noEmit

# Root (all at once)
npm run lint:all
npm run format:all
npm run typecheck:all
```

### Database

```bash
cd backend

npx prisma migrate dev           # create + apply new migration
npx prisma migrate dev --name X  # named migration
npx prisma migrate reset         # ⚠️  drops all data, re-migrates
npx prisma generate              # regenerate Prisma Client after schema change
npx prisma studio                # visual DB browser at localhost:5555
npx prisma db seed               # re-seed admin user
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/TASK-001-backend-scaffold

# Commit (pre-commit hook runs lint-staged automatically)
git add .
git commit -m "feat(auth): implement JWT login endpoint"

# Push → open PR → CI must be green before merge
git push origin feature/TASK-001-backend-scaffold
```

**Commit message convention:**

```
<type>(<scope>): <subject>

Types: feat | fix | chore | docs | refactor | test | ci
```

### Branch Strategy

| Branch      | Purpose                     | CI       |
| ----------- | --------------------------- | -------- |
| `main`      | Production-ready, protected | CI + CD  |
| `develop`   | Integration branch          | CI only  |
| `feature/*` | Feature work                | CI on PR |
| `fix/*`     | Bug fixes                   | CI on PR |

---

## Project Structure

```
dsvtn-digital-home/
│
├── .github/workflows/
│   └── ci.yml                   # CI: lint + typecheck + test
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (single source of truth)
│   │   └── seed.ts              # Dev seed data
│   │
│   ├── src/
│   │   ├── main.ts              # Bootstrap: prefix, pipes, Swagger, CORS
│   │   ├── app.module.ts        # Root module
│   │   │
│   │   ├── config/              # @nestjs/config + Zod env validation
│   │   ├── health/              # GET /api/health
│   │   ├── prisma/              # PrismaService (global)
│   │   │
│   │   └── modules/
│   │       ├── auth/            # Login, JWT, guards, decorators
│   │       ├── users/           # Admin user CRUD, temp password
│   │       ├── volunteer-applications/
│   │       ├── articles/
│   │       ├── activities/      # Activities, tasks, registrations
│   │       ├── matching/        # Greedy matcher algorithm
│   │       └── shop/            # Products, orders
│   │
│   ├── test/                    # e2e tests
│   ├── .env.example
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Tailwind v4 base
│   │   ├── (public)/            # Public routes (no auth)
│   │   ├── login/               # Login page
│   │   ├── admin/               # Admin-only routes
│   │   ├── member/              # Member-only routes
│   │   └── logistic/            # Logistic-only routes
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (auto-generated)
│   │   ├── shared/              # Shared layout components (Navbar, etc.)
│   │   ├── forms/               # Form components per feature
│   │   └── tables/              # Data table components
│   │
│   ├── hooks/
│   │   └── useAuth.ts           # JWT decode, role helpers
│   │
│   ├── lib/
│   │   ├── api.ts               # fetch wrapper with JWT injection
│   │   └── auth.ts              # token storage helpers
│   │
│   ├── types/
│   │   └── api.ts               # TypeScript types matching API contract
│   │
│   ├── .env.local.example
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml           # Local PostgreSQL 17
├── .nvmrc                       # 24.16.0
├── .lintstagedrc.json
├── package.json                 # Root scripts + Husky
└── README.md
```

---

## API Reference

Interactive API documentation is available via Swagger UI in non-production environments:

```
http://localhost:3001/api/docs
```

### Quick Reference

| Method | Endpoint                                | Auth  | Description                  |
| ------ | --------------------------------------- | ----- | ---------------------------- |
| `POST` | `/api/auth/login`                       | —     | Authenticate and receive JWT |
| `GET`  | `/api/health`                           | —     | Service health check         |
| `GET`  | `/api/admin/users`                      | Admin | List internal users          |
| `POST` | `/api/admin/users`                      | Admin | Create user + temp password  |
| `POST` | `/api/public/volunteer-applications`    | —     | Submit volunteer application |
| `GET`  | `/api/admin/volunteer-applications`     | Admin | Review applications          |
| `POST` | `/api/admin/activities`                 | Admin | Create activity              |
| `POST` | `/api/admin/activities/:id/matcher/run` | Admin | Run greedy matcher           |
| `GET`  | `/api/public/products`                  | —     | List active products         |
| `POST` | `/api/public/orders`                    | —     | Place an order               |

Full contract: [`docs/07-api/API_CONTRACT.md`](../docs/07-api/API_CONTRACT.md)

### Authentication

All protected endpoints require a Bearer token:

```http
Authorization: Bearer <jwt>
```

Tokens are issued by `POST /api/auth/login` and expire after `JWT_EXPIRES_IN` (default: `7d`).

---

## Testing

### Unit Tests

```bash
cd backend

# Run all unit tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:cov

# Target a specific module
npm run test -- --testPathPattern="auth.service"
```

### Integration Tests (e2e)

```bash
cd backend

# Requires DB running
docker compose up -d db
npm run test:e2e
```

### CI Tests

All tests run automatically on every push and pull request via GitHub Actions. The CI pipeline:

1. Spins up a PostgreSQL 17 service container
2. Applies migrations via `prisma migrate deploy`
3. Runs `lint` → `typecheck` → `test` for backend
4. Runs `lint` → `typecheck` → `build` for frontend

**A green CI status is required to merge any pull request.**

---

## Deployment

### Combo A — Vercel (Frontend) + Railway (Backend) _(Recommended)_

**Backend → Railway**

1. Create a new Railway project
2. Add a PostgreSQL plugin → copy `DATABASE_URL`
3. Deploy backend service → set all env vars from `.env.example`
4. Railway will use `backend/Dockerfile` automatically

**Frontend → Vercel**

1. Import GitHub repo into Vercel
2. Set root directory to `frontend`
3. Add env var: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api`
4. Deploy — Vercel auto-detects Next.js

**Automated CD via GitHub Actions:** See [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

### Combo B — Full Railway (Docker)

Both frontend and backend deployed as Docker containers on Railway. Requires `Dockerfile` in each app directory.

### Environment Checklist (Production)

- [ ] `JWT_SECRET` is a randomly generated string ≥ 64 characters
- [ ] `NODE_ENV=production` is set on the backend
- [ ] `ALLOWED_ORIGINS` is set to the exact frontend domain
- [ ] Database has run `prisma migrate deploy` (not `migrate dev`)
- [ ] Admin default password `changeme` has been changed

---

## Contributing

This is an internal project. External contributions are not accepted at this time.

### For Internal Developers

1. **Read the task docs first** — every feature has a corresponding `TASK-xxx.md` in `docs/12-tasks/`
2. **One task per branch** — branch off `develop`, name it `feature/TASK-xxx-short-description`
3. **Tests required** — no PR merges without passing unit tests for the changed module
4. **No skipping CI** — do not use `--no-verify` except in genuine emergencies
5. **Docs update** — update `docs/17-sessions/CURRENT_STATE.md` after completing a task

### Code Style

- TypeScript strict mode — no `any` without a comment explaining why
- `class-validator` DTOs for all request bodies — no raw `req.body` access
- Never return `password_hash` in any response
- Money values always as `_cents` integers — never floats

---

## License

[MIT](LICENSE) © 2026 Đội Sinh viên Tình nguyện
