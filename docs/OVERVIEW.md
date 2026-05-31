# Product Overview

ĐSVTN Digital Home is an internal management platform plus public portal for a
student volunteer team (Đội Sinh viên Tình nguyện). It replaces spreadsheet and
chat-based coordination with one application covering recruitment, account
provisioning, activity and task assignment, a fundraising shop, content, and
member engagement.

## Roles

| Role       | Who                 | Can do                                                                                                                                                   |
| ---------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN`    | Team leadership     | Review applications, provision accounts and invites, manage activities/tasks, run the matcher, manage articles/products/campaigns/gallery, view reports. |
| `MEMBER`   | Internal volunteers | Register for open activities, submit task preferences, view assignments, see notifications/profile/streak/recap/feed/impact.                             |
| `LOGISTIC` | Logistics staff     | Process the fundraising order queue and move orders through allowed status transitions only.                                                             |

There is no public self-signup. Internal accounts are created by an admin or
through an invite link. The public portal (landing, news, shop, volunteer form,
fundraising) is open to anyone.

## Modules

| Module                 | Responsibility                                                      |
| ---------------------- | ------------------------------------------------------------------- |
| Auth                   | Cookie-based login, refresh, logout, current user, change password. |
| Users                  | Admin-only internal account CRUD; temporary-password provisioning.  |
| Invites                | Token-based invitations; public accept endpoint.                    |
| Volunteer Applications | Public application submission; admin review workflow.               |
| Articles               | Lightweight CMS for public news (draft/published/archived).         |
| Activities             | Activities, their tasks, and member registrations.                  |
| Matching               | Deterministic greedy task matcher plus assignment management.       |
| Shop                   | Public product catalogue and order placement.                       |
| Notifications          | Per-user in-app notifications.                                      |
| Profile / Badges       | Member profile and earned badges.                                   |
| Gamification           | Points ledger, streaks, leaderboard.                                |
| Gallery                | Activity recap albums and photos.                                   |
| Campaigns              | Fundraising campaigns tied to shop orders.                          |
| Reports                | Admin dashboard and overview aggregations with CSV export.          |

## Core workflows

1. **Recruitment** — a visitor submits the public volunteer form; an admin
   reviews and approves or rejects it.
2. **Provisioning** — an admin creates an internal account (or sends an invite);
   the new user logs in and is forced to change a temporary password.
3. **Activity matching** — an admin opens an activity with tasks; members
   register and submit per-task preference scores; the admin runs the greedy
   matcher to produce assignments and a waitlist.
4. **Fundraising order** — a visitor adds products to a cart and checks out with
   a payment-proof URL; logistic staff confirm, reject, or deliver the order.
5. **Engagement** — completed activities award points and badges, update
   streaks, and feed member impact and recap pages.

## The matcher

The matcher (`backend/src/modules/matching/matcher.ts`) is a pure function with
no database dependency. It is deterministic: the same input always produces the
same output. Invariants it must preserve:

- No task receives more assignments than its `slotCount`.
- Each member gets at most one assignment per run.
- Assignments ∪ waitlist = all submitted registrations.
- Edge cases (no tasks, no registrations, zero slots) are handled without error.

## Core business rules

- All primary keys are UUID v4.
- Money is stored as integer cents (`*_cents`); never use floats.
- `password_hash` is never returned in any API response.
- `users.must_change_password = true` blocks business routes until the user
  completes `/auth/change-password`.
- Disabled users are rejected even with otherwise valid credentials.
- No binary file uploads; images and payment proofs are URLs.
- A module never writes another module's tables directly.

## Tech stack

| Layer                | Technology                                      |
| -------------------- | ----------------------------------------------- |
| Runtime              | Node.js 24.16.0                                 |
| Language             | TypeScript 5.8                                  |
| Backend              | NestJS 11, Prisma 6                             |
| Database             | PostgreSQL 17                                   |
| Cache / queue / lock | Redis 7                                         |
| Frontend             | Next.js 15 (App Router), React 19               |
| Styling              | Tailwind CSS v4, shadcn/ui                      |
| Validation           | class-validator (backend), zod (frontend + env) |
