// Track C R1 spike (development-only): A/B + responsive capture matrix.
// Standalone orbit over the static public dir; no app build required.
// Usage: node scripts/capture-env-r1.mjs [--out=../r1-captures]
import { chromium as playwright } from '@playwright/test';
import chromium from '@sparticuz/chromium';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../public');
let out = path.resolve(import.meta.dirname, '../../r1-captures');
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--out=')) out = path.resolve(arg.slice('--out='.length));
}
await mkdir(out, { recursive: true });

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'image/woff2',
  '.css': 'text/css',
};
const server = createServer(async (req, res) => {
  try {
    const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    res.setHeader('Content-Type', mime[path.extname(f)] || 'application/octet-stream');
    res.end(await readFile(f));
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(3214, '127.0.0.1', r));
const browser = await playwright.launch({
  executablePath: await chromium.executablePath(),
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});

const shots = [
  { name: 'r1-mobile-env1-light', url: '/orbit/index.html?env=1', viewport: { width: 390, height: 844 }, colorScheme: 'light' },
  { name: 'r1-desktop-env1-dark', url: '/orbit/index.html?env=1', viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
  { name: 'r1-desktop-env1-ar', url: '/orbit/index.html?env=1&locale=ar', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
  { name: 'r1-desktop-env1-reducedmotion', url: '/orbit/index.html?env=1', viewport: { width: 1440, height: 900 }, colorScheme: 'light', reducedMotion: true },
];
const report = { shots: {} };
try {
  for (const shot of shots) {
    const page = await browser.newPage({ viewport: shot.viewport, colorScheme: shot.colorScheme });
    if (shot.reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
    page.on('pageerror', (e) => console.log(`${shot.name} PAGEERROR:`, e.message));
    await page.goto(`http://127.0.0.1:3214${shot.url}`);
    await page.waitForFunction(() => window.__ORBIT?.state === 'orbit', null, { timeout: 120000 });
    if (shot.url.includes('env=1')) {
      await page.waitForFunction(
        () => {
          const img = document.getElementById('env-plate');
          return img && !img.hidden && img.complete && img.naturalWidth > 0;
        },
        null,
        { timeout: 60000 },
      );
    }
    await page.waitForFunction(() => !window.__ORBIT.motionDebug.frameScheduled, null, { timeout: 60000 });
    const info = await page.evaluate(() => ({
      state: window.__ORBIT.state,
      frontIndex: window.__ORBIT.frontIndex,
      env: window.__ORBIT.env,
      dark: window.__ORBIT.sceneDark,
      plateHidden: document.getElementById('env-plate')?.hidden,
      plateW: document.getElementById('env-plate')?.naturalWidth,
      scene: window.__orbitPerf.scene,
    }));
    await page.screenshot({ path: path.join(out, `${shot.name}.png`), timeout: 90000 });
    report.shots[shot.name] = info;
    console.log(shot.name, JSON.stringify(info));
    await page.close();
  }
  console.log('r1 matrix done');
} catch (e) {
  report.failure = e.message;
  process.exitCode = 1;
  console.log(JSON.stringify(report, null, 2));
} finally {
  await writeFile(path.join(out, 'capture-matrix.json'), JSON.stringify(report, null, 2));
  await browser.close();
  server.close();
}
