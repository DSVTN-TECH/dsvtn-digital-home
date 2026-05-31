import { test, expect, type Page } from '@playwright/test'

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

const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/users',
  '/admin/accounts',
  '/admin/volunteer-applications',
  '/admin/activities',
  '/admin/articles',
  '/admin/products',
  '/admin/orders',
  '/admin/reports',
  '/admin/fundraising',
]

const MEMBER_ROUTES = [
  '/member/feed',
  '/member/activities',
  '/member/assignments',
  '/member/notifications',
  '/member/profile',
  '/member/streak',
  '/member/recap',
  '/member/impact',
]

async function seed(page: Page, user: unknown) {
  await page.addInitScript((u) => {
    window.sessionStorage.setItem('dsvtn_mock_user', JSON.stringify(u))
  }, user)
}

test.describe('protected admin routes smoke', () => {
  test.beforeEach(async ({ page }) => {
    await seed(page, ADMIN)
  })

  for (const path of ADMIN_ROUTES) {
    test(`renders ${path} within admin shell`, async ({ page }) => {
      const res = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(res?.status(), `${path} status`).toBeLessThan(400)
      await expect(page.locator('main#main-content')).toBeVisible()
      await expect(page.locator('aside').first()).toBeAttached()
    })
  }
})

test.describe('protected member routes smoke', () => {
  test.beforeEach(async ({ page }) => {
    await seed(page, MEMBER)
  })

  for (const path of MEMBER_ROUTES) {
    test(`renders ${path} within member shell`, async ({ page }) => {
      const res = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(res?.status(), `${path} status`).toBeLessThan(400)
      await expect(page.locator('header').first()).toBeVisible()
      await expect(page.locator('main#main-content')).toBeVisible()
    })
  }
})
