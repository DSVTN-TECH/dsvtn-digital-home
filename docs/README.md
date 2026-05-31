# ĐSVTN Digital Home — Engineering Docs

In-repo engineering documentation for the ĐSVTN Digital Home monorepo
(NestJS backend + Next.js frontend). These docs are self-contained: a new
engineer can set up, run, and verify the product locally using only this
folder.

## Read in this order

| Step | File                                                 | Purpose                                                                  |
| ---- | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| 1    | [`OVERVIEW.md`](OVERVIEW.md)                         | What the product is: modules, roles, core business rules.                |
| 2    | [`LOCAL_SETUP.md`](LOCAL_SETUP.md)                   | Install, configure env, start Postgres + Redis, migrate, seed, run apps. |
| 3    | [`RUN_AND_USE.md`](RUN_AND_USE.md)                   | URLs, demo accounts, per-role smoke flows.                               |
| 4    | [`DATABASE_AND_SWAGGER.md`](DATABASE_AND_SWAGGER.md) | Inspect the DB with Prisma Studio; use Swagger with cookie + CSRF auth.  |
| 5    | [`TESTING.md`](TESTING.md)                           | Local quality gates to run before marking work complete.                 |

## Reference

| File                                             | Purpose                                                               |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| [`ARCHITECTURE.md`](ARCHITECTURE.md)             | Runtime topology, layering, auth model, Redis usage.                  |
| [`BACKEND_STRUCTURE.md`](BACKEND_STRUCTURE.md)   | Module list, repository pattern, DTO/validation, error contract.      |
| [`FRONTEND_STRUCTURE.md`](FRONTEND_STRUCTURE.md) | Route layout, data-source pattern, error/loading states, conventions. |
| [`API_CONTRACT.md`](API_CONTRACT.md)             | Endpoint groups by domain, auth and role required.                    |
| [`ROUTE_MAP.md`](ROUTE_MAP.md)                   | UI routes by role with auth and redirect rules.                       |
| [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md)       | Tables grouped by owning module, data conventions.                    |
| [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)       | Symptom → fix for common local issues.                                |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)             | Branching, commits, and required pre-commit gates.                    |

## Conventions used across these docs

- All commands run from the repository root (`dsvtn-digital-home/`) unless stated otherwise.
- PostgreSQL is the durable source of truth; Redis is ephemeral infrastructure only.
- Auth uses httpOnly cookies plus a CSRF token — never localStorage tokens.
- Money is always stored as integer cents; IDs are UUID v4.
- `password_hash` is never returned in any API response.
