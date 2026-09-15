/**
 * R13 capture harness (review only, not part of the site bundle).
 * Copy of the R11 harness retargeted via env, plus LCP capture:
 *   ROUTE=en/reading-room-r13 OUTDIR=r13-captures node scripts/capture-r13.mjs
 * Assumes the prod bridge is already serving on TEST_PORT.
 * Screenshots the isolated route per config into OUTDIR, logs pass-criterion
 * metrics per shot + console errors:
 *   - headlineInside / readInside (>=0.80 at 1440 and 390), bandGap (<=24),
 *   - shelfMin/deskW/ratio, transferMs (<=700), cls (<0.05), lcp (<2500),
 *   - overflow (no horizontal overflow), singleNode (exactly one physical
 *     node per title mid-transfer), focusKept, rapid-queue drain.
 */
import { chromium } from '@playwright/test'
import sparticuz from '@sparticuz/chromium'

const port = Number(process.env.TEST_PORT || 3120)
const base = `http://127.0.0.1:${port}`
const routePath = process.env.ROUTE || 'en/reading-room-r13'
const outDir = process.env.OUTDIR || 'r13-captures'
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
    const stage = document.querySelector('.reading-room-r11__stage')
    const title = document.querySelector('.reading-room-r11__title')
    const read = document.querySelector('.reading-room-r11__read')
    const header = document.querySelector('header')
    const sr = r(stage)
    const tr = r(title)
    const rr = r(read)
    const hr = r(header)
    const area = (b) => Math.max(1, b.width * b.height)
    const shelfWs = [...document.querySelectorAll('.reading-room-r11__slot')].map((el) =>
      Math.round(el.getBoundingClientRect().width),
    )
    const deskEl = document.querySelector('.reading-room-r11__deskbook')
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
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      flying: document.querySelectorAll('[data-flying]').length,
      desk: deskEl.getAttribute('aria-label'),
      read: read.getAttribute('href'),
    }
  })
}

async function lcpMs(page) {
  return page.evaluate(() => window.__lcp || null)
}

async function ready(page, localePath) {
  await page.goto(`${base}/${localePath}`, { waitUntil: 'domcontentloaded' })
  const section = page.locator('.reading-room-r11')
  await section.waitFor({ timeout: 15000 })
  await page.waitForFunction(
    () => {
      const plate = document.querySelector('.reading-room-r11__plate-img')
      const covers = [...document.querySelectorAll('.reading-room-r11__shelf img, .reading-room-r11__deskbook img')]
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
  await page.waitForTimeout(1200)
}

const file = (name) => new URL(`../../${outDir}/r13-${name}.png`, import.meta.url).pathname

const routeLocale = (locale) => `${locale}/${routePath.split('/').slice(1).join('/')}`

const shots = [
  { name: 'desktop-light', width: 1440, height: 900, scheme: 'light', motion: 'no-preference', locale: 'en' },
  { name: 'desktop-1024', width: 1024, height: 768, scheme: 'light', motion: 'no-preference', locale: 'en' },
  { name: 'desktop-dark', width: 1440, height: 900, scheme: 'dark', motion: 'no-preference', locale: 'en' },
  { name: 'mobile-390-light', width: 390, height: 844, scheme: 'light', motion: 'no-preference', locale: 'en' },
  { name: 'mobile-360-light', width: 360, height: 740, scheme: 'light', motion: 'no-preference', locale: 'en' },
  { name: 'desktop-rtl-ar', width: 1440, height: 900, scheme: 'light', motion: 'no-preference', locale: 'ar' },
  { name: 'desktop-reduced-motion', width: 1440, height: 900, scheme: 'light', motion: 'reduce', locale: 'en' },
]

for (const s of shots) {
  const context = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    colorScheme: s.scheme,
    reducedMotion: s.motion,
  })
  await context.addInitScript(() => {
    window.__lcp = null
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__lcp = Math.round(e.startTime)
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e)}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  await ready(page, routeLocale(s.locale))
  const m = await measure(page)
  const lcp = await lcpMs(page)
  await page.screenshot({ path: file(s.name) })
  const pass = m.headlineInside >= 0.8 && m.readInside >= 0.8 && m.bandGap <= 24 && m.overflow <= 0
  console.log(`shot r13-${s.name}.png metrics=${JSON.stringify(m)} lcp=${lcp} pass80/24/no-overflow=${pass} errors=${errors.length}${errors.length ? ' ' + errors.join(' | ') : ''}`)
  await context.close()
}

