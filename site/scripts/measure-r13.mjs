/**
 * R13 gate measurement (local, uncommitted). Reads DOM geometry, strip
 * registration, leaf drift amplitude, registration pixel error, CLS, and
 * LCP (R8 vs R13 medians) on the prod bundle and prints falsifiable numbers.
 * Usage: node measure-r13.mjs
 */
import { chromium } from '@playwright/test'

const BASE = process.env.R13_BASE || 'http://127.0.0.1:3100'

const browser = await chromium.launch({
  executablePath: '/home/kab/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

async function geometry(viewport, label) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/en/cinematic-window-r13`, { waitUntil: 'domcontentloaded' })
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
    const img = document.querySelector('.r13-face img')
    const cs = img ? getComputedStyle(img) : null
    const book = document.querySelector('.r13-book')
    const edge = book ? getComputedStyle(book).getPropertyValue('--r13-edge').trim() : null
    const strip = document.querySelector('.r13-strip')
    return {
      face: r('.r13-face'), shell: r('.r13-shell'), copy: r('.r13-copy'),
      link: r('.r13-link'), book: r('.r13-book'), contact: r('.r13-contact'),
      plate: r('.r13-plate'), strip: r('.r13-strip'), stage: r('.r13-stage'),
      edgeVar: edge,
      stripTransform: strip ? strip.style.transform || getComputedStyle(strip).transform : null,
      imgFilter: cs?.filter, imgTransform: cs?.transform, imgBoxShadow: cs?.boxShadow,
    }
  })
  const overlap = (g.face.x + g.face.w) - g.shell.x
  const visible = g.shell.w - overlap
  console.log(`--- ${label} (${viewport.width}x${viewport.height})`)
  console.log(`face ${g.face.w.toFixed(2)}x${g.face.h.toFixed(2)} aspect=${(g.face.w / g.face.h).toFixed(4)} (2:3 = 0.6667)`)
  console.log(`edgeVar=${g.edgeVar} shellW=${g.shell.w.toFixed(2)} overlap=${overlap.toFixed(2)} visibleProtrusion=${visible.toFixed(2)}`)
  console.log(`copyRight=${(g.copy.x + g.copy.w).toFixed(1)} bookLeft=${g.book.x.toFixed(1)} bookTop=${g.book.y.toFixed(1)} copyBottom=${(g.copy.y + g.copy.h).toFixed(1)}`)
  console.log(`img filter=${g.imgFilter} transform=${g.imgTransform} boxShadow=${g.imgBoxShadow}`)
  console.log(`strip idle transform=${g.stripTransform}`)
  console.log(`plate ${g.plate.x.toFixed(1)},${g.plate.y.toFixed(1)} ${g.plate.w.toFixed(1)}x${g.plate.h.toFixed(1)} | strip ${g.strip.x.toFixed(1)},${g.strip.y.toFixed(1)} ${g.strip.w.toFixed(1)}x${g.strip.h.toFixed(1)} (must match: registration by construction)`)
  await ctx.close()
  return g
}

await geometry({ width: 1440, height: 900 }, 'desktop')
await geometry({ width: 1024, height: 768 }, 'tablet')
await geometry({ width: 390, height: 844 }, 'mobile')

// Leaf amplitude: park the pointer at the stage's bottom-right corner, read
// the settled strip translation, verify the subtle ceilings.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/en/cinematic-window-r13`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForTimeout(400)
  const box = await page.locator('.r13-stage').boundingBox()
  await page.mouse.move(box.x + box.width - 4, box.y + box.height - 4)
  await page.waitForTimeout(900)
  const d = await page.evaluate(() => {
    const strip = document.querySelector('.r13-strip')
    const stage = document.querySelector('.r13-stage')
    const face = document.querySelector('.r13-face')
    const shell = document.querySelector('.r13-shell')
    const plate = document.querySelector('.r13-plate')
    const sb = stage.getBoundingClientRect()
    const fb = face.getBoundingClientRect()
    const lb = shell.getBoundingClientRect()
    const pb = plate.getBoundingClientRect()
    const m = /matrix\(([^)]+)\)/.exec(getComputedStyle(strip).transform || '')
    const tx = m ? parseFloat(m[1].split(',')[4]) : 0
    const ty = m ? parseFloat(m[1].split(',')[5]) : 0
    return {
      tx, ty, stageW: sb.width,
      plateX: pb.x, plateY: pb.y,
      overlap: (fb.x + fb.width) - lb.x,
    }
  })
  console.log(`--- leaf @corner: tx=${d.tx.toFixed(2)}px (ceiling 6) ty=${d.ty.toFixed(2)}px (ceiling 3) platePinned=${d.plateX.toFixed(2)},${d.plateY.toFixed(2)} overlap-under-drift=${d.overlap.toFixed(2)}px`)
  await ctx.close()
}

