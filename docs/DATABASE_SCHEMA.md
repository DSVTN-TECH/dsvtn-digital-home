# Database Schema Quick Reference

PostgreSQL is source of truth. Redis is ephemeral infrastructure only.

Core tables:

- users
- volunteer_applications
- articles
- activities, tasks, activity_registrations, task_preferences, assignments
- products, orders, order_items
- notifications
- badges, user_badges
- points_ledger, streaks
- gallery_albums, gallery_photos
- campaigns
- invites

Rules:

- All IDs UUID v4.
- Money values are integer cents.
- No binary files in DB.
- No password_hash in responses.
- `users.must_change_password` gates temporary-password accounts until `/auth/change-password`.
- Redis keys/TTL are documented in `../docs/03-architecture/REDIS_SCALE_PLAN.md`.

Full source: `../docs/08-data/DATABASE_SCHEMA.md`.
