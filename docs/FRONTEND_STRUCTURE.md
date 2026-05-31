# Frontend Structure

Next.js 15 (App Router) + React 19 + Tailwind v4 + shadcn/ui in `frontend/`.

## Directory layout

```
frontend/
├── app/
│   ├── layout.tsx                 # root layout
│   ├── globals.css                # Tailwind v4 base
│   │
│   ├── (public)/                  # no auth required
│   │   ├── page.tsx               # landing
│   │   ├── news/                  # /news, /news/[id]
│   │   ├── shop/                  # /shop, /shop/[id], /shop/checkout
│   │   ├── volunteer/             # /volunteer
│   │   └── fundraising/           # /fundraising
│   │
│   ├── login/                     # /login
│   ├── auth/change-password/      # forced password change
│   ├── invite/accept/             # invite acceptance
│   │
│   ├── admin/                     # ADMIN role
│   ├── member/                    # MEMBER role
│   └── logistic/                  # LOGISTIC role
│
├── components/
│   ├── ui/                        # shadcn/ui primitives
│   ├── shared/                    # shells (Navbar, AdminTopBar, NotificationBell, …)
│   ├── forms/                     # feature forms (VolunteerForm, OrderForm, …)
│   ├── shop/                      # cart drawer, product card
│   └── tables/                    # data tables
│
├── hooks/                         # useAuth, useCart, useVolunteerSubmit, …
│
├── lib/
│   ├── api.ts                     # apiFetch + ApiError
│   ├── auth.ts                    # cookie helpers (CSRF read, redirects)
│   ├── datasource/                # data-source interfaces + factories
│   └── mock/                      # fixture data for the mock data-source
│
└── types/
    └── api.ts                     # shared TypeScript types matching the API
```

## Route groups and roles

| Group                  | Auth     | Role       | Notes                                             |
| ---------------------- | -------- | ---------- | ------------------------------------------------- |
| `(public)`             | none     | —          | Landing, news, volunteer form, shop, fundraising. |
| `login`                | none     | —          | Auth entry point.                                 |
| `auth/change-password` | required | any        | Reachable when `must_change_password = true`.     |
| `invite/accept`        | none     | —          | Token-based account creation.                     |
| `admin/*`              | required | `ADMIN`    | Provisioning, content, activities, reports.       |
| `member/*`             | required | `MEMBER`   | Activities, assignments, profile, engagement.     |
| `logistic/*`           | required | `LOGISTIC` | Order queue only.                                 |

Every authenticated route group has its own `error.tsx` and `loading.tsx` so
errors and pending states are scoped to the role shell.

## Data-source pattern (ADR-0002)

Components do not call `fetch` directly. Each domain exposes an interface with
two implementations selected by `NEXT_PUBLIC_DATA_SOURCE`.

```ts
// frontend/lib/datasource/shop.ts
export interface ShopDataSource {
  listProducts(): Promise<Product[]>;
}

const mode = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

export function getShopDataSource(): ShopDataSource {
  return mode === "api" ? new ApiShopDataSource() : new MockShopDataSource();
}
```

- `mock` returns local fixtures from `lib/mock/`. Used for UI work without a
  running backend.
- `api` calls the backend via `apiFetch`. Used for full-stack development and
  e2e.

## `apiFetch` and CSRF

`lib/api.ts` exposes a single `apiFetch` wrapper used by every API data-source.
It always:

- Sends `credentials: 'include'`.
- Reads the `dsvtn_csrf` cookie and sets `X-CSRF-Token` on unsafe methods.
- Rejects with a typed `ApiError` carrying `status`, `code`, `message`,
  `details`, and `requestId`.

Frontend handling of well-known errors:

| Status / code              | Behaviour                                                               |
| -------------------------- | ----------------------------------------------------------------------- |
| `401 UNAUTHORIZED`         | Redirect to `/login`.                                                   |
| `403 MUST_CHANGE_PASSWORD` | Redirect to `/auth/change-password`.                                    |
| `403 CSRF_INVALID`         | Re-bootstrap the CSRF cookie once; on second failure surface the error. |
| `429 RATE_LIMITED`         | Toast with retry countdown (`details.retryAfterSeconds`).               |
| `5xx`                      | Generic error UI showing `requestId` for support.                       |

## State management

- No Redux, Zustand, or other global stores.
- Server state: data-source calls plus React Query (where introduced).
- UI-only state: `useState` / React Context (theme, drawers).
- Form state: `react-hook-form` + zod resolvers.

## Naming conventions

| Item           | Convention                 | Example                    |
| -------------- | -------------------------- | -------------------------- |
| Page           | `page.tsx` in route folder | `app/admin/users/page.tsx` |
| Layout         | `layout.tsx`               | `app/admin/layout.tsx`     |
| Error boundary | `error.tsx`                | `app/admin/error.tsx`      |
| Loading state  | `loading.tsx`              | `app/admin/loading.tsx`    |
| Component      | PascalCase                 | `VolunteerForm.tsx`        |
| Hook           | `use*` camelCase           | `useActivities.ts`         |
| Type           | PascalCase                 | `ApplicationStatus`        |

## Accessibility floor

- Use semantic HTML (`<button>`, `<a>`, `<nav>`, `<main>`); never `<div onClick>`.
- Every input has a visible `<label>` or `aria-label`.
- Modals and drawers return focus to their trigger on close, and trap focus
  while open. `Escape` closes them.
- Dynamic regions use `role="alert"` for errors and `aria-live="polite"` for
  status updates.
- Color contrast meets WCAG AA (4.5:1 for body text, 3:1 for large text).
- Skip the `dangerouslySetInnerHTML` escape hatch unless content is sanitised
  (the markdown renderer uses `rehype-sanitize`).

## Forbidden

- Calling `fetch` directly from a component or page.
- Storing tokens in `localStorage` or non-httpOnly cookies.
- Reaching into another role's route group from a component.
- Adding new global state libraries or new icon libraries without an ADR.
