# Frontend Structure

> Full detail: `../docs/06-frontend/FRONTEND_STRUCTURE.md`, `ROUTING.md`, `API_CLIENT.md`

## Directory layout

```
frontend/
  app/
    (public)/       landing, news, shop, volunteer, fundraising, gallery
    login/
    auth/           change-password
    invite/         accept
    admin/          dashboard, users, accounts, activities, orders, products,
                    articles, gallery, campaigns, fundraising, reports
    member/         feed, impact, profile, notifications, streak, recap,
                    activities, assignments
    logistic/       orders
  components/
    ui/             shadcn/ui primitives
    forms/          VolunteerForm, OrderForm, ...
    shared/         MarkdownView, NotificationBell, AdminTopBar, ...
    shop/           cart drawer, product card, ...
  lib/
    api.ts          apiFetch + ApiError
    auth.ts         getToken, setToken, clearToken
    datasource/     interfaces + api + mock impls + factory
    mock/           fixture data
  hooks/            useAuth, useVolunteerSubmit, ...
  types/
    api.ts          shared TypeScript types
```

## Data-source pattern (ADR-0002)

```ts
// interface
export interface ShopDataSource {
  listProducts(): Promise<Product[]>;
}

// factory (lib/datasource/shop.ts)
const mode = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";
export function getShopDataSource(): ShopDataSource {
  return mode === "api" ? new ApiShopDataSource() : new MockShopDataSource();
}
```

Switch `NEXT_PUBLIC_DATA_SOURCE=api` in `.env.local` to hit the real backend.

## Rules

- Components never call `fetch` directly — always go through datasource or `apiFetch`.
- No global state store; local state + datasource calls only.
- `must_change_password` flag in auth context → redirect to `/auth/change-password`.
