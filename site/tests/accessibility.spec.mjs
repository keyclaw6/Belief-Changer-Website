import { test, expect } from '@playwright/test'

test('language menu supports arrows, Home/End and Escape focus restoration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/en/books')
  const trigger = page.getByRole('button', { name: 'Change language' }).filter({ visible: true })
  await trigger.focus(); await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('menuitemradio', { name: 'English' })).toBeFocused()
  await page.keyboard.press('End')
  await expect(page.getByRole('menuitemradio', { name: 'العربية' })).toBeFocused()
  await page.keyboard.press('Home')
  await expect(page.getByRole('menuitemradio', { name: 'English' })).toBeFocused()
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused()
  await expect(page.getByRole('menu')).toHaveCount(0)
})

test('mobile menu returns focus and unavailable downloads are honest', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/en/books/sugar')
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  await menu.click(); await expect(page.locator('#mobile-nav')).toBeVisible()
  await page.keyboard.press('Escape'); await expect(menu).toBeFocused()
  await expect(page.locator('#mobile-nav')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Download EPUB' })).toHaveCount(0)
  await expect(page.getByText('In production', { exact: true })).toBeVisible()
  await expect(page.locator('a[href="#"]')).toHaveCount(0)
})

test('no WebGL stays on the real, clickable shelf', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.startsWith('webgl') ? null : original.call(this, type, ...args) }
  })
  await page.goto('/en')
  await expect(page.locator('iframe')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'The Sugar Trap', exact: true }).first()).toBeVisible()
})