// Selected end state + mid-transfer frame + timed transfer + CLS.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  await ready(page, routeLocale('en'))

  await page.evaluate(() => {
    window.__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) window.__cls += e.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  const before = await measure(page)
  const t0 = Date.now()
  await page.locator('.reading-room-r11__shelf-btn').first().click()
  await page.waitForSelector('[data-flying="carry"]', { timeout: 5000 })
  // Measure first (the honest in-flight instant), then screenshot: software
  // rendering makes the screenshot itself land deeper into the carry.
  const mid = await measure(page)
  await page.screenshot({ path: file('desktop-light-mid-transfer') })
  await page.waitForFunction(
    () => document.querySelectorAll('[data-flying]').length === 0,
    { timeout: 5000 },
  )
  const transferMs = Date.now() - t0
  const after = await measure(page)
  const cls = await page.evaluate(() => +window.__cls.toFixed(4))
  await page.screenshot({ path: file('desktop-light-selected') })
  const swapped = before.desk !== after.desk && before.read !== after.read
  const singleNode = after.flying === 0 && mid.flying === 1
  console.log(
    `transfer: swapped=${swapped} singleNode=${singleNode} transferMs=${transferMs} (<=700: ${transferMs <= 700}) cls=${cls} mid=${JSON.stringify(mid)} after=${JSON.stringify(after)} errors=${errors.length}${errors.length ? ' ' + errors.join(' | ') : ''}`,
  )
  await context.close()
}

// Keyboard: Tab to a shelf book (visible focus), Enter to transfer, focus kept.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await ready(page, routeLocale('en'))
  let focused = null
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab')
    const active = await page.evaluate(() => document.activeElement?.className?.toString?.() ?? '')
    if (active.includes('reading-room-r11__shelf-btn')) {
      focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
      break
    }
  }
  await page.waitForTimeout(300)
  await page.screenshot({ path: file('desktop-light-keyboard-focus') })
  const ring = await page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    const cs = getComputedStyle(el)
    return { outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle }
  })
  const beforeDesk = await page.evaluate(() => document.querySelector('.reading-room-r11__deskbook')?.getAttribute('aria-label'))
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => document.querySelectorAll('[data-flying]').length === 0, { timeout: 5000 })
  await page.waitForTimeout(300)
  const focusAfter = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    cls: document.activeElement?.className?.toString?.().slice(0, 60),
    label: document.activeElement?.getAttribute?.('aria-label'),
  }))
  const afterDesk = await page.evaluate(() => document.querySelector('.reading-room-r11__deskbook')?.getAttribute('aria-label'))
  const kept = focusAfter.tag !== 'BODY'
  console.log(
    `keyboard: focused=${JSON.stringify(focused)} ring=${JSON.stringify(ring)} swapped=${beforeDesk !== afterDesk} focusKept=${kept} focusAfter=${JSON.stringify(focusAfter)} errors=${errors.length}${errors.length ? ' ' + errors.join(' | ') : ''}`,
  )
  await context.close()
}

// Rapid clicks: three selections in flight succession drain to the last target.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await ready(page, routeLocale('en'))
  const btns = page.locator('.reading-room-r11__shelf-btn')
  const labels = await btns.evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')))
  await btns.nth(0).click()
  await page.waitForTimeout(80)
  await btns.nth(1).click()
  await page.waitForTimeout(80)
  await btns.nth(2).click()
  await page.waitForFunction(
    (want) => document.querySelector('.reading-room-r11__deskbook')?.getAttribute('aria-label') === want
      && document.querySelectorAll('[data-flying]').length === 0,
    labels[2],
    { timeout: 10000 },
  )
  await page.waitForTimeout(400)
  const end = await measure(page)
  const titles = await page.evaluate(() => ({
    shelf: [...document.querySelectorAll('.reading-room-r11__shelf-btn')].map((el) => el.getAttribute('aria-label')),
    desk: document.querySelector('.reading-room-r11__deskbook')?.getAttribute('aria-label'),
  }))
  const settledOnLast = end.desk === labels[2] && titles.desk === labels[2]
  const noDup = !titles.shelf.includes(titles.desk)
  await page.screenshot({ path: file('desktop-light-rapid-end') })
  console.log(
    `rapid: clicked=${JSON.stringify(labels)} settledOnLast=${settledOnLast} noDup=${noDup} flying=${end.flying} titles=${JSON.stringify(titles)} errors=${errors.length}${errors.length ? ' ' + errors.join(' | ') : ''}`,
  )
  await context.close()
}

await browser.close()
console.log('done')
