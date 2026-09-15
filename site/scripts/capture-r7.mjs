/**
 * R7 capture harness (review only, not part of the site bundle).
 * Assumes the prod bridge is already serving on TEST_PORT.
 * Screenshots the .reading-room slice per config into r7-captures/.
 */
import { chromium } from '@playwright/test'
import sparticuz from '@sparticuz/chromium'

const port = Number(process.env.TEST_PORT || 3120)
const base = `http://127.0.0.1:${port}`
const portable = process.platform === 'linux' && !process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE

const launchOptions = portable
  ? {
      executablePath: await sparticuz.executablePath(),
      args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
    }
  : { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }

const browser = await chromium.launch(launchOptions)

const shots = [
  { name: 'desktop-light', width: 1440, height: 900, scheme: 'light', motion: 'no-preference', locale: 'en' },
  { name: 'desktop-dark', width: 1440, height: 900, scheme: 'dark', motion: 'no-preference', locale: 'en' },
  { name: 'mobile-light', width: 390, height: 844, scheme: 'light', motion: 'no-preference', locale: 'en' },
  { name: 'desktop-rtl-ar', width: 1440, height: 900, scheme: 'light', motion: 'no-preference', locale: 'ar' },
  { name: 'desktop-reduced-motion', width: 1440, height: 900, scheme: 'light', motion: 'reduce', locale: 'en' },
]

for (const s of shots) {
  const context = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    colorScheme: s.scheme,
    reducedMotion: s.motion,
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(`${base}/${s.locale}`, { waitUntil: 'domcontentloaded' })
  const section = page.locator('.reading-room')
  await section.waitFor({ timeout: 15000 })
  await section.evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await page.waitForFunction(
    () => {
      const imgs = [...document.querySelectorAll('.reading-room img')]
      return imgs.length > 0 && imgs.every((img) => img.complete && img.naturalWidth > 0)
    },
    { timeout: 25000 },
  )
  await page.waitForTimeout(500)
  await page.screenshot({ path: new URL(`../../r7-captures/r7-${s.name}.png`, import.meta.url).pathname })
  console.log(`shot r7-${s.name}.png errors=${errors.length}${errors.length ? ' ' + errors.join(' | ') : ''}`)
  await context.close()
}

// Mechanism proof: selecting the second book brings it to the desk once.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
    locale: 'en-US',
  })
  const page = await context.newPage()
  await page.goto(`${base}/en`, { waitUntil: 'domcontentloaded' })
  const section = page.locator('.reading-room')
  await section.waitFor({ timeout: 15000 })
  await section.evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await page.waitForTimeout(800)
  const shelfBtns = section.locator('.reading-room__shelf-btn')
  const n = await shelfBtns.count()
  console.log(`shelf buttons: ${n}`)
  // Default selection is scrolling (index 1); pick smoking (index 2) so the
  // selected-state shot proves the swap: vacant slot moves, desk re-arrives.
  await shelfBtns.nth(2).click()
  await page.waitForTimeout(700)
  await page.screenshot({ path: new URL('../../r7-captures/r7-desktop-light-selected.png', import.meta.url).pathname })
  const pressed = await shelfBtns.nth(2).getAttribute('aria-pressed')
  const readHref = await section.locator('a', { hasText: 'Read chapter 1' }).getAttribute('href')
  const readCount = await section.locator('a', { hasText: 'Read chapter 1' }).count()
  // Single-node audit: how many visible imgs share the selected title?
  const dup = await section.evaluate(() => {
    const figs = [...document.querySelectorAll('.reading-room__desk img')]
    const shelf = [...document.querySelectorAll('.reading-room__shelf li')]
    return { deskImgs: figs.length, shelfSlots: shelf.length }
  })
  console.log(`after select: aria-pressed=${pressed} readHref=${readHref} readLinks=${readCount} audit=${JSON.stringify(dup)}`)
  await context.close()
}

await browser.close()
console.log('done')
