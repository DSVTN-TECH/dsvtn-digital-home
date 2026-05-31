# Run and Use the Local Product

Once [`LOCAL_SETUP.md`](LOCAL_SETUP.md) is complete, use this guide to log in
and exercise the product end to end. The flows below assume the seed has been
applied (`npx --prefix backend prisma db seed`).

## URLs

| Surface       | URL                                    |
| ------------- | -------------------------------------- |
| Frontend      | `http://localhost:3000`                |
| Backend API   | `http://localhost:3001/api`            |
| Health check  | `http://localhost:3001/api/health`     |
| Swagger       | `http://localhost:3001/api/docs`       |
| Prisma Studio | `http://localhost:5555` (when started) |

## Demo accounts

All passwords below are local-only fixtures. Never reuse them in staging or
production.

| Email               | Password    | Role       | Notes                          |
| ------------------- | ----------- | ---------- | ------------------------------ |
| `admin@dsvtn.vn`    | `changeme`  | `ADMIN`    | `must_change_password = false` |
| `member1@dsvtn.vn`  | `member1`   | `MEMBER`   | Active member.                 |
| `member2@dsvtn.vn`  | `member2`   | `MEMBER`   | Active member.                 |
| `logistic@dsvtn.vn` | `logistic1` | `LOGISTIC` | Order processing only.         |

Accounts created by an admin (or via invite) start with `must_change_password = true`
and are forced through `/auth/change-password` before any business route is
reachable.

## Auth behavior

The browser receives three cookies on login:

- `dsvtn_access` — short-lived access token (httpOnly).
- `dsvtn_refresh` — refresh token (httpOnly).
- `dsvtn_csrf` — readable CSRF token used as the `X-CSRF-Token` header on
  protected mutations.

All API calls from the frontend use `credentials: 'include'`. Unsafe protected
requests (`POST`/`PUT`/`PATCH`/`DELETE`) require an `X-CSRF-Token` header that
matches the `dsvtn_csrf` cookie.

Expected redirects:

| Situation                                   | Behavior                                             |
| ------------------------------------------- | ---------------------------------------------------- |
| Unauthenticated user hits a protected route | Redirect to `/login`.                                |
| Authenticated user with wrong role          | Access-denied page or redirect away.                 |
| `must_change_password = true`               | Redirect to `/auth/change-password` until completed. |
| Disabled user with valid cookie             | Server returns 401; frontend redirects to `/login`.  |

## Public smoke flow

1. Open `/`. The landing page renders without auth.
2. Open `/volunteer` and submit a valid application.
3. Open `/news` and a news detail page.
4. Open `/shop`, add a product to cart, open the cart drawer, proceed to checkout.
5. Submit checkout with a valid HTTPS payment-proof URL.
6. Open `/fundraising` and confirm campaign progress renders.

## Admin smoke flow

1. Log in as `admin@dsvtn.vn`.
2. Open `/admin/volunteer-applications`, review the list and a detail page.
3. Open `/admin/users` (or `/admin/accounts`) and create an internal member.
4. Open `/admin/activities`, create an activity, then add tasks.
5. Have member accounts register and submit preferences (see member flow).
6. Open `/admin/activities/[id]/matcher` and run the matcher.
7. Manage articles (`/admin/articles`), products (`/admin/products`), orders
   (`/admin/orders`), reports (`/admin/reports`), campaigns
   (`/admin/campaigns`), gallery (`/admin/gallery`), and accounts
   (`/admin/accounts`).

## Member smoke flow

1. Log in as `member1@dsvtn.vn`.
2. If prompted, complete `/auth/change-password`.
3. Open `/member/activities` and an activity detail.
4. Submit per-task preference scores for an OPEN activity.
5. After the matcher runs, open `/member/assignments`.
6. Open `/member/notifications`, `/member/profile`, `/member/streak`,
   `/member/recap`, `/member/feed`, `/member/impact`.

## Logistic smoke flow

1. Log in as `logistic@dsvtn.vn`.
2. Open `/logistic/orders`.
3. Confirm, reject, or deliver orders following the allowed transitions.
4. Confirm logistic users cannot reach admin-only activity, user, or report
   pages (the routes redirect or 403).

## Sanity checks

- Login response body never contains `password_hash`.
- `GET /api/auth/me` returns the current user without `password_hash`.
- `POST` without a CSRF token returns 403 (`CSRF_INVALID`).
- Logout clears all three cookies.
- Disabled users (set via Prisma Studio) cannot use a previously valid cookie.

If any of these fail, see [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md).
