/**
 * R10 capture harness (review only, not part of the site bundle).
 * Assumes the prod bridge is already serving on TEST_PORT.
 * Screenshots the isolated /{locale}/reading-room-r10 route per config into
 * r10-captures/, logs the pass-criterion metrics per shot + console errors:
 *   - headlineInside / readInside: fraction of the headline / Read-link bbox
 *     area inside the room-stage rect (>=0.80 required at 1440 and 390).
 *   - bandGap: stage.top - site-header.bottom in px (<=24 required: no
 *     separate hero band between header and room).
 *   - shelfMin/deskW/ratio: restage checks (shelf >=90 desktop, >=55 mobile;
 *     desk <=2.5x median shelf).
 * R10 is a STATIC baseline: no selection animation; swaps cut instantly.
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

async function measure(page) {
  return page.evaluate(() => {
    const inter = (a, b) => {
      const x0 = Math.max(a.x, b.x)
      const y0 = Math.max(a.y, b.y)
      const x1 = Math.min(a.x + a.width, b.x + b.width)
      const y1 = Math.min(a.y + a.height, b.y + b.height)
      return Math.max(0, x1 - x0) * Math.max(0, y1 - y0)
    }
    const r = (el) => {
      const b = el.getBoundingClientRect()
      return { x: b.x, y: b.y, width: b.width, height: b.height }
    }
    const stage = document.querySelector('.reading-room-r10__stage')
    const title = document.querySelector('.reading-room-r10__title')
    const read = document.querySelector('.reading-room-r10__read')
    const header = document.querySelector('header')
    const sr = r(stage)
    const tr = r(title)
    const rr = r(read)
    const hr = r(header)
    const area = (b) => Math.max(1, b.width * b.height)
    const shelfWs = [...document.querySelectorAll('.reading-room-r10__slot')].map((el) =>
      Math.round(el.getBoundingClientRect().width),
    )
    const deskEl = document.querySelector('.reading-room-r10__deskbook')
    const deskW = Math.round(deskEl.getBoundingClientRect().width)
    const sorted = [...shelfWs].sort((a, b) => a - b)
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0
    return {
      stage: { w: Math.round(sr.width), h: Math.round(sr.height), top: Math.round(sr.y) },
      headlineInside: +(inter(tr, sr) / area(tr)).toFixed(3),
      readInside: +(inter(rr, sr) / area(rr)).toFixed(3),
      bandGap: Math.round(sr.y - (hr.y + hr.height)),
      shelfMin: Math.min(...shelfWs),
      shelfWs,
      deskW,
      medianShelf: median,
      deskRatio: median ? +(deskW / median).toFixed(2) : null,
    }
  })
}

async function ready(page, locale) {
  await page.goto(`${base}/${locale}/reading-room-r10`, { waitUntil: 'domcontentloaded' })
  const section = page.locator('.reading-room-r10')
  await section.waitFor({ timeout: 15000 })
  await page.waitForFunction(
    () => {
      const plate = document.querySelector('.reading-room-r10__plate-img')
      const covers = [...document.querySelectorAll('.reading-room-r10__shelf img, .reading-room-r10__deskbook img')]
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
}

const shots = [
  { name: 'desktop-light', width: 1440, height: 900, scheme: 'light', motion: 'no-preference', locale: 'en' },
  { name: 'desktop-1024', width: 1024, height: 768, scheme: 'light', motion: 'no-preference', locale: 'en' },
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
  await ready(page, s.locale)
  const m = await measure(page)
  await page.screenshot({ path: new URL(`../../r10-captures/r10-${s.name}.png`, import.meta.url).pathname })
  const pass = m.headlineInside >= 0.8 && m.readInside >= 0.8 && m.bandGap <= 24
  console.log(`shot r10-${s.name}.png metrics=${JSON.stringify(m)} pass80/24=${pass} errors=${errors.length}${errors.length ? ' ' + errors.join(' | ') : ''}`)
  await context.close()
}

// Mechanism proof: shelf -> desk swap, plus keyboard-focus state and
// keyboard (Enter) selection consequence.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
    locale: 'en-US',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await ready(page, 'en')

  const before = await page.evaluate(() => ({
    desk: document.querySelector('.reading-room-r10__deskbook')?.getAttribute('aria-label'),
    read: document.querySelector('.reading-room-r10__read')?.getAttribute('href'),
  }))

  // Keyboard: Tab from the top until a shelf book has visible focus.
  let focused = null
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab')
    const active = await page.evaluate(() => {
      const el = document.activeElement
      return el ? el.className?.toString?.() ?? '' : ''
    })
    if (active.includes('reading-room-r10__shelf-btn')) {
      focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
      break
    }
  }
  await page.waitForTimeout(300)
  await page.screenshot({ path: new URL('../../r10-captures/r10-desktop-keyboard-focus.png', import.meta.url).pathname })
  const focusRing = await page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    const cs = getComputedStyle(el)
    return { outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle, boxShadow: cs.boxShadow.slice(0, 80) }
  })

  // Keyboard selection consequence: Enter swaps the desk book.
  await page.keyboard.press('Enter')
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => ({
    desk: document.querySelector('.reading-room-r10__deskbook')?.getAttribute('aria-label'),
    read: document.querySelector('.reading-room-r10__read')?.getAttribute('href'),
  }))
  const m = await measure(page)
  await page.screenshot({ path: new URL('../../r10-captures/r10-desktop-light-selected.png', import.meta.url).pathname })
  const swapped = before.desk !== after.desk && before.read !== after.read
  console.log(
    `keyboard: focused=${JSON.stringify(focused)} ring=${JSON.stringify(focusRing)} swapped=${swapped} before=${JSON.stringify(before)} after=${JSON.stringify(after)} metrics=${JSON.stringify(m)} errors=${errors.length}${errors.length ? ' ' + errors.join(' | ') : ''}`,
  )
  await context.close()
}

await browser.close()
console.log('done')
