import { test, expect, type Page } from '@playwright/test'

const MEMBER_USER = {
  id: '00000000-0000-0000-0000-000000000002',
  fullName: 'Nguyễn Thành Viên',
  email: 'member1@dsvtn.vn',
  role: 'MEMBER',
  mustChangePassword: false,
}

const LOGISTIC_USER = {
  id: '00000000-0000-0000-0000-000000000004',
  fullName: 'Lê Hậu Cần',
  email: 'logistic@dsvtn.vn',
  role: 'LOGISTIC',
  mustChangePassword: false,
}

async function seedUser(page: Page, user: unknown) {
  await page.addInitScript((u) => {
    window.sessionStorage.setItem('dsvtn_mock_user', JSON.stringify(u))
  }, user)
}

test.describe('member shell', () => {
  test.beforeEach(async ({ page }) => {
    await seedUser(page, MEMBER_USER)
  })

  test('member header persists across navigation', async ({ page }) => {
    await page.goto('/member/activities')
    const header = page.locator('header').first()
    await expect(header).toBeVisible()

    const toggle = page.locator('button[aria-label="Mở menu"]').first()
    if (await toggle.isVisible()) {
      await toggle.click()
    }
    await page.locator('aside a[href="/member/profile"]:visible').first().click()
    await page.waitForURL('**/member/profile')
    await expect(page.locator('header').first()).toBeVisible()
  })

  test('member nav reachable on mobile via toggle', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'mobile-only assertion (member shell uses md breakpoint)',
    )
    await page.goto('/member/activities')
    const toggle = page.locator('button[aria-label="Mở menu"]').first()
    await expect(toggle).toBeVisible()
    await toggle.click()
    await expect(page.locator('aside nav').first()).toBeVisible()
  })
})

test.describe('logistic shell', () => {
  test.beforeEach(async ({ page }) => {
    await seedUser(page, LOGISTIC_USER)
  })

  test('logistic orders queue renders within shell', async ({ page }) => {
    const res = await page.goto('/logistic/orders', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBeLessThan(400)
    await expect(page.locator('main#main-content')).toBeVisible()
    await expect(page.locator('aside').first()).toBeAttached()
  })
  test('logistic sidebar reachable on mobile/tablet via toggle', async ({ page }, testInfo) => {
    test.skip(!['mobile', 'tablet'].includes(testInfo.project.name), 'mobile/tablet-only assertion')
    await page.goto('/logistic/orders')
    const toggle = page.locator('button[aria-label="Mở menu"]').first()
    await expect(toggle).toBeVisible()
    await toggle.click()
    await expect(page.locator('aside nav').first()).toBeVisible()
  })
})
