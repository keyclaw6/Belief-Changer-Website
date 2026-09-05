import { test, expect } from '@playwright/test'
const ready = page => page.waitForFunction(() => window.__ORBIT?.state === 'orbit' && __ORBIT.slots.filter(Boolean).length === __ORBIT.N)
const inspect = async page => { await page.getByRole('button', { name: 'Explore this book' }).click(); await page.waitForFunction(() => __ORBIT.state === 'inspecting') }
const settle = page => page.waitForFunction(() => { const n = window.__orbitPerf.renders; if (n !== window.__lastRenders) { window.__lastRenders = n; window.__lastChange = performance.now() } return performance.now() - window.__lastChange > 400 })
// Screenshot readback can stall software GL; keep image generation separate from behavior assertions.
// CAPTURE_QA=1 opts in; the reference-review capture script is the primary visual pass.
const capture = (page, name) => process.env.CAPTURE_QA === '1'
  ? page.screenshot({ path: `../docs/qa/${name}.png`, timeout: 60000 })
  : Promise.resolve()
function watch(page) { const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('response', r => { if (r.status() >= 400 && /\.(js|mjs|webp|woff|json)/.test(r.url())) errors.push(`${r.status()} ${r.url()}`) }); return errors }

test('desktop: boot, titles, browse, idle GPU, no external network', async ({ page }) => {
  const errors = watch(page), external = []
  page.on('request', r => { if (/^https?:/.test(r.url()) && !r.url().includes('127.0.0.1:3100')) external.push(r.url()) })
  await page.goto('/orbit/index.html'); await ready(page); await settle(page)
  await expect(page.locator('#caption-title')).toHaveText('The Sugar Trap')
  // The one-time reader warm-up is not idle work; measure after its asynchronous type finishes.
  await page.waitForFunction(() => ['done', 'skipped'].includes(__orbitPerf.prewarm) && !(window.BK?.textDiag?.outstanding.length > 0))
  await settle(page)
  await capture(page, 'desktop-orbit')
  const n = await page.evaluate(() => __orbitPerf.renders)
  await page.waitForTimeout(650)
  expect(await page.evaluate(() => __orbitPerf.renders)).toBe(n)
  expect(await page.evaluate(() => __ORBIT.motionDebug.frameScheduled)).toBe(false)
  await page.getByRole('button', { name: 'Next book', exact: true }).click(); await ready(page)
  await expect(page.locator('#caption-title')).toHaveText('The Smoking Trap')
  await page.keyboard.press('ArrowLeft'); await ready(page)
  const info = await page.evaluate(() => ({ calls: __orbitPerf.scene.calls, triangles: __orbitPerf.scene.triangles, textures: __ORBIT.renderer.info.memory.textures, geometries: __ORBIT.renderer.info.memory.geometries, boot: __orbitPerf.reveal, dpr: __ORBIT.renderer.getPixelRatio() }))
  console.log('ORBIT_METRICS', JSON.stringify(info))
  expect(info.calls).toBeLessThan(100)
  const point = await page.evaluate(() => {
    const slot = __ORBIT.slots[__ORBIT.frontIndex];
    const p = slot.host.getWorldPosition(slot.host.position.clone()).project(__ORBIT.camera);
    return { x:(p.x + 1) * innerWidth / 2, y:(1 - p.y) * innerHeight / 2 };
  });
  await page.mouse.click(point.x, point.y);
  await page.waitForFunction(() => __ORBIT.state === 'inspecting');
  expect(external).toEqual([]); expect(errors).toEqual([])
})

