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

const ROUTES = [
  { path: '/volunteer' },
  { path: '/news' },
  { path: '/news/mua-he-xanh-2026-nhung-nhip-cau-noi-bo-vui' },
  { path: '/shop' },
  { path: '/shop/00000000-0000-0000-0000-0000000000a1' },
  { path: '/shop/checkout', cart: true },
  { path: '/member/streak', user: MEMBER },
  { path: '/member/recap', user: MEMBER },
  { path: '/admin/volunteer-applications/mock-app-1', user: ADMIN },
  { path: '/admin/activities/00000000-0000-0000-0000-000000000001', user: ADMIN },
  { path: '/admin/activities/00000000-0000-0000-0000-000000000001/matcher', user: ADMIN },
  { path: '/logistic/orders', user: LOGISTIC },
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

test.describe('responsive overflow guard', () => {
  for (const route of ROUTES) {
    test(`no page-level horizontal overflow on ${route.path}`, async ({ page }) => {
      await seed(page, route.user, Boolean(route.cart))
      await page.goto(route.path)
      await page.waitForLoadState('networkidle').catch(() => {})
      const overflow = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }))
      expect(overflow.scrollWidth, `${route.path} scrollWidth`).toBeLessThanOrEqual(
        overflow.clientWidth + 2,
      )
    })
  }
})

test('cart sheet closes on Escape and returns focus to trigger', async ({ page }) => {
  await seed(page, undefined, true)
  await page.goto('/shop')
  const trigger = page.getByRole('button', { name: /Giỏ hàng/ }).first()
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Giỏ hàng' })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('matcher dialog closes on Escape and returns focus to edit trigger', async ({ page }) => {
  await seed(page, ADMIN)
  await page.goto('/admin/activities/00000000-0000-0000-0000-000000000001/matcher')
  const editTrigger = page.getByRole('button', { name: 'Sửa' }).first()
  await editTrigger.click()
  const dialog = page.getByRole('dialog', { name: 'Sửa assignment' })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(editTrigger).toBeFocused()
})
