# Backend Structure

NestJS 11 + Prisma 6 monorepo backend in `backend/`.

## Directory layout

```
backend/
├── prisma/
│   ├── schema.prisma            # single source of truth for the DB
│   ├── seed.ts                  # idempotent local seed
│   └── migrations/              # generated SQL migrations
└── src/
    ├── main.ts                  # bootstrap: prefix, filters, CSRF, pipes, CORS, Swagger
    ├── app.module.ts            # root module wiring
    │
    ├── config/                  # env validation (zod) + ConfigModule
    ├── prisma/                  # PrismaService (global)
    ├── health/                  # GET /api/health
    │
    ├── common/                  # cross-cutting providers
    │   ├── redis/               # ioredis wrapper, failure-soft
    │   ├── cache/               # CacheService (get/set/invalidate)
    │   ├── queue/               # QueueService for side effects
    │   ├── lock/                # LockService.withLock(...)
    │   ├── rate-limit/          # RateLimitGuard + @RateLimit
    │   ├── idempotency/         # IdempotencyInterceptor + @Idempotent
    │   ├── events/              # typed domain-event classes
    │   ├── email/               # EmailProvider interface + impls
    │   ├── filters/             # AllExceptionsFilter
    │   ├── repository/          # repository tokens + base types
    │   └── security/            # csrf.middleware
    │
    └── modules/
        ├── auth/                # login, refresh, logout, me, change-password
        ├── users/               # admin user CRUD, temp passwords
        ├── invites/             # token-based invitations
        ├── volunteer-applications/
        ├── articles/
        ├── activities/          # activities + tasks + registrations
        ├── matching/            # pure matcher + assignments
        ├── shop/                # products + orders
        ├── notifications/
        ├── profile/
        ├── badges/
        ├── gamification/        # points ledger + streaks + leaderboard
        ├── gallery/
        ├── campaigns/
        └── reports/
```

## Bootstrap (`main.ts`)

`main.ts` configures:

- Global prefix `/api`.
- `AllExceptionsFilter` as the global filter.
- `csrfMiddleware` for protected mutations.
- Global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`.
- Credentialed CORS restricted to `ALLOWED_ORIGINS`.
- Swagger UI at `/api/docs` in non-production environments.

## Repository pattern (ADR-0001)

Every module owns one aggregate root. Services depend on the abstract
repository, never on the Prisma implementation directly.

```ts
// abstract
export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>
}

// implementation
@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}
  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }
}

// DI token
export const USERS_REPOSITORY = 'USERS_REPOSITORY'

// module
{ provide: USERS_REPOSITORY, useClass: PrismaUsersRepository }

// service
constructor(@Inject(USERS_REPOSITORY) private repo: UsersRepository) {}
```

The same shape applies to every module. `LSP` is the test: a module's tests
written against the abstract repository must pass against any concrete
implementation.

## DTOs and validation

- Every controller method takes a DTO class with `class-validator` decorators.
- The global `ValidationPipe` strips unknown properties (`whitelist`) and
  rejects requests that include forbidden ones (`forbidNonWhitelisted`).
- `transform: true` converts incoming primitives into their declared types.
- Never pull values directly from `request.body` in controllers.

## Error contract

`AllExceptionsFilter` normalises all errors to:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Human-readable summary",
  "details": { "...": "optional structured data" },
  "requestId": "uuid"
}
```

Common codes:

| Code                   | When                                              |
| ---------------------- | ------------------------------------------------- |
| `VALIDATION_ERROR`     | DTO validation failed.                            |
| `UNAUTHORIZED`         | Missing or invalid auth.                          |
| `FORBIDDEN`            | Authenticated but role/ownership/CSRF rejected.   |
| `MUST_CHANGE_PASSWORD` | User must complete `/auth/change-password` first. |
| `CSRF_INVALID`         | Missing or mismatched `X-CSRF-Token`.             |
| `NOT_FOUND`            | Resource does not exist.                          |
| `CONFLICT`             | State conflict (e.g. concurrent matcher run).     |
| `RATE_LIMITED`         | Includes `details.retryAfterSeconds`.             |
| `INTERNAL_ERROR`       | Unhandled exception (logged with `requestId`).    |

## Cross-cutting providers (quick reference)

| Provider                 | Use it when                   | Decorator/API                                        |
| ------------------------ | ----------------------------- | ---------------------------------------------------- |
| `RateLimitGuard`         | Throttle a route per IP/user  | `@RateLimit({ scope, limit, windowSec })`            |
| `IdempotencyInterceptor` | Replay-safe mutations         | `@Idempotent({ ttlSec })` + `Idempotency-Key` header |
| `LockService`            | Serialise concurrent work     | `lockService.withLock(key, ttl, fn)`                 |
| `CacheService`           | Cache aggregates              | `cache.get/set/invalidate`                           |
| `QueueService`           | Run side effects after commit | `queue.enqueue(jobName, payload)`                    |
| `EventEmitter2`          | Decoupled domain events       | `eventEmitter.emit(EVENT, payload)`                  |

All providers degrade safely when Redis is unavailable. See
[`ARCHITECTURE.md`](ARCHITECTURE.md) for fallback behaviour.

## Testing

- Unit tests live alongside source (`*.spec.ts`).
- E2E tests live in `backend/test/` and use Supertest against a real DB +
  Redis.
- Coverage threshold (lines/branches/functions/statements) is enforced; do
  not lower it. See [`TESTING.md`](TESTING.md) for the local gates.
