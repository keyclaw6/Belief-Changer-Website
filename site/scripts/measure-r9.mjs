/**
 * R9 gate measurement (local, uncommitted). Reads DOM geometry + CLS + rig
 * drift amplitude on the prod bundle and prints falsifiable numbers.
 * Usage: node measure-r9.mjs
 */
import { chromium } from '@playwright/test'

const BASE = process.env.R9_BASE || 'http://127.0.0.1:3100'

const browser = await chromium.launch({
  executablePath: '/home/kab/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

async function geometry(viewport, label) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/en/cinematic-window-r9`, { waitUntil: 'domcontentloaded' })
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
    const img = document.querySelector('.r9-face img')
    const cs = img ? getComputedStyle(img) : null
    const book = document.querySelector('.r9-book')
    const edge = book ? getComputedStyle(book).getPropertyValue('--r9-edge').trim() : null
    const rig = document.querySelector('.r9-rig')
    const stage = document.querySelector('.r9-stage')
    return {
      face: r('.r9-face'), shell: r('.r9-shell'), copy: r('.r9-copy'),
      link: r('.r9-link'), book: r('.r9-book'), contact: r('.r9-contact'),
      rig: r('.r9-rig'), stage: r('.r9-stage'),
      edgeVar: edge,
      rigTransform: rig ? getComputedStyle(rig).transform : null,
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
  console.log(`rig idle transform=${g.rigTransform} rigW=${g.rig.w.toFixed(1)} stageW=${g.stage.w.toFixed(1)} overscan=${((g.rig.w - g.stage.w) / 2).toFixed(1)}px/side`)
  await ctx.close()
  return g
}

await geometry({ width: 1440, height: 900 }, 'desktop')
await geometry({ width: 1024, height: 768 }, 'tablet')
await geometry({ width: 390, height: 844 }, 'mobile')

// Drift amplitude: park the pointer at the stage's right edge, read the
// settled rig translation, verify the <=3% single-axis ceiling.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/en/cinematic-window-r9`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForTimeout(400)
  const box = await page.locator('.r9-stage').boundingBox()
  await page.mouse.move(box.x + box.width - 4, box.y + box.height / 2)
  await page.waitForTimeout(900)
  const d = await page.evaluate(() => {
    const rig = document.querySelector('.r9-rig')
    const stage = document.querySelector('.r9-stage')
    const face = document.querySelector('.r9-face')
    const shell = document.querySelector('.r9-shell')
    const sb = stage.getBoundingClientRect()
    const fb = face.getBoundingClientRect()
    const lb = shell.getBoundingClientRect()
    const m = /matrix\(([^)]+)\)/.exec(getComputedStyle(rig).transform || '')
    const tx = m ? parseFloat(m[1].split(',')[4]) : 0
    const ty = m ? parseFloat(m[1].split(',')[5]) : 0
    return { tx, ty, stageW: sb.width, overlap: (fb.x + fb.width) - lb.x }
  })
  console.log(`--- drift @right-edge: tx=${d.tx.toFixed(2)}px ty=${d.ty.toFixed(2)}px (${(Math.abs(d.tx) / d.stageW * 100).toFixed(2)}% of stage, ceiling 3%) overlap-under-drift=${d.overlap.toFixed(2)}px`)
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
  await page.goto(`${BASE}/en/cinematic-window-r9`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForTimeout(1500)
  const cls = await page.evaluate(() => window.__cls)
  console.log(`--- CLS (1440 load, incl. fonts/images) = ${cls.toFixed(4)} (target <= 0.05)`)
  await ctx.close()
}

await browser.close()