// Registration pixel test: screenshot with the strip vs strip hidden. The
// diff must be confined to the strip band (book-bottom overlap + feathered
// nosing); everywhere else must be exactly 0.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/en/cinematic-window-r13`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForTimeout(800)
  const stage = await page.locator('.r13-stage').boundingBox()
  const { writeFileSync: wfs } = await import('node:fs')
  const { dirname: dn, join: jn } = await import('node:path')
  const { fileURLToPath: f2p } = await import('node:url')
  const diagDir = jn(dn(f2p(import.meta.url)), '../../r13-captures')
  await page.screenshot({ path: jn(diagDir, 'diag-strip-on.png'), clip: stage })
  await page.evaluate(() => {
    const s = document.querySelector('.r13-strip')
    if (s) s.style.display = 'none'
  })
  await page.waitForTimeout(200)
  await page.screenshot({ path: jn(diagDir, 'diag-strip-off.png'), clip: stage })
  await page.evaluate(() => {
    const s = document.querySelector('.r13-strip')
    if (s) s.style.display = ''
  })
  console.log('--- strip on/off pair saved to r13-captures/diag-strip-*.png (diffed with PIL for R13-RESULT)')
  await ctx.close()
}

// CLS: fresh load with a layout-shift observer, fonts + images settled.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.addInitScript(() => {
    window.__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) window.__cls += e.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/en/cinematic-window-r13`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForTimeout(1500)
  const cls = await page.evaluate(() => window.__cls)
  console.log(`--- CLS (1440 load, incl. fonts/images) = ${cls.toFixed(4)} (target <= 0.05)`)
  await ctx.close()
}

// LCP: median of 5 cold loads each, R8 banked still vs R13 leaf still.
async function lcp(route, label) {
  const vals = []
  for (let i = 0; i < 5; i++) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/en/${route}`, { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => new Promise((resolve) => {
      let done = false
      const to = setTimeout(() => { if (!done) { done = true; resolve(0) } }, 8000)
      new PerformanceObserver((list, obs) => {
        const last = list.getEntries().at(-1)
        if (last) {
          const t = last.renderTime || last.loadTime || 0
          // Wait for network quiet: resolve 800ms after the last LCP entry.
          clearTimeout(to)
          setTimeout(() => { if (!done) { done = true; obs.disconnect(); resolve(t) } }, 800)
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    }))
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(1200)
    const v = await page.evaluate(() => new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1)
        resolve(last ? (last.renderTime || last.loadTime || 0) : 0)
      }).observe({ type: 'largest-contentful-paint', buffered: true })
      setTimeout(() => resolve(0), 100)
    }))
    vals.push(v)
    await ctx.close()
  }
  vals.sort((x, y) => x - y)
  console.log(`--- LCP ${label}: runs=[${vals.map((v) => v.toFixed(0)).join(', ')}]ms median=${vals[2].toFixed(0)}ms`)
  return vals[2]
}

const lcpR8 = await lcp('cinematic-window-r8', 'R8 banked')
const lcpR13 = await lcp('cinematic-window-r13', 'R13 leaf')
console.log(`--- LCP regression (R13-R8) = ${(lcpR13 - lcpR8).toFixed(0)}ms (kill if >200ms or R13 >2500ms)`)

await browser.close()
