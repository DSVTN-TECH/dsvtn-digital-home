# Contributing

How to work a change in this repo. This file supersedes the old branching note.

## Branching

Work one change at a time, branched off `develop`.

```bash
git switch develop
git pull --ff-only
git switch -c <type>/<short-kebab-summary>
```

Branch `type` is one of `feat`, `fix`, `chore`, `docs`, `refactor`, `test`,
`ci` — matching the commit type below.

## Commit messages

Conventional commits, subject ≤ 72 characters:

```
<type>(<scope>): <subject>
```

Examples:

```
feat(shop): add product detail page
fix(auth): clear refresh cookie on logout
docs(readme): rewrite in-repo docs index
```

## Pre-commit gates (mandatory)

Run the gates relevant to your change before committing. See
[`TESTING.md`](TESTING.md) for the full matrix.

```bash
npm run typecheck:all
npm run lint:all
npm --prefix backend run test       # when touching backend
npm --prefix backend run test:e2e   # when touching any backend endpoint
npm --prefix frontend run build     # when touching frontend
```

If any gate fails, fix it before committing. Never bypass hooks with
`--no-verify`.

## Staging and committing

```bash
git status
git diff
git add <only the files for this change>   # never `git add .`
git commit -m "<type>(<scope>): <subject>"
```

Stage only the files belonging to the current change. Do not combine unrelated
changes in one commit.

## Hard rules

- Never run `git push` — pushing is the user's responsibility.
- Never force-push, `git reset --hard`, `git clean -fd`, or delete branches
  without explicit instruction.
- Never change git config.
- Never commit `.env` files, secrets, tokens, or credentials.
- Commit only when explicitly asked. If unsure, ask first.

## Docs stay in sync

When a change touches an area with a doc, update the doc in the same change:

| Change                  | Update                                                          |
| ----------------------- | --------------------------------------------------------------- |
| API endpoint or shape   | [`API_CONTRACT.md`](API_CONTRACT.md)                            |
| Database schema         | [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) + a Prisma migration |
| New route               | [`ROUTE_MAP.md`](ROUTE_MAP.md)                                  |
| Backend module/layering | [`BACKEND_STRUCTURE.md`](BACKEND_STRUCTURE.md)                  |
| Frontend structure      | [`FRONTEND_STRUCTURE.md`](FRONTEND_STRUCTURE.md)                |
| Local setup or env      | [`LOCAL_SETUP.md`](LOCAL_SETUP.md)                              |
