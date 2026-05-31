import { test, expect } from '@playwright/test'

const PUBLIC_ROUTES = [
  { path: '/', heading: /ĐSVTN|Digital Home|Tham gia/i },
  { path: '/news', heading: /Tin tức/i },
  { path: '/shop', heading: /Shop Gây Quỹ/i },
  { path: '/fundraising', heading: /gây quỹ/i },
  { path: '/volunteer', heading: /Tham gia/i },
  { path: '/login', heading: /Đăng nhập/i },
]

for (const route of PUBLIC_ROUTES) {
  test(`public route ${route.path} renders`, async ({ page }) => {
    const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' })
    expect(response?.status(), `${route.path} status`).toBeLessThan(400)
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('main').first()).toBeVisible()
  })
}

test('public shell persists across navigation', async ({ page }) => {
  await page.goto('/')
  const headerBefore = page.locator('header').first()
  await expect(headerBefore).toBeVisible()

  const mobileToggle = page.locator('button[aria-label="Mở menu"]').first()
  if (await mobileToggle.isVisible()) {
    await mobileToggle.click()
  }
  const newsLink = page.locator('a[href="/news"]:visible').first()
  await newsLink.click()
  await page.waitForURL('**/news')
  const headerAfter = page.locator('header').first()
  await expect(headerAfter).toBeVisible()
})

test('skip link is keyboard reachable', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.locator('a.svtn-skip-link, a[href="#main-content"]').first()
  await expect(skip).toBeFocused()
})
