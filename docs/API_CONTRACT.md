# API Contract Quick Reference

## Auth

Cookie auth, not Bearer localStorage.

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`

Login returns safe user data only; access/refresh tokens are set by cookie. State-changing protected requests require `X-CSRF-Token`.

## Major modules

- Users/invites: `/api/admin/users`, `/api/admin/invites`, `/api/public/invites/{token}/accept`
- Volunteer: `/api/public/volunteer-applications`, `/api/admin/volunteer-applications`
- Articles: `/api/public/articles`, `/api/admin/articles`
- Activities/matching: `/api/admin/activities`, `/api/member/activities`, matcher and assignment endpoints
- Shop/orders: `/api/public/products`, `/api/public/orders`, `/api/admin/products`, `/api/admin/orders`
- Member zone: notifications, profile, badges, leaderboard, streak, feed, impact
- Gallery/campaigns/reports: public gallery/campaigns, admin reports/fundraising

Full source: `../docs/07-api/API_CONTRACT.md`.
