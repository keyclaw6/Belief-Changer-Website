import { chromium as playwright } from '@playwright/test';
import chromium from '@sparticuz/chromium';
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = process.env.PAGES_OUTPUT;
if (!root) throw Error('PAGES_OUTPUT required');
const base = '/Belief-Changer-Website';
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith(base + '/')) throw Error('wrong base');
    let f = path.join(
      root,
      decodeURIComponent(url.pathname.slice(base.length)),
    );
    if ((await stat(f)).isDirectory()) f = path.join(f, 'index.html');
    res.setHeader(
      'Content-Type',
      mime[path.extname(f)] || 'application/octet-stream',
    );
    res.end(await readFile(f));
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(3400, '127.0.0.1', r));
const browser = await playwright.launch({
  executablePath: await chromium.executablePath(),
  args: [
    '--no-sandbox',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--disable-dev-shm-usage',
  ],
});
const report = { errors: [], checks: [] };
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 650 } });
  page.on('pageerror', (e) => report.errors.push(e.message));
  page.on('response', (r) => {
    if (r.status() >= 400) report.errors.push(r.status() + ' ' + r.url());
  });
  await page.goto('http://127.0.0.1:3400' + base + '/en/');
  await page.waitForFunction(
    () =>
      document.querySelector('iframe')?.getAttribute('aria-hidden') === 'false',
    null,
    { timeout: 30000 },
  );
  const frame = page.frames().find((f) => f.url().includes('/orbit/'));
  await frame.waitForFunction(() => window.__ORBIT?.state === 'orbit');
  assert.equal(
    await frame.evaluate(() => __ORBIT.repairVersion),
    'orbit-final-20260905-3',
  );
  report.checks.push('Mounted homepage/iframe ready with repair identity');
  await frame.locator('#open-book').click();
  await frame.waitForFunction(() => __ORBIT.state === 'inspecting');
  await frame.evaluate(() => {
    const r = __ORBIT.reader,
      old = performance.now.bind(performance);
    let now = old();
    performance.now = () => now;
    try {
      r.setCover(1);
      for (let i = 0; i < 5; i++) {
        r.beginDrag({ i, dir: 1, u: 0.94, w: 0 });
        r.updateDrag(1);
        r.endDrag(true);
        now += 2000;
        r.update(0.016);
      }
    } finally {
      performance.now = old;
      dispatchEvent(new Event('orbit-invalidate'));
    }
  });
  await page.waitForFunction(
    () =>
      document.querySelector('[data-destination-portal]')?.dataset.visible ===
      'true',
  );
  await frame.locator('#preview-end').click({ noWaitAfter: true });
  await page.waitForURL(/Belief-Changer-Website\/en\/books\/sugar\/?$/, {
    timeout: 60000,
  });
  report.checks.push(
    'Projected destination portal -> client navigation preserves Pages base',
  );
  await page.goto('http://127.0.0.1:3400' + base + '/en/books/sugar/read/1/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  assert.match(await page.locator('body').innerText(), /late afternoon/);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  assert.match(await page.locator('body').innerText(), /late afternoon/);
  report.checks.push('Real sample chapter and deep reload');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:3400' + base + '/ar/');
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  report.checks.push('Arabic mounted SSR route and RTL');
  assert.deepEqual(report.errors, []);
  console.log(JSON.stringify(report));
} catch (e) {
  report.failure = e.message;
  console.log(JSON.stringify(report));
  process.exitCode = 1;
} finally {
  await writeFile(
    path.resolve(import.meta.dirname, '../../docs/qa-final/pages-smoke.json'),
    JSON.stringify(report, null, 2),
  );
  await browser.close();
  server.close();
}
