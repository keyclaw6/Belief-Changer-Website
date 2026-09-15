/**
 * R8 gate measurement (local, uncommitted). Reads DOM geometry + CLS on the
 * prod bundle and prints falsifiable numbers for the R8 note.
 * Usage: node measure-r8.mjs
 */
import { chromium } from '@playwright/test'

const BASE = process.env.R8_BASE || 'http://127.0.0.1:3100'

const browser = await chromium.launch({
  executablePath: '/home/kab/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

async function geometry(viewport, label) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/en/cinematic-window-r8`, { waitUntil: 'domcontentloaded' })
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
    const img = document.querySelector('.r8-face img')
    const cs = img ? getComputedStyle(img) : null
    const book = document.querySelector('.r8-book')
    const edge = book ? getComputedStyle(book).getPropertyValue('--r8-edge').trim() : null
    return {
      face: r('.r8-face'), shell: r('.r8-shell'), copy: r('.r8-copy'),
      link: r('.r8-link'), book: r('.r8-book'), contact: r('.r8-contact'),
      edgeVar: edge,
      imgFilter: cs?.filter, imgTransform: cs?.transform, imgBoxShadow: cs?.boxShadow,
    }
  })
  const overlap = (g.face.x + g.face.w) - g.shell.x // >0 means overlap (no gap)
  const visible = g.shell.w - overlap
  console.log(`--- ${label} (${viewport.width}x${viewport.height})`)
  console.log(`face ${g.face.w.toFixed(2)}x${g.face.h.toFixed(2)} aspect=${(g.face.w / g.face.h).toFixed(4)} (2:3 = 0.6667)`)
  console.log(`edgeVar=${g.edgeVar} shellW=${g.shell.w.toFixed(2)} overlap=${overlap.toFixed(2)} visibleProtrusion=${visible.toFixed(2)}`)
  console.log(`copyRight=${(g.copy.x + g.copy.w).toFixed(1)} bookLeft=${g.book.x.toFixed(1)} bookTop=${g.book.y.toFixed(1)} copyBottom=${(g.copy.y + g.copy.h).toFixed(1)}`)
  console.log(`img filter=${g.imgFilter} transform=${g.imgTransform} boxShadow=${g.imgBoxShadow}`)
  await ctx.close()
  return g
}

await geometry({ width: 1440, height: 900 }, 'desktop')
await geometry({ width: 1024, height: 768 }, 'tablet')
await geometry({ width: 390, height: 844 }, 'mobile')

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
  await page.goto(`${BASE}/en/cinematic-window-r8`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForTimeout(1500)
  const cls = await page.evaluate(() => window.__cls)
  console.log(`--- CLS (1440 load, incl. fonts/images) = ${cls.toFixed(4)} (target <= 0.05)`)
  await ctx.close()
}

await browser.close()
