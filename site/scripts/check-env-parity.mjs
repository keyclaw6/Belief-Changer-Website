// Track C R1 spike (development-only): cover-pixel parity / compositing sanity.
//
// Freezes the same front slot in env=0 (baseline atmosphere pass) and env=1
// (proof plate + direct render), then compares the front-cover interior
// between the two full-page screenshots. The environment must not visually
// affect the rendered cover except unavoidable screen compositing /
// tone-map tolerance. This script MEASURES; it does not assert exact parity.
//
// Usage: node scripts/check-env-parity.mjs [--out=../r1-captures]
// Exit 0 always on successful measurement; the JSON report carries the numbers.
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
await new Promise((r) => server.listen(3211, '127.0.0.1', r));

const browser = await playwright.launch({
  executablePath: await chromium.executablePath(),
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});

const report = { viewport: { width: 1440, height: 900 }, modes: {}, errors: [] };
try {
  for (const env of [0, 1]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (e) => report.errors.push(`env=${env}: ${e.message}`));
    let envBytes = null;
    page.on('response', async (resp) => {
      if (resp.url().includes('/orbit/env/')) {
        try {
          const buf = await resp.body();
          envBytes = buf.length;
        } catch { /* ignore */ }
      }
    });
    await page.goto(`http://127.0.0.1:3211/orbit/index.html?env=${env}`);
    await page.waitForFunction(() => window.__ORBIT?.state === 'orbit', null, { timeout: 120000 });
    await page.evaluate(async () => {
      window.T = await import('/orbit/vendor/three.module.js');
    });
    // Freeze the natural boot slot (frontIndex 0); do NOT call goToIndex(0)
    // here, as requesting the already-front book opens inspection.
    await page.waitForFunction(
      () => window.__ORBIT?.state === 'orbit' && !window.__ORBIT.motionDebug.frameScheduled,
      null,
      { timeout: 120000 },
    );
    if (env === 1) {
      await page.waitForFunction(
        () => {
          const img = document.getElementById('env-plate');
          return img && !img.hidden && img.complete && img.naturalWidth > 0;
        },
        null,
        { timeout: 120000 },
      );
    }
    await page.waitForFunction(() => !window.__ORBIT.motionDebug.frameScheduled, null, { timeout: 60000 });
    const info = await page.evaluate(() => {
      const orbit = window.__ORBIT;
      const slot = orbit.slots[orbit.frontIndex];
      const mesh = slot.closed.hitMeshes.find((m) => m.userData.coverArtwork === 'front');
      mesh.updateWorldMatrix(true, false);
      const p = new window.T.Vector3();
      const xs = [];
      const ys = [];
      const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        p.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).project(orbit.camera);
        xs.push(((p.x + 1) * innerWidth) / 2);
        ys.push(((1 - p.y) * innerHeight) / 2);
      }
      return {
        state: orbit.state,
        frontIndex: orbit.frontIndex,
        env: orbit.env,
        scene: window.__orbitPerf.scene,
        renders: window.__orbitPerf.renders,
        bbox: {
          x: Math.min(...xs),
          y: Math.min(...ys),
          w: Math.max(...xs) - Math.min(...xs),
          h: Math.max(...ys) - Math.min(...ys),
        },
      };
    });
    const shotPath = path.join(out, `parity-env${env}.png`);
    await page.screenshot({ path: shotPath, timeout: 60000 });
    report.modes[`env${env}`] = { ...info, envBytes, shot: path.basename(shotPath) };
    await page.close();
  }

  // Pixel-diff the cover interior (bbox eroded 18% per side) inside the browser.
  const [a64, b64] = await Promise.all([
    readFile(path.join(out, 'parity-env0.png'), 'base64'),
    readFile(path.join(out, 'parity-env1.png'), 'base64'),
  ]);
  const page = await browser.newPage();
  const diff = await page.evaluate(
    async ({ a64, b64, bbox }) => {
      const load = (b64) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = `data:image/png;base64,${b64}`;
        });
      const [a, b] = await Promise.all([load(a64), load(b64)]);
      const w = a.naturalWidth;
      const h = a.naturalHeight;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true });
      const ex = bbox.x + bbox.w * 0.18;
      const ey = bbox.y + bbox.h * 0.18;
      const ew = bbox.w * 0.64;
      const eh = bbox.h * 0.64;
      g.drawImage(a, 0, 0);
      const da = g.getImageData(ex, ey, ew, eh);
      g.drawImage(b, 0, 0);
      const db = g.getImageData(ex, ey, ew, eh);
      let sum = 0;
      let max = 0;
      let over2 = 0;
      const n = da.data.length / 4;
      for (let i = 0; i < da.data.length; i += 4) {
        for (let k = 0; k < 3; k++) {
          const d = Math.abs(da.data[i + k] - db.data[i + k]);
          sum += d;
          if (d > max) max = d;
          if (d > 2) over2++;
        }
      }
      return {
        interior: { x: Math.round(ex), y: Math.round(ey), w: Math.round(ew), h: Math.round(eh) },
        pixels: n,
        meanAbs: +(sum / (n * 3)).toFixed(3),
        maxAbs: max,
        fracOver2: +(over2 / (n * 3)).toFixed(5),
      };
    },
    { a64, b64, bbox: report.modes.env0.bbox },
  );
  await page.close();
  report.coverInteriorDiff = diff;
  // Bboxes should agree (same frozen slot); record drift, not assert.
  const bb = report.modes.env1.bbox;
  const b0 = report.modes.env0.bbox;
  report.bboxDrift = {
    dx: +(bb.x - b0.x).toFixed(2),
    dy: +(bb.y - b0.y).toFixed(2),
    dw: +(bb.w - b0.w).toFixed(2),
    dh: +(bb.h - b0.h).toFixed(2),
  };
  console.log(JSON.stringify(report, null, 2));
} catch (e) {
  report.failure = e.message;
  process.exitCode = 1;
  console.log(JSON.stringify(report, null, 2));
} finally {
  await writeFile(path.join(out, 'parity-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  server.close();
}
