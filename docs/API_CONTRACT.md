# API Contract

Quick reference for the REST API. The live, always-current source is Swagger
at `http://localhost:3001/api/docs`.

## Conventions

- Base path: `/api`.
- Auth is cookie-based. Login sets `dsvtn_access`, `dsvtn_refresh`, and
  `dsvtn_csrf`.
- Protected mutations (`POST`/`PUT`/`PATCH`/`DELETE`) require an
  `X-CSRF-Token` header matching the `dsvtn_csrf` cookie.
- Responses never include `password_hash`.
- Errors follow the shared error contract (see
  [`BACKEND_STRUCTURE.md`](BACKEND_STRUCTURE.md)).

## Auth

| Method | Path                        | Auth           | Purpose                            |
| ------ | --------------------------- | -------------- | ---------------------------------- |
| `POST` | `/api/auth/login`           | none           | Authenticate; sets auth cookies.   |
| `POST` | `/api/auth/refresh`         | refresh cookie | Rotate the access token.           |
| `POST` | `/api/auth/logout`          | cookie         | Clear all auth cookies.            |
| `GET`  | `/api/auth/me`              | cookie         | Current user (no `password_hash`). |
| `POST` | `/api/auth/change-password` | cookie         | Complete a forced password change. |

## Health

| Method | Path          | Auth | Purpose                                |
| ------ | ------------- | ---- | -------------------------------------- |
| `GET`  | `/api/health` | none | Liveness + DB/Redis dependency status. |

## Users and invites

| Method  | Path                                 | Role  | Purpose                                  |
| ------- | ------------------------------------ | ----- | ---------------------------------------- |
| `GET`   | `/api/admin/users`                   | ADMIN | List internal users.                     |
| `POST`  | `/api/admin/users`                   | ADMIN | Create a user with a temporary password. |
| `GET`   | `/api/admin/invites`                 | ADMIN | List invitations.                        |
| `POST`  | `/api/admin/invites`                 | ADMIN | Create an invitation.                    |
| `PATCH` | `/api/admin/invites/{id}/revoke`     | ADMIN | Revoke a pending invitation.             |
| `POST`  | `/api/public/invites/{token}/accept` | none  | Accept an invite and set a password.     |

## Volunteer applications

| Method  | Path                                     | Role  | Purpose                |
| ------- | ---------------------------------------- | ----- | ---------------------- |
| `POST`  | `/api/public/volunteer-applications`     | none  | Submit an application. |
| `GET`   | `/api/admin/volunteer-applications`      | ADMIN | List applications.     |
| `GET`   | `/api/admin/volunteer-applications/{id}` | ADMIN | Application detail.    |
| `PATCH` | `/api/admin/volunteer-applications/{id}` | ADMIN | Approve or reject.     |

## Articles

| Method   | Path                          | Role  | Purpose                    |
| -------- | ----------------------------- | ----- | -------------------------- |
| `GET`    | `/api/public/articles`        | none  | List published articles.   |
| `GET`    | `/api/public/articles/{slug}` | none  | Published article detail.  |
| `GET`    | `/api/admin/articles`         | ADMIN | List all articles.         |
| `POST`   | `/api/admin/articles`         | ADMIN | Create a draft.            |
| `PATCH`  | `/api/admin/articles/{id}`    | ADMIN | Update or publish/archive. |
| `DELETE` | `/api/admin/articles/{id}`    | ADMIN | Delete an article.         |

## Activities, registrations, matching

| Method | Path                                     | Role   | Purpose                               |
| ------ | ---------------------------------------- | ------ | ------------------------------------- |
| `POST` | `/api/admin/activities`                  | ADMIN  | Create an activity.                   |
| `GET`  | `/api/admin/activities`                  | ADMIN  | List activities.                      |
| `POST` | `/api/admin/activities/{id}/tasks`       | ADMIN  | Add tasks to an activity.             |
| `GET`  | `/api/member/activities`                 | MEMBER | List open activities.                 |
| `POST` | `/api/member/activities/{id}/register`   | MEMBER | Register and submit task preferences. |
| `POST` | `/api/admin/activities/{id}/matcher/run` | ADMIN  | Run the greedy matcher.               |
| `GET`  | `/api/member/assignments`                | MEMBER | View own assignments.                 |

## Shop and orders

| Method  | Path                            | Role           | Purpose                                  |
| ------- | ------------------------------- | -------------- | ---------------------------------------- |
| `GET`   | `/api/public/products`          | none           | List active products.                    |
| `GET`   | `/api/public/products/{id}`     | none           | Product detail.                          |
| `POST`  | `/api/public/orders`            | none           | Place an order with a payment-proof URL. |
| `GET`   | `/api/admin/products`           | ADMIN          | Manage products.                         |
| `GET`   | `/api/admin/orders`             | ADMIN/LOGISTIC | Order queue.                             |
| `PATCH` | `/api/admin/orders/{id}/status` | ADMIN/LOGISTIC | Transition order status.                 |

## Member zone

| Method  | Path                                  | Role   | Purpose                     |
| ------- | ------------------------------------- | ------ | --------------------------- |
| `GET`   | `/api/member/notifications`           | MEMBER | List notifications.         |
| `PATCH` | `/api/member/notifications/{id}/read` | MEMBER | Mark as read.               |
| `GET`   | `/api/member/profile`                 | MEMBER | Profile + badges.           |
| `GET`   | `/api/member/streak`                  | MEMBER | Current and longest streak. |
| `GET`   | `/api/member/leaderboard`             | MEMBER | Points leaderboard.         |
| `GET`   | `/api/member/impact`                  | MEMBER | Aggregated personal impact. |

## Gallery, campaigns, reports

| Method | Path                              | Role  | Purpose                       |
| ------ | --------------------------------- | ----- | ----------------------------- |
| `GET`  | `/api/public/gallery`             | none  | Public recap albums.          |
| `GET`  | `/api/public/campaigns`           | none  | Active fundraising campaigns. |
| `GET`  | `/api/admin/gallery`              | ADMIN | Manage albums and photos.     |
| `GET`  | `/api/admin/campaigns`            | ADMIN | Manage campaigns.             |
| `GET`  | `/api/admin/reports/dashboard`    | ADMIN | Dashboard aggregates.         |
| `GET`  | `/api/admin/reports/overview`     | ADMIN | Overview aggregates.          |
| `GET`  | `/api/admin/reports/overview.csv` | ADMIN | CSV export honoring filters.  |

> Endpoint paths above are a working reference. When path or shape details
> matter, confirm against Swagger (`/api/docs`), which is generated from the
> live controllers and DTOs.
