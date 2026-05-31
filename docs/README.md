# ĐSVTN Digital Home — In-Repo Team Docs

These docs are the quick-start layer for engineers inside the code repo. The canonical source of truth remains the workspace root `../docs/`.

## Current Product Target

Full local product before deploy:

- 28 canonical `ui-design/svtn_v2` screens functional.
- Supporting pages for feed, impact, invite accept, change password, gallery/campaign admin.
- PostgreSQL + Redis local runtime.
- httpOnly cookie auth + CSRF.
- Swagger usable for local API inspection.
- Backend request handling with validation, RBAC/ownership, errors, tests, Redis scale notes.
- Strong UX states on every page.
- Deploy/CD/staging/production tasks remain placeholders.

## Read First

| File                      | Purpose                                              |
| ------------------------- | ---------------------------------------------------- |
| `LOCAL_SETUP.md`          | Install, env, DB/Redis, migrate, seed, start apps.   |
| `RUN_AND_USE.md`          | URLs, demo accounts, role flows, manual smoke usage. |
| `DATABASE_AND_SWAGGER.md` | Prisma Studio, DB checks, Swagger cookie/CSRF usage. |
| `TASK_ROADMAP.md`         | Current implementation order and blocked tasks.      |
| `TESTING.md`              | Required local checks before marking work complete.  |
| `ARCHITECTURE.md`         | Runtime and module overview.                         |
| `ROUTE_MAP.md`            | UI route map.                                        |
| `API_CONTRACT.md`         | Endpoint/auth summary.                               |
| `DATABASE_SCHEMA.md`      | Table/module ownership summary.                      |

## Current Status

- Local product feature scope is implemented through SPRINT-06.
- Backend verification is green locally: unit serial, e2e serial, and live API smoke.
- PostgreSQL + Redis are required for localhost development.
- TASK-061..065 deploy tasks are placeholders only until local review is accepted.

## Branch And Task Rules

- Work one task at a time.
- Read the task spec and linked docs before code.
- Do not mark DONE until code, tests, docs, and board/session state agree.
- Do not push from the agent; user owns remote pushes.
- Never commit `.env`, secrets, tokens, or credentials.
