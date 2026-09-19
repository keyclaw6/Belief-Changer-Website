/**
 * R14 gate measurement (local, uncommitted). Reads DOM geometry, band
 * registration, registration pixel error, CLS, and LCP on the prod bundle
 * and prints falsifiable numbers. R14 is a pure still: there is no drift
 * amplitude to measure (strip transform must stay none everywhere).
 * Usage: node measure-r14.mjs
 */
import { chromium } from '@playwright/test'

const BASE = process.env.R14_BASE || 'http://127.0.0.1:3107'

const browser = await chromium.launch({
  executablePath: '/home/kab/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

async function geometry(viewport, label, path = '/en/cinematic-window-r14') {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForTimeout(400)
  const g = await page.evaluate(() => {
    const r = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const b = el.getBoundingClientRect()
      return { x: b.x, y: b.y, w: b.width, h: b.height }
    }
    const img = document.querySelector('.r14-face img')
    const cs = img ? getComputedStyle(img) : null
    const book = document.querySelector('.r14-book')
    const stage = document.querySelector('.r14-stage')
    const plate = document.querySelector('.r14-plate')
    const sb = stage.getBoundingClientRect()
    const bb = book.getBoundingClientRect()
    const pb = plate.getBoundingClientRect()
    const shell = document.querySelector('.r14-shell')
    const lb = shell.getBoundingClientRect()
    const face = document.querySelector('.r14-face')
    const fb = face.getBoundingClientRect()
    const fore = document.querySelector('.r14-fore')
    const nb = fore.getBoundingClientRect()
    return {
      face: { x: fb.x, y: fb.y, w: fb.width, h: fb.height },
      shellW: lb.width,
      overlap: fb.x + fb.width - lb.x,
      // Seat in plate fractions (stage maps 1:1 by aspect lock).
      seatLeft: (bb.x - sb.x) / sb.width,
      seatTop: (bb.y - sb.y) / sb.height,
      seatH: bb.height / sb.height,
      seatBase: (bb.y + bb.height - sb.y) / sb.height,
      // Band box in plate fractions.
      bandLeft: (nb.x - sb.x) / sb.width,
      bandTop: (nb.y - sb.y) / sb.height,
      bandW: nb.width / sb.width,
      bandH: nb.height / sb.height,
      copy: r('.r14-copy'),
      link: r('.r14-link'),
      book: { x: bb.x, y: bb.y, w: bb.width, h: bb.height },
      stage: { x: sb.x, y: sb.y, w: sb.width, h: sb.height },
      plate: { x: pb.x, y: pb.y, w: pb.width, h: pb.height },
      imgFilter: cs?.filter,
      imgTransform: cs?.transform,
      imgBoxShadow: cs?.boxShadow,
      foreTransform: getComputedStyle(fore).transform,
    }
  })
  const visible = g.shellW - g.overlap
  console.log(`--- ${label} (${viewport.width}x${viewport.height})`)
  console.log(`face ${g.face.w.toFixed(2)}x${g.face.h.toFixed(2)} aspect=${(g.face.w / g.face.h).toFixed(4)} (2:3 = 0.6667)`)
  console.log(`seat left=${g.seatLeft.toFixed(4)} (0.27) top=${g.seatTop.toFixed(4)} (0.31) h=${g.seatH.toFixed(4)} (0.44) base=${g.seatBase.toFixed(4)} (0.75)`)
  console.log(`band left=${g.bandLeft.toFixed(4)} top=${g.bandTop.toFixed(4)} w=${g.bandW.toFixed(4)} h=${g.bandH.toFixed(4)}`)
  console.log(`edge shellW=${g.shellW.toFixed(2)} overlap=${g.overlap.toFixed(2)} visibleProtrusion=${visible.toFixed(2)}`)
  console.log(`img filter=${g.imgFilter} transform=${g.imgTransform} boxShadow=${g.imgBoxShadow}`)
  console.log(`fore idle transform=${g.foreTransform} (must be none: still)`)
  console.log(`copyRight=${(g.copy.x + g.copy.w).toFixed(1)} bookLeft=${g.book.x.toFixed(1)} bookTop=${g.book.y.toFixed(1)} copyBottom=${(g.copy.y + g.copy.h).toFixed(1)}`)
  console.log(`plate ${g.plate.x.toFixed(1)},${g.plate.y.toFixed(1)} ${g.plate.w.toFixed(1)}x${g.plate.h.toFixed(1)} | stage ${g.stage.w.toFixed(1)}x${g.stage.h.toFixed(1)} (must match: aspect lock)`)
  await ctx.close()
  return g
}

await geometry({ width: 1440, height: 900 }, 'desktop')
await geometry({ width: 1024, height: 768 }, 'tablet')
await geometry({ width: 390, height: 844 }, 'mobile')

// Band registration pixel test: screenshots are saved to r14-captures for a
// proper pixel decode + diff (see R14-RESULT.md). The diff must be confined
// to the band box (book-bottom overlap); everywhere else must be exactly 0.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/en/cinematic-window-r14`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForTimeout(400)
  const box = await page.locator('.r14-stage').boundingBox()
  const { writeFileSync } = await import('node:fs')
  const { dirname, join } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../r14-captures')
  const on = await page.screenshot({ clip: box })
  writeFileSync(join(OUT, 'diag-band-on.png'), on)
  await page.evaluate(() => {
    const el = document.querySelector('.r14-fore')
    if (el) el.style.display = 'none'
  })
  await page.waitForTimeout(200)
  const off = await page.screenshot({ clip: box })
  writeFileSync(join(OUT, 'diag-band-off.png'), off)
  console.log('--- band registration pair saved: diag-band-on/off.png (diff in R14-RESULT.md)')
  await ctx.close()
}

// CLS + LCP on the QA route and the homepage hero. The observer attaches
// before navigation so LCP fires against a fresh load.
for (const p of ['/en/cinematic-window-r14', '/en']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.addInitScript(() => {
    window.__r14cls = 0
    try {
      const obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.hadRecentInput === false) window.__r14cls += e.value
        }
      })
      obs.observe({ type: 'layout-shift', buffered: true })
    } catch {}
  })
  const page = await ctx.newPage()
  await page.goto(`${BASE}${p}`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForTimeout(800)
  const m = await page.evaluate(() => {
    const lcp = performance.getEntriesByType('largest-contentful-paint').pop()
    return { cls: +window.__r14cls.toFixed(4), lcp: lcp ? Math.round(lcp.startTime) : -1, lcpSrc: lcp?.url || '', lcpEl: lcp ? (lcp.element?.tagName || '') : '' }
  })
  console.log(`--- perf ${p}: CLS=${m.cls} LCP=${m.lcp}ms el=${m.lcpEl} src=${(m.lcpSrc || '').split('/').pop()}`)
  await ctx.close()
}

await browser.close()
