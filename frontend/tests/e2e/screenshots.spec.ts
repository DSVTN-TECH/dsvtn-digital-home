import { test, type Page } from '@playwright/test'

const ADMIN = {
  id: '00000000-0000-0000-0000-000000000001',
  fullName: 'Admin ĐSVTN',
  email: 'admin@dsvtn.vn',
  role: 'ADMIN',
  mustChangePassword: false,
}

const MEMBER = {
  id: '00000000-0000-0000-0000-000000000002',
  fullName: 'Nguyễn Thành Viên',
  email: 'member1@dsvtn.vn',
  role: 'MEMBER',
  mustChangePassword: false,
}

const LOGISTIC = {
  id: '00000000-0000-0000-0000-000000000004',
  fullName: 'Lê Hậu Cần',
  email: 'logistic@dsvtn.vn',
  role: 'LOGISTIC',
  mustChangePassword: false,
}

const CART = [
  {
    product: {
      id: '00000000-0000-0000-0000-0000000000a1',
      name: 'Áo polo SVTN 2026',
      description: 'Áo polo cotton, in logo SVTN, các size S/M/L/XL.',
      priceCents: 180000,
      imageUrl: '/assets/products/polo.svg',
      status: 'ACTIVE',
      createdAt: '2026-02-01T00:00:00.000Z',
    },
    quantity: 1,
  },
]

const PUBLIC_SHOTS = [
  { path: '/', name: '01-landing' },
  { path: '/login', name: '02-login' },
  { path: '/volunteer', name: '03-volunteer-form' },
  { path: '/news', name: '04-news-list' },
  { path: '/news/mua-he-xanh-2026-nhung-nhip-cau-noi-bo-vui', name: '05-news-detail' },
  { path: '/shop', name: '06-shop-catalog' },
  { path: '/shop/00000000-0000-0000-0000-0000000000a1', name: '07-shop-detail' },
  { path: '/shop/checkout', name: '09-checkout', cart: true },
  { path: '/fundraising', name: '10-fundraising' },
]

const ADMIN_SHOTS = [
  { path: '/admin/dashboard', name: '16-admin-dashboard' },
  { path: '/admin/accounts', name: '17-admin-accounts' },
  { path: '/admin/volunteer-applications', name: '18-volunteer-applications' },
  { path: '/admin/volunteer-applications/mock-app-1', name: '19-volunteer-application-detail' },
  { path: '/admin/activities', name: '20-admin-activities' },
  {
    path: '/admin/activities/00000000-0000-0000-0000-000000000001',
    name: '21-admin-activity-detail',
  },
  {
    path: '/admin/activities/00000000-0000-0000-0000-000000000001/matcher',
    name: '22-admin-matcher',
  },
  { path: '/admin/articles', name: '23-admin-articles' },
  { path: '/admin/articles/new', name: '24-admin-article-new' },
  { path: '/admin/articles/00000000-0000-0000-0000-000000000401', name: '24-admin-article-edit' },
  { path: '/admin/products', name: '25-admin-products' },
  { path: '/admin/orders', name: '26-admin-orders' },
  { path: '/admin/fundraising', name: '27-admin-fundraising' },
  { path: '/admin/reports', name: '28-admin-reports' },
]

const MEMBER_SHOTS = [
  {
    path: '/member/activities/00000000-0000-0000-0000-000000000001',
    name: '11-member-activity-detail',
  },
  { path: '/member/profile', name: '12-member-profile' },
  { path: '/member/streak', name: '13-member-streak' },
  { path: '/member/recap', name: '14-member-recap' },
  { path: '/member/recap/album-1', name: '14-member-recap-detail' },
  { path: '/member/notifications', name: '15-member-notifications' },
  { path: '/member/feed', name: 'member-feed' },
  { path: '/member/activities', name: 'member-activities' },
  { path: '/member/assignments', name: 'member-assignments' },
  { path: '/member/impact', name: 'member-impact' },
]

async function seed(page: Page, user?: unknown, cart = false) {
  await page.addInitScript(
    ({ user: u, cart: c }) => {
      if (u) window.sessionStorage.setItem('dsvtn_mock_user', JSON.stringify(u))
      if (c) window.localStorage.setItem('dsvtn_shop_cart', JSON.stringify(c))
    },
    { user, cart: cart ? CART : null },
  )
}

async function snap(page: Page, project: string, name: string) {
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.screenshot({
    path: `screenshots/${project}/${name}.png`,
    fullPage: true,
    animations: 'disabled',
  })
}

test.describe('public screenshots', () => {
  for (const shot of PUBLIC_SHOTS) {
    test(`shot ${shot.name}`, async ({ page }, testInfo) => {
      await seed(page, undefined, Boolean(shot.cart))
      await page.goto(shot.path)
      await snap(page, testInfo.project.name, shot.name)
    })
  }

  test('shot 08-cart-drawer', async ({ page }, testInfo) => {
    await seed(page, undefined, true)
    await page.goto('/shop')
    await page.locator('button:has-text("Giỏ hàng")').first().click()
    await snap(page, testInfo.project.name, '08-cart-drawer')
  })
})

test.describe('admin screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await seed(page, ADMIN)
  })
  for (const shot of ADMIN_SHOTS) {
    test(`shot ${shot.name}`, async ({ page }, testInfo) => {
      await page.goto(shot.path)
      await snap(page, testInfo.project.name, shot.name)
    })
  }
})

test.describe('member screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await seed(page, MEMBER)
  })
  for (const shot of MEMBER_SHOTS) {
    test(`shot ${shot.name}`, async ({ page }, testInfo) => {
      await page.goto(shot.path)
      await snap(page, testInfo.project.name, shot.name)
    })
  }
})

test.describe('logistic screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await seed(page, LOGISTIC)
  })
  test('shot logistic-orders', async ({ page }, testInfo) => {
    await page.goto('/logistic/orders')
    await snap(page, testInfo.project.name, '26-logistic-orders')
  })
})
