# Branching / Git Workflow

> Full guide: `../docs/13-sprints/BRANCHING.md`

## Current workspace rule

The user decided to work directly on `develop` for this local workflow.

## Hard rules

- Never `git push`. Pushing is the user's job.
- Never `git reset --hard`, `git clean -fd`, or force-push.
- Never use `--no-verify`.
- Never `git add .`; stage specific files only.
- Commit only when explicitly requested.

## Before a commit

```bash
git status
git diff
git log --oneline -10
```

Stage only files belonging to the current task.

## Commit message

```bash
feat(scope): subject
fix(scope): subject
docs(scope): subject
```

Examples:

```bash
feat(030): frontend orders management
feat(031): articles module backend
docs(scope): expand task plan to full ui vision
```