test('reader: cover, five forward/backward pages, stable geometry, idle and reopen', async ({ page }) => {
  const errors = watch(page)
  await page.goto('/orbit/index.html'); await ready(page); await inspect(page); await settle(page)
  await page.getByRole('button', { name: 'Open cover', exact: true }).click()
  await page.waitForFunction(() => __ORBIT.reader.getState().cover === 1); await settle(page)
  const before = await page.evaluate(() => { const ids=[]; __ORBIT.reader.group.traverse(o=>{ if(o.userData.zSign) ids.push(o.geometry.uuid) }); return ids })
  for (let i = 1; i <= 5; i++) {
    await page.getByRole('button', { name: 'Next page', exact: true }).click()
    await page.waitForFunction(n => __ORBIT.reader.getState().turned === n && __ORBIT.reader.getState().turning === -1, i)
  }
  await expect(page.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled()
  await page.keyboard.press('ArrowLeft')
  await page.waitForFunction(() => __ORBIT.reader.getState().turned === 4 && __ORBIT.reader.getState().turning === -1)
  await settle(page)
  expect(await page.evaluate(() => { const ids=[]; __ORBIT.reader.group.traverse(o=>{ if(o.userData.zSign) ids.push(o.geometry.uuid) }); return ids })).toEqual(before)
  expect(await page.evaluate(() => __ORBIT.renderer.info.memory.geometries)).toBeLessThan(200)
  const renders = await page.evaluate(() => __orbitPerf.renders)
  await page.waitForTimeout(650)
  expect(await page.evaluate(() => __orbitPerf.renders)).toBe(renders)
  await page.keyboard.press('Escape'); await ready(page)
  await inspect(page); await settle(page)
  expect(await page.evaluate(() => __ORBIT.reader.getState().cover)).toBe(0)
  expect(errors).toEqual([])
})

test('mobile: readable framing, accessible controls, reading and resizing', async ({ page }) => {
  const errors = watch(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/orbit/index.html'); await ready(page); await settle(page)
  expect(await page.evaluate(() => __ORBIT.N)).toBe(56)
  await capture(page, 'mobile-orbit')
  await inspect(page); await settle(page); await capture(page, 'mobile-inspect')
  await page.getByRole('button', { name: 'Open cover', exact: true }).click()
  await page.waitForFunction(() => __ORBIT.reader.getState().cover === 1); await settle(page)
  expect(await page.evaluate(() => __ORBIT.reader.group.getObjectByName('troikaTitle').visible)).toBe(false)
  await capture(page, 'mobile-reading')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
  await page.setViewportSize({ width: 844, height: 390 }); await settle(page)
  await capture(page, 'mobile-landscape')
  expect(errors).toEqual([])
})

test('dark: environment and print stay readable', async ({ page }) => {
  const errors = watch(page)
  await page.emulateMedia({ colorScheme: 'dark' }); await page.goto('/orbit/index.html'); await ready(page); await settle(page)
  expect(await page.evaluate(() => __ORBIT.sceneDark)).toBe(true)
  await capture(page, 'dark-orbit'); await inspect(page); await settle(page); await capture(page, 'dark-inspect')
  expect(errors).toEqual([])
})

test('production homepage upgrades only after ready; module failure retains static books', async ({ page }) => {
  const errors = watch(page)
  await page.goto('/en'); const frame = page.frameLocator('iframe')
  await expect(frame.locator('#caption-title')).toHaveText('The Sugar Trap', { timeout: 30000 })
  await expect(page.locator('iframe')).toHaveAttribute('aria-hidden', 'false')
  await capture(page, 'homepage')
  expect(errors).toEqual([])
  await page.route('**/orbit/vendor/three.module.js', route => route.abort())
  await page.reload()
  await expect(page.locator('iframe')).toHaveCount(0, { timeout: 30000 })
  expect(await page.locator('img').count()).toBeGreaterThan(3)
})

test('reduced motion, RTL and SSR retain a readable library', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('iframe')).toHaveCount(0)
  await capture(page, 'arabic-reduced-motion')
  const html = await (await request.get('/en/books/sugar/read/1')).text()
  expect(html).toContain('chapter')
  expect(html.toLowerCase()).toContain('hreflang')
  const images = await page.locator('img').evaluateAll(images => images.filter(i => i.complete && i.naturalWidth).map(i => i.currentSrc))
  expect(images.some(src => src.includes('/responsive/'))).toBe(true)
})

test('WebGL context can recover without a page reload', async ({ page }) => {
  await page.goto('/orbit/index.html'); await ready(page)
  await page.evaluate(() => { window.__loss = __ORBIT.renderer.getContext().getExtension('WEBGL_lose_context'); __loss.loseContext() })
  await page.waitForTimeout(250)
  await page.evaluate(() => __loss.restoreContext())
  await page.waitForFunction(() => !__ORBIT.renderer.getContext().isContextLost())
  await page.getByRole('button', { name: 'Next book', exact: true }).click(); await ready(page)
  await expect(page.locator('#caption-title')).toHaveText('The Smoking Trap')
})
