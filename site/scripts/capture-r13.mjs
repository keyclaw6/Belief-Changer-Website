/**
 * R13 capture script (local, uncommitted). Prod bundle on :3100.
 * Viewport PNGs mirroring the R8/R9 sets, plus tablet-1024, a mid-drift
 * frame (pointer parked at the stage's bottom-right corner, leaf settled
 * at +6px/+3px: maximum occlusion change), and a 2x close-contact clip
 * around the book, plus a 200%-zoom reflow proof.
 * Usage: node capture-r13.mjs  (from site/scripts/, server already on :3100)
 */
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../r13-captures')
const BASE = process.env.R13_BASE || 'http://127.0.0.1:3100'
const PATH = '/en/cinematic-window-r13'

const errors = {}

async function seedTheme(context, theme) {
  await context.addInitScript((t) => {
    try {
      if (t === 'light' || t === 'dark') localStorage.setItem('bc-theme', t)
      else localStorage.removeItem('bc-theme')
    } catch {}
  }, theme)
}

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForTimeout(600)
}

async function shoot(browser, name, { viewport, dsf = 1, theme = 'light', path = PATH, reduced = false, zoom = 1, clipBook = false, driftCorner = false }) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: dsf,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    hasTouch: false,
  })
  await seedTheme(context, theme)
  const page = await context.newPage()
  errors[name] = []
  page.on('console', (m) => { if (m.type() === 'error') errors[name].push(m.text()) })
  page.on('pageerror', (e) => errors[name].push('pageerror: ' + e.message))
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' })
  await settle(page)
  if (driftCorner) {
    // Park the pointer at the stage's bottom-right corner and let the
    // rAF-lerped leaf settle at (+R13_STRIP_MAX_X, +R13_STRIP_MAX_Y) before
    // capturing mid-drift: the maximum occlusion-change state.
    const box = await page.locator('.r13-stage').boundingBox()
    if (!box) throw new Error('r13-stage not found for mid-drift capture')
    await page.mouse.move(box.x + box.width - 4, box.y + box.height - 4)
    await page.waitForTimeout(900)
    const tx = await page.evaluate(() => {
      const strip = document.querySelector('.r13-strip')
      return strip ? strip.style.transform : 'missing'
    })
    console.log(`mid-drift strip transform: ${tx}`)
  }
  if (zoom !== 1) {
    await page.evaluate((z) => { document.body.style.zoom = String(z) }, zoom)
    await page.waitForTimeout(400)
  }
  const dt = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  const dir = await page.evaluate(() => document.documentElement.getAttribute('dir'))
  let clip
  if (clipBook) {
    const box = await page.locator('.r13-book').boundingBox()
    if (!box) throw new Error('r13-book not found for close-contact clip')
    const pad = 90
    clip = {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: Math.min(viewport.width - Math.max(0, box.x - pad), box.width + pad * 2),
      height: box.height + pad * 2,
    }
  }
  await page.screenshot({ path: join(OUT, name), clip })
  console.log(`shot ${name} (data-theme=${dt}, dir=${dir}${clip ? `, clip=${Math.round(clip.width)}x${Math.round(clip.height)}` : ''})`)
  await context.close()
}

const { mkdirSync } = await import('node:fs')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: '/home/kab/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
await shoot(browser, 'desktop-1440.png', { viewport: { width: 1440, height: 900 } })
await shoot(browser, 'desktop-1024.png', { viewport: { width: 1024, height: 768 } })
await shoot(browser, 'mobile-390.png', { viewport: { width: 390, height: 844 } })
await shoot(browser, 'dark-1440.png', { viewport: { width: 1440, height: 900 }, theme: 'dark' })
await shoot(browser, 'arabic-rtl.png', { viewport: { width: 1440, height: 900 }, path: '/ar/cinematic-window-r13' })
await shoot(browser, 'reduced-motion.png', { viewport: { width: 1440, height: 900 }, reduced: true })
await shoot(browser, 'mid-drift.png', { viewport: { width: 1440, height: 900 }, driftCorner: true })
await shoot(browser, 'zoom-contact.png', { viewport: { width: 1440, height: 900 }, dsf: 2, clipBook: true })
await shoot(browser, 'zoom-200.png', { viewport: { width: 720, height: 900 } })
await browser.close()

writeFileSync(join(OUT, 'console-errors.json'), JSON.stringify(errors, null, 2))
const bad = Object.entries(errors).filter(([, a]) => a.length)
console.log(bad.length ? `CONSOLE ERRORS:\n${JSON.stringify(bad, null, 2)}` : 'CONSOLE: zero errors')
