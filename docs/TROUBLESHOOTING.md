# Troubleshooting

Common local issues and how to fix them. Run commands from the repo root
(`dsvtn-digital-home/`).

## Startup and environment

| Symptom                                                        | Likely cause                              | Fix                                                              |
| -------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| Backend exits immediately with `Invalid environment variables` | A required env var is missing or invalid. | Check `backend/.env` against [`LOCAL_SETUP.md`](LOCAL_SETUP.md). |
| Error mentions `JWT_SECRET must be at least 32 characters`     | `JWT_SECRET` is too short.                | Set a value of 32+ characters.                                   |
| `DATABASE_URL` / `REDIS_URL` rejected as invalid URL           | Malformed connection string.              | Use the exact format in `.env.example`.                          |
| Env changes not picked up                                      | Backend not restarted.                    | Stop and re-run `npm --prefix backend run start:dev`.            |

## PostgreSQL

| Symptom                                         | Likely cause                                                 | Fix                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `Can't reach database server at localhost:5432` | Postgres container not running.                              | `docker compose up -d db`, then `docker compose ps`.                    |
| `password authentication failed`                | `DATABASE_URL` credentials differ from `docker-compose.yml`. | Use `dsvtn` / `dsvtn_dev` / `dsvtn` for user/password/db.               |
| `relation "..." does not exist`                 | Migrations not applied.                                      | `npx --prefix backend prisma migrate dev`.                              |
| Prisma client type errors after editing schema  | Client not regenerated.                                      | `npx --prefix backend prisma generate`.                                 |
| `migrate dev` reports drift                     | Local DB diverged from migrations.                           | Check `prisma migrate status`; reset only with permission (wipes data). |
| Port 5432 already in use                        | Another Postgres is running.                                 | Stop it, or remap the host port in `docker-compose.yml`.                |

## Redis

| Symptom                                             | Likely cause                            | Fix                                               |
| --------------------------------------------------- | --------------------------------------- | ------------------------------------------------- |
| `ECONNREFUSED 127.0.0.1:6379`                       | Redis container not running.            | `docker compose up -d redis`.                     |
| Rate limiting behaves unexpectedly while developing | Limits accumulating across restarts.    | Set `RATE_LIMIT_ENABLED=false` in `backend/.env`. |
| Side-effect handlers not firing in tests            | Queue indirection.                      | Set `QUEUE_ENABLED=false` to run handlers inline. |
| Health check shows Redis degraded                   | Redis down; app continues failure-soft. | Bring Redis up; cache/locks resume automatically. |

## Auth and CSRF

| Symptom                                     | Likely cause                               | Fix                                                                  |
| ------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| `403 CSRF_INVALID` on a mutation            | Missing or stale `X-CSRF-Token`.           | Send the current `dsvtn_csrf` cookie value as the header.            |
| Logged out unexpectedly                     | Access cookie expired.                     | The frontend calls refresh automatically; if it fails, log in again. |
| Login rate-limited (`429`) while developing | Repeated login attempts.                   | Wait for the window, or set `RATE_LIMIT_ENABLED=false`.              |
| Stuck on `/auth/change-password`            | Account has `must_change_password = true`. | Complete the change-password form.                                   |
| Cookies not set after login                 | `COOKIE_SECURE=true` on local HTTP.        | Set `COOKIE_SECURE=false` for local dev.                             |

## Frontend

| Symptom                                | Likely cause                         | Fix                                                               |
| -------------------------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| Pages show fixture data, not real data | Data-source is mock.                 | Set `NEXT_PUBLIC_DATA_SOURCE=api` in `frontend/.env.local`.       |
| API calls fail with CORS errors        | Origin not allowed.                  | Add the frontend origin to `ALLOWED_ORIGINS` in `backend/.env`.   |
| `next build` fails on type errors      | Type drift from API types.           | Fix the reported file; run `npm --prefix frontend run typecheck`. |
| Calls hit the wrong backend            | `NEXT_PUBLIC_API_URL` misconfigured. | Set it to `http://localhost:3001/api`.                            |

## Windows / PowerShell

| Symptom                           | Fix                                                         |
| --------------------------------- | ----------------------------------------------------------- |
| `cp` not recognised               | Use `Copy-Item backend/.env.example backend/.env`.          |
| Path with spaces breaks a command | Quote the path: `"D:\...\dsvtn-digital-home"`.              |
| Line-ending warnings from git     | Leave git autocrlf as configured; do not change git config. |

## When in doubt

- Confirm infrastructure is up: `docker compose ps`.
- Confirm the backend booted: `GET http://localhost:3001/api/health`.
- Re-read [`LOCAL_SETUP.md`](LOCAL_SETUP.md) for the exact env and command order.
