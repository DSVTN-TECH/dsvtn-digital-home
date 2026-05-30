# Run And Use Local Product

## URLs

| Surface       | URL                                  |
| ------------- | ------------------------------------ |
| Frontend      | `http://localhost:3000`              |
| Backend API   | `http://localhost:3001/api`          |
| Swagger       | `http://localhost:3001/api/docs`     |
| Prisma Studio | `http://localhost:5555` when started |

## Demo Accounts

Seed data must document active credentials in root `docs/08-data/SEED_DATA.md`.

Current expected admin:

- Email: `admin@dsvtn.vn`
- Password: `changeme`
- Role: `ADMIN`
- `must_change_password=false`

Temporary-password users created by Admin must be forced through `/auth/change-password`.

## Public Smoke

1. Open `/`.
2. Open `/volunteer`, submit a valid volunteer application.
3. Open `/news` and one news detail.
4. Open `/shop`, add product to cart, open cart panel, go to checkout.
5. Submit checkout with HTTPS payment proof URL.
6. Open `/fundraising` once campaigns are implemented.

## Admin Smoke

1. Login as admin.
2. Review volunteer application list and detail.
3. Create internal member/logistic user.
4. Create activity and tasks.
5. Open matcher page after member registration and run matcher.
6. Manage articles, products, orders, reports, campaigns, gallery, and accounts as tasks become implemented.

## Member Smoke

1. Login as member.
2. If temporary password, complete `/auth/change-password`.
3. Open `/member/activities` and activity detail.
4. Submit preferences for an OPEN activity.
5. Open assignments, notifications, profile, streak, recap, feed, and impact pages as tasks become implemented.

## Logistic Smoke

1. Login as logistic.
2. Open `/logistic/orders`.
3. Confirm/reject/deliver orders according to allowed transitions.
4. Confirm logistic cannot access admin-only activity/user/report actions.

## Expected Auth Behavior

- Browser requests use cookies with `credentials: include`.
- Unsafe protected requests include `X-CSRF-Token`.
- Missing auth redirects to `/login`.
- Wrong role shows/redirects to an access-denied path.
- `mustChangePassword` redirects to `/auth/change-password`.
