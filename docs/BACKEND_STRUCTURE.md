# Backend Structure

> Full detail: `../docs/05-backend/BACKEND_STRUCTURE.md`, `SERVICE_RULES.md`

## Directory layout

```
backend/src/
  app.module.ts
  main.ts
  common/
    email/          EmailProvider interface + impls
    events/         typed event classes
    filters/        AllExceptionsFilter
    repository/     repository tokens + base types
  modules/
    auth/           login, JWT, guards, change-password
    users/          internal accounts
    invites/        token-based invite
    volunteer-applications/
    articles/
    activities/     activities + tasks + registrations
    matching/       matcher pure fn + assignments
    shop/           products + orders
    profile/
    badges/
    gamification/   points ledger + streak + leaderboard
    notifications/
    gallery/
    campaigns/
    reports/
  prisma/
    prisma.service.ts
```

## Repository pattern (ADR-0001)

```ts
// abstract
export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>
}

// impl
@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}
  findById(id: string) { return this.prisma.user.findUnique({ where: { id } }) }
}

// token
export const USERS_REPOSITORY = 'USERS_REPOSITORY'

// module
{ provide: USERS_REPOSITORY, useClass: PrismaUsersRepository }

// service
constructor(@Inject(USERS_REPOSITORY) private repo: UsersRepository) {}
```

## DTO rules

- `class-validator` + `class-transformer`
- Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`
- Never return `passwordHash`
