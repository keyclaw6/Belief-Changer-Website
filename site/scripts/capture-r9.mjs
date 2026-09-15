/**
 * R9 capture harness (review only, not part of the site bundle).
 * Assumes the prod bridge is already serving on TEST_PORT.
 * Screenshots the .reading-room slice per config into r9-captures/,
 * and logs the alcove's measured viewport share + console/page errors.
 * R9 is a STATIC baseline: no selection animation; swaps cut instantly.
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
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e)}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  await page.goto(`${base}/${s.locale}`, { waitUntil: 'domcontentloaded' })
  const section = page.locator('.reading-room')
  await section.waitFor({ timeout: 15000 })
  await section.evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await page.waitForFunction(
    () => {
      const plate = document.querySelector('.reading-room__plate-img')
      const covers = [...document.querySelectorAll('.reading-room__shelf img, .reading-room__deskbook img')]
      // Gate on completeness + presence, not intrinsic width: some
      // headless shells misreport AVIF naturalWidth (wire bytes and
      // bitmap decode verified separately); the screenshots are the QA.
      return (
        plate instanceof HTMLImageElement &&
        plate.complete &&
        plate.naturalWidth > 0 &&
        covers.length === 4 &&
        covers.every((img) => img.complete && img.naturalWidth > 0)
      )
    },
    { timeout: 25000 },
  )
  await page.waitForTimeout(500)
  const metrics = await page.evaluate(() => {
    const alcove = document.querySelector('.reading-room__alcove')
    const r = alcove.getBoundingClientRect()
    const plate = document.querySelector('.reading-room__plate-img')
    const shelfCount = document.querySelectorAll('.reading-room__shelf li').length
    const deskImgs = document.querySelectorAll('.reading-room__deskbook img').length
    const readLinks = [...document.querySelectorAll('.reading-room a')].filter((a) =>
      /read\/1/.test(a.getAttribute('href') || ''),
    ).length
    return {
      alcoveH: Math.round(r.height),
      alcoveW: Math.round(r.width),
      viewportH: window.innerHeight,
      share: (r.height / window.innerHeight).toFixed(3),
      plateW: plate?.naturalWidth ?? 0,
      shelfCount,
      deskImgs,
      readLinks,
    }
  })
  await page.screenshot({ path: new URL(`../../r9-captures/r9-${s.name}.png`, import.meta.url).pathname })
  console.log(`shot r9-${s.name}.png metrics=${JSON.stringify(metrics)} errors=${errors.length}${errors.length ? ' ' + errors.join(' | ') : ''}`)
  await context.close()
}

// Mechanism proof: selecting another shelf book swaps the desk book once.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
    locale: 'en-US',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(`${base}/en`, { waitUntil: 'domcontentloaded' })
  const section = page.locator('.reading-room')
  await section.waitFor({ timeout: 15000 })
  await section.evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await page.waitForTimeout(800)
  const shelfBtns = section.locator('.reading-room__shelf-btn')
  const n = await shelfBtns.count()
  console.log(`shelf buttons: ${n}`)
  await shelfBtns.nth(0).scrollIntoViewIfNeeded()
  await shelfBtns.nth(0).click()
  await page.waitForTimeout(700)
  await page.screenshot({ path: new URL('../../r9-captures/r9-desktop-light-selected.png', import.meta.url).pathname })
  const audit = await section.evaluate(() => {
    const shelfTitles = [...document.querySelectorAll('.reading-room__shelf-btn')].map((b) => b.getAttribute('aria-label'))
    const deskLabel = document.querySelector('.reading-room__deskbook')?.getAttribute('aria-label')
    const readCount = [...document.querySelectorAll('.reading-room a')].filter((a) => /read\/1/.test(a.getAttribute('href') || '')).length
    return { shelfTitles, deskLabel, readCount }
  })
  console.log(`after select: audit=${JSON.stringify(audit)} errors=${errors.length}${errors.length ? ' ' + errors.join(' | ') : ''}`)
  await context.close()
}

await browser.close()
console.log('done')
