# Route Map

UI routes by role. The corresponding folders live under `frontend/app/`.

Behaviour conventions:

- `Auth: cookie` means the route requires a valid `dsvtn_access` cookie.
- A user with `must_change_password = true` is redirected to
  `/auth/change-password` from any business route.
- A user with the wrong role is redirected away or shown an access-denied page.

## Public

| Path                    | Auth   | Notes                       |
| ----------------------- | ------ | --------------------------- |
| `/`                     | none   | Landing page.               |
| `/login`                | none   | Sign in.                    |
| `/news`                 | none   | Published article list.     |
| `/news/[id]`            | none   | Article detail.             |
| `/volunteer`            | none   | Volunteer application form. |
| `/shop`                 | none   | Product catalogue.          |
| `/shop/[id]`            | none   | Product detail.             |
| `/shop/checkout`        | none   | Order placement.            |
| `/fundraising`          | none   | Active campaign progress.   |
| `/invite/accept`        | none   | Accept an invite token.     |
| `/auth/change-password` | cookie | Forced password change.     |

## Member (`MEMBER`)

| Path                      | Auth   |
| ------------------------- | ------ |
| `/member`                 | cookie |
| `/member/feed`            | cookie |
| `/member/impact`          | cookie |
| `/member/profile`         | cookie |
| `/member/notifications`   | cookie |
| `/member/streak`          | cookie |
| `/member/recap`           | cookie |
| `/member/recap/[id]`      | cookie |
| `/member/activities`      | cookie |
| `/member/activities/[id]` | cookie |
| `/member/assignments`     | cookie |

## Admin (`ADMIN`)

| Path                                 | Auth   |
| ------------------------------------ | ------ |
| `/admin`                             | cookie |
| `/admin/dashboard`                   | cookie |
| `/admin/users`                       | cookie |
| `/admin/accounts`                    | cookie |
| `/admin/volunteer-applications`      | cookie |
| `/admin/volunteer-applications/[id]` | cookie |
| `/admin/activities`                  | cookie |
| `/admin/activities/[id]`             | cookie |
| `/admin/activities/[id]/matcher`     | cookie |
| `/admin/orders`                      | cookie |
| `/admin/products`                    | cookie |
| `/admin/articles`                    | cookie |
| `/admin/articles/new`                | cookie |
| `/admin/articles/[id]`               | cookie |
| `/admin/gallery`                     | cookie |
| `/admin/gallery/[id]`                | cookie |
| `/admin/campaigns`                   | cookie |
| `/admin/fundraising`                 | cookie |
| `/admin/reports`                     | cookie |

## Logistic (`LOGISTIC`)

| Path               | Auth   |
| ------------------ | ------ |
| `/logistic`        | cookie |
| `/logistic/orders` | cookie |

## Redirect rules

| Trigger                                      | Destination                  |
| -------------------------------------------- | ---------------------------- |
| Unauthenticated request to a protected route | `/login`                     |
| `must_change_password = true`                | `/auth/change-password`      |
| Wrong role for a route group                 | role's home or access-denied |
| `401 UNAUTHORIZED` from API                  | `/login`                     |
| `403 MUST_CHANGE_PASSWORD` from API          | `/auth/change-password`      |
