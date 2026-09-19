// Track C R2 (development-only): env0 vs R2 capture + metrics matrix.
//
// Standalone orbit shots run over the static public dir; homepage shots run
// against a locally spawned production bridge (dist/, built by npm run build).
// Every shot records console/page errors, WebGL draw calls + triangles,
// the active env asset, env bytes, and (homepage) synthetic LCP/CLS.
//
// Usage: node scripts/capture-env-r2.mjs [--out=../r2-captures] [--only=standalone|home]
import { chromium as playwright } from '@playwright/test';
import chromium from '@sparticuz/chromium';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../public');
let out = path.resolve(import.meta.dirname, '../../r2-captures');
let only = 'all';
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--out=')) out = path.resolve(arg.slice('--out='.length));
  if (arg.startsWith('--only=')) only = arg.slice('--only='.length);
}
await mkdir(out, { recursive: true });

const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'image/woff2', '.css': 'text/css',
};
const staticServer = createServer(async (req, res) => {
  try {
    const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    res.setHeader('Content-Type', mime[path.extname(f)] || 'application/octet-stream');
    res.end(await readFile(f));
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((r) => staticServer.listen(3214, '127.0.0.1', r));

const APP_PORT = 3222;
let bridge = null;
async function ensureBridge() {
  if (bridge) return;
  bridge = spawn('node', ['scripts/serve-prod.mjs', String(APP_PORT)], { cwd: path.resolve(import.meta.dirname, '..'), stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${APP_PORT}/en`);
      if (res.ok) { await res.text(); return; }
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('prod bridge did not start');
}

const browser = await playwright.launch({
  executablePath: await chromium.executablePath(),
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});

const standaloneShots = [
  { name: 'r2-desktop-1440-light-env', url: '/orbit/index.html', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
  { name: 'r2-desktop-1440-light-env0', url: '/orbit/index.html?env=0', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
  { name: 'r2-desktop-1024-light-env', url: '/orbit/index.html', viewport: { width: 1024, height: 768 }, colorScheme: 'light' },
  { name: 'r2-desktop-1440-night-env', url: '/orbit/index.html', viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
  { name: 'r2-mobile-390-day-env', url: '/orbit/index.html', viewport: { width: 390, height: 844 }, colorScheme: 'light' },
  { name: 'r2-mobile-390-night-env', url: '/orbit/index.html', viewport: { width: 390, height: 844 }, colorScheme: 'dark' },
  { name: 'r2-mobile-360-day-env', url: '/orbit/index.html', viewport: { width: 360, height: 740 }, colorScheme: 'light' },
  { name: 'r2-desktop-1440-ar-env', url: '/orbit/index.html?locale=ar', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
  { name: 'r2-desktop-1440-reducedmotion-env', url: '/orbit/index.html', viewport: { width: 1440, height: 900 }, colorScheme: 'light', reducedMotion: true },
];

const homeShots = [
  { name: 'r2-home-1440-light', url: '/en', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
  { name: 'r2-home-1440-light-env0', url: '/en?env=0', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
  { name: 'r2-home-390-light', url: '/en', viewport: { width: 390, height: 844 }, colorScheme: 'light' },
  { name: 'r2-home-1440-night', url: '/en', viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
  { name: 'r2-home-1440-ar', url: '/ar', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
  { name: 'r2-home-1440-fallback', url: '/en', viewport: { width: 1440, height: 900 }, colorScheme: 'light', reducedMotion: true },
];

const report = { shots: {} };
async function settleOrbit(frameOrPage) {
  await frameOrPage.waitForFunction(() => window.__ORBIT?.state === 'orbit', null, { timeout: 120000 });
  await frameOrPage.waitForFunction(
    () => {
      if (window.__ORBIT?.env) {
        const img = document.getElementById('env-plate');
        const fg = document.getElementById('env-foreground');
        return img && !img.hidden && img.complete && img.naturalWidth > 0 &&
          fg && !fg.hidden && fg.complete && fg.naturalWidth > 0;
      }
      return true;
    }, null, { timeout: 120000 },
  );
  await frameOrPage.waitForFunction(() => !window.__ORBIT.motionDebug.frameScheduled, null, { timeout: 60000 });
}

try {
  if (only === 'all' || only === 'standalone') {
    for (const shot of standaloneShots) {
      const page = await browser.newPage({ viewport: shot.viewport, colorScheme: shot.colorScheme });
      if (shot.reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 200)}`); });
      let envBytes = 0;
      page.on('response', async (resp) => {
        if (resp.url().includes('/orbit/env/')) {
          try { envBytes += (await resp.body()).length; } catch { /* ignore */ }
        }
      });
      await page.goto(`http://127.0.0.1:3214${shot.url}`);
      await settleOrbit(page);
      const info = await page.evaluate(() => ({
        state: window.__ORBIT.state, frontIndex: window.__ORBIT.frontIndex,
        env: window.__ORBIT.env, envSrc: window.__ORBIT.envSrc,
        dark: window.__ORBIT.sceneDark, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        plateHidden: document.getElementById('env-plate')?.hidden,
        fgHidden: document.getElementById('env-foreground')?.hidden,
        scene: window.__orbitPerf.scene, renders: window.__orbitPerf.renders,
      }));
      await page.screenshot({ path: path.join(out, `${shot.name}.png`), timeout: 90000 });
      report.shots[shot.name] = { ...info, envBytes, errors };
      console.log(shot.name, JSON.stringify({ ...info, envBytes, nErrors: errors.length }));
      await page.close();
    }
  }
  if (only === 'all' || only === 'home') {
    await ensureBridge();
    for (const shot of homeShots) {
      const page = await browser.newPage({ viewport: shot.viewport, colorScheme: shot.colorScheme });
      if (shot.reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 200)}`); });
      let envBytes = 0;
      page.on('response', async (resp) => {
        if (resp.url().includes('/orbit/env/')) {
          try { envBytes += (await resp.body()).length; } catch { /* ignore */ }
        }
      });
      await page.goto(`http://127.0.0.1:${APP_PORT}${shot.url}`);
      if (shot.reducedMotion) {
        await page.waitForTimeout(4000);
      } else {
        await page.waitForFunction(
          () => document.querySelector('iframe[data-orbit-frame]')?.getAttribute('aria-hidden') === 'false',
          null, { timeout: 120000 },
        );
        const frame = page.frames().find((f) => f.url().includes('/orbit/index.html'));
        await settleOrbit(frame);
      }
      const info = await page.evaluate(() => {
        const frame = [...document.querySelectorAll('iframe')].find((f) => (f.src || '').includes('/orbit/'));
        const lcp = performance.getEntriesByType('largest-contentful-paint');
        const cls = performance.getEntriesByType('layout-shift').filter((e) => !e.hadRecentInput).reduce((a, e) => a + e.value, 0);
        return {
          iframePresent: !!frame, iframeReady: frame?.getAttribute('aria-hidden'),
          staticShelfLinks: document.querySelectorAll('a[href*="/books/"]').length,
          dir: document.documentElement.getAttribute('dir'),
          lcpMs: lcp.length ? Math.round(lcp[lcp.length - 1].startTime) : -1,
          cls: +cls.toFixed(4),
        };
      });
      let frameInfo = null;
      if (!shot.reducedMotion) {
        const frame = page.frames().find((f) => f.url().includes('/orbit/index.html'));
        frameInfo = await frame.evaluate(() => ({
          state: window.__ORBIT.state, env: window.__ORBIT.env, envSrc: window.__ORBIT.envSrc,
          dark: window.__ORBIT.sceneDark, scene: window.__orbitPerf.scene,
        }));
      }
      await page.screenshot({ path: path.join(out, `${shot.name}.png`), timeout: 90000 });
      report.shots[shot.name] = { ...info, frameInfo, envBytes, errors };
      console.log(shot.name, JSON.stringify({ ...info, frameInfo, envBytes, nErrors: errors.length }));
      await page.close();
    }
  }
  console.log('r2 matrix done');
} catch (e) {
  report.failure = e.message;
  process.exitCode = 1;
  console.log(JSON.stringify({ failure: e.message }));
} finally {
  await writeFile(path.join(out, 'capture-matrix.json'), JSON.stringify(report, null, 2));
  await browser.close();
  staticServer.close();
  if (bridge) bridge.kill();
}
