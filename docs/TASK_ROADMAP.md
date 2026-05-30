# Task Roadmap Quick Reference

## Historical Completed Work

- H01-H06: `DONE_HISTORY`
- TASK-001..036: `DONE_HISTORY`

Historical task specs may include superseded MVP/Bearer/no-Redis assumptions. Do not copy those assumptions into new work.

## Review Pending

- H07 Cookie auth refactor: local uncommitted implementation exists, awaiting user review/commit.
- TASK-055 force-change-password is covered by H07 and remains review-pending with it.

## Next Before Features

1. Review/commit H07.
2. H08 Redis local infrastructure.
3. H09 Request hardening: rate limit, idempotency, locks.
4. H10 Cache/queue/event infrastructure.
5. H11 UX baseline/shared shells.

## Then Continue

- TASK-037..048 Member Zone & Engagement.
- TASK-049..054 Insights & Fundraising.
- TASK-056..060 Polish & Auth.

## Placeholder Only

TASK-061..065 deploy tasks. Do not implement until full local product passes PostgreSQL + Redis + backend + frontend + Swagger + role smoke gates.

Full source: `../docs/20-sprints/PROGRESS_BOARD.md`.
