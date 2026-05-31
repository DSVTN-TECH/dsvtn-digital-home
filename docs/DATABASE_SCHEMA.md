# Database Schema

PostgreSQL is the durable source of truth. Redis is ephemeral infrastructure
only; nothing in Redis is a record of business state. The full schema lives in
`backend/prisma/schema.prisma`.

## Conventions

- All primary keys are UUID v4 (`@default(uuid())`).
- Money is stored as integer cents (column suffix `_cents`).
- Timestamps default to `created_at` / `updated_at` (UTC).
- Enums are PostgreSQL enum types defined in `schema.prisma`.
- A module never writes another module's tables directly; cross-module
  effects go through events.
- `password_hash` is never returned by the API.
- Soft-delete is not used by default; business records are archived via status
  enums (`ARCHIVED`, `CLOSED`, `CANCELLED`, etc.) rather than deletion.

## Tables grouped by owning module

### Auth and users

| Table     | Purpose                                                                                |
| --------- | -------------------------------------------------------------------------------------- |
| `users`   | Internal accounts. Carries `role`, `status`, `must_change_password`, `fairness_score`. |
| `invites` | Token-based invitations. Stores only a SHA-256 `token_hash`.                           |

### Volunteer applications

| Table                    | Purpose                                                   |
| ------------------------ | --------------------------------------------------------- |
| `volunteer_applications` | Public applications with review state and `email_status`. |

### Articles

| Table      | Purpose                                                                               |
| ---------- | ------------------------------------------------------------------------------------- |
| `articles` | Public news content with `DRAFT` / `PUBLISHED` / `ARCHIVED` status and unique `slug`. |

### Activities and matching

| Table                    | Purpose                                                                      |
| ------------------------ | ---------------------------------------------------------------------------- |
| `activities`             | Activity header (status: `DRAFT`, `OPEN`, `CLOSED`, `MATCHED`, `COMPLETED`). |
| `tasks`                  | Tasks under an activity, with `slot_count` and `priority`.                   |
| `activity_registrations` | One member's registration to an activity (unique per user).                  |
| `task_preferences`       | Per-task preference scores attached to a registration.                       |
| `assignments`            | Matcher or manual task assignments (status + `source`).                      |

### Shop and campaigns

| Table         | Purpose                                                                   |
| ------------- | ------------------------------------------------------------------------- |
| `products`    | Catalogue items with `price_cents` and status.                            |
| `orders`      | Public orders with `payment_proof_url`, `status`, optional `campaign_id`. |
| `order_items` | Line items, each with `quantity` and `unit_price_cents`.                  |
| `campaigns`   | Fundraising campaigns with `goal_cents` and date range.                   |

### Member engagement

| Table           | Purpose                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `notifications` | Per-user notifications with `is_read` flag.                             |
| `badges`        | Badge catalogue keyed by unique `code`.                                 |
| `user_badges`   | Awarded badges (unique per `user_id` + `badge_id`).                     |
| `points_ledger` | Append-only point movements; unique `(source_type, source_id, reason)`. |
| `streaks`       | Per-user current and longest streak with `last_activity_date`.          |

### Gallery

| Table            | Purpose                                               |
| ---------------- | ----------------------------------------------------- |
| `gallery_albums` | Recap albums, optionally tied to an `activity_id`.    |
| `gallery_photos` | Photos belonging to an album, sorted by `sort_order`. |

## Enums

| Enum                 | Values                                                                      |
| -------------------- | --------------------------------------------------------------------------- |
| `Role`               | `ADMIN`, `MEMBER`, `LOGISTIC`                                               |
| `UserStatus`         | `ACTIVE`, `DISABLED`                                                        |
| `ApplicationStatus`  | `PENDING`, `APPROVED`, `REJECTED`                                           |
| `ArticleStatus`      | `DRAFT`, `PUBLISHED`, `ARCHIVED`                                            |
| `ActivityStatus`     | `DRAFT`, `OPEN`, `CLOSED`, `MATCHED`, `COMPLETED`                           |
| `RegistrationStatus` | `SUBMITTED`, `CANCELLED`                                                    |
| `AssignmentSource`   | `MATCHER`, `MANUAL`                                                         |
| `AssignmentStatus`   | `PROPOSED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`                           |
| `ProductStatus`      | `ACTIVE`, `INACTIVE`                                                        |
| `OrderStatus`        | `PENDING_PAYMENT_REVIEW`, `CONFIRMED`, `REJECTED`, `DELIVERED`, `CANCELLED` |
| `EmailStatus`        | `NOT_CONFIGURED`, `SENT`, `FAILED`                                          |
| `CampaignStatus`     | `DRAFT`, `ACTIVE`, `CLOSED`                                                 |
| `InviteStatus`       | `PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`                                 |

## Migrations

Migrations live in `backend/prisma/migrations/`. Apply with:

```bash
npx --prefix backend prisma migrate dev    # create + apply locally
npx --prefix backend prisma migrate deploy # apply pre-existing migrations only
npx --prefix backend prisma generate       # regenerate the Prisma client
```

If the local database has drifted, recreate it with the user's permission
(this wipes data):

```bash
docker compose down -v       # ⚠ wipes the volume
docker compose up -d db redis
npx --prefix backend prisma migrate deploy
npx --prefix backend prisma db seed
```
