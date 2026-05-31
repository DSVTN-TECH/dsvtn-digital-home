import { test, expect, type Page } from '@playwright/test'

const ADMIN_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  fullName: 'Admin ĐSVTN',
  email: 'admin@dsvtn.vn',
  role: 'ADMIN',
  mustChangePassword: false,
}

async function loginAsAdmin(page: Page) {
  await page.addInitScript((user) => {
    window.sessionStorage.setItem('dsvtn_mock_user', JSON.stringify(user))
  }, ADMIN_USER)
}

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page)
})

test('admin dashboard renders within shell', async ({ page }) => {
  const res = await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' })
  expect(res?.status()).toBeLessThan(400)
  await expect(page.locator('main#main-content')).toBeVisible()
})

test('admin sidebar persists across client navigation', async ({ page }) => {
  await page.goto('/admin/dashboard')
  const toggle = page.locator('button[aria-label="Mở menu"]').first()
  if (await toggle.isVisible()) {
    await toggle.click()
  }
  const sidebarNav = page.locator('aside nav').first()
  await expect(sidebarNav).toBeVisible()
  await page.locator('aside a[href="/admin/orders"]:visible').first().click()
  await page.waitForURL('**/admin/orders')
  await expect(page.locator('aside nav').first()).toBeVisible()
})

test('desktop admin sidebar is always visible', async ({ page }, testInfo) => {
  test.skip(!['laptop', 'desktop'].includes(testInfo.project.name), 'desktop-only assertion')
  await page.goto('/admin/dashboard')
  const aside = page.locator('aside').first()
  const box = await aside.boundingBox()
  expect(box, 'sidebar bounding box').not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0)
})

test('mobile admin sidebar reachable via toggle', async ({ page }, testInfo) => {
  test.skip(!['mobile', 'tablet'].includes(testInfo.project.name), 'mobile/tablet-only assertion')
  await page.goto('/admin/dashboard')
  const toggle = page.locator('button[aria-label="Mở menu"]').first()
  await expect(toggle).toBeVisible()
  await toggle.click()
  await expect(page.locator('aside nav').first()).toBeVisible()
})
