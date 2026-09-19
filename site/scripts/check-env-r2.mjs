// Track C R2 (development-only): cover-pixel parity + readability + budget gates.
//
// Compares env=0 (baseline: atmosphere pass, neutral studio light) against the
// R2 authored environment (DOM plate, direct render, warm key/cool fill) at
// desktop 1440x900 light, freezing the natural boot slot in both modes.
// Same camera/geometry/covers in both modes, so the front-cover screen bbox
// must not drift; interior pixels may shift only within the lighting-match
// tolerance. This script MEASURES and then GATES (see GATES below).
//
// Usage: node scripts/check-env-r2.mjs [--out=../r2-captures] [--measure]
//   --measure: print/write the report but always exit 0 (threshold tuning).
import { chromium as playwright } from '@playwright/test';
import chromium from '@sparticuz/chromium';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../public');
let out = path.resolve(import.meta.dirname, '../../r2-captures');
let measureOnly = false;
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--out=')) out = path.resolve(arg.slice('--out='.length));
  if (arg === '--measure') measureOnly = true;
}
await mkdir(out, { recursive: true });

// Gate thresholds (principled, documented in TRACK-C-R2-RESULT.md):
// - bboxDrift: identical camera/geometry => sub-pixel drift only.
// - meanAbs/maxAbs: warm-key shift (0xffffff -> 0xfff1de) on mostly-white
//   covers moves lit pixels a few LSB; anything larger means a material,
//   exposure, or compositing change beyond the lighting match.
// - fracOver2: fraction of channel samples differing by more than 2 LSB.
// - drawDelta: exactly the one daisAnchor quad (atmosphere quad is skipped).
// - env0Bytes: baseline must transfer zero environment bytes.
// - errors: no new console/page errors in either mode.
// Thresholds measured 2026-09-19 (desktop 1440x900 light, boot slot, R2 day
// plate): meanAbs 2.956, maxAbs 9, fracOver2 0.594 with bbox drift exactly 0.
// Gates admit that warm-key/cool-fill tint with ~2x margin while catching any
// material, exposure, or compositing change (large local deltas, any drift).
const GATES = {
  bboxDriftMax: 1.0,
  meanAbsMax: 6.0,
  maxAbsMax: 16,
  fracOver2Max: 0.75,
  drawDeltaMax: 1,
  env0Bytes: 0,
};

const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'image/woff2', '.css': 'text/css',
};
const server = createServer(async (req, res) => {
  try {
    const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    res.setHeader('Content-Type', mime[path.extname(f)] || 'application/octet-stream');
    res.end(await readFile(f));
  } catch {
    res.writeHead(404); res.end('not found');
  }
});
await new Promise((r) => server.listen(3211, '127.0.0.1', r));

const browser = await playwright.launch({
  executablePath: await chromium.executablePath(),
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});

const report = { viewport: { width: 1440, height: 900 }, modes: {}, errors: [], gates: GATES };
const failures = [];
try {
  for (const env of [0, 1]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (e) => report.errors.push(`env=${env} pageerror: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') report.errors.push(`env=${env} console: ${m.text()}`); });
    let envBytes = 0;
    page.on('response', async (resp) => {
      if (resp.url().includes('/orbit/env/')) {
        try { envBytes += (await resp.body()).length; } catch { /* ignore */ }
      }
    });
    await page.goto(`http://127.0.0.1:3211/orbit/index.html?env=${env}`);
    await page.waitForFunction(() => window.__ORBIT?.state === 'orbit', null, { timeout: 120000 });
    await page.evaluate(async () => { window.T = await import('/orbit/vendor/three.module.js'); });
    await page.waitForFunction(
      () => window.__ORBIT?.state === 'orbit' && !window.__ORBIT.motionDebug.frameScheduled,
      null, { timeout: 120000 },
    );
    if (env === 1) {
      await page.waitForFunction(
        () => {
          const img = document.getElementById('env-plate');
          const fg = document.getElementById('env-foreground');
          return img && !img.hidden && img.complete && img.naturalWidth > 0 &&
            fg && !fg.hidden && fg.complete && fg.naturalWidth > 0;
        }, null, { timeout: 120000 },
      );
    }
    await page.waitForFunction(() => !window.__ORBIT.motionDebug.frameScheduled, null, { timeout: 60000 });
    // The foreground occlusion leaf is DOM compositing over the canvas (verified
    // visually in the capture matrix). Hide it for the pixel gate so the gate
    // isolates the 3D cover rendering + lighting match alone.
    let fgHidden = false;
    if (env === 1) {
      fgHidden = await page.evaluate(() => {
        const fg = document.getElementById('env-foreground');
        if (fg && !fg.hidden) { fg.hidden = true; return true; }
        return false;
      });
      await page.waitForFunction(() => !window.__ORBIT.motionDebug.frameScheduled, null, { timeout: 60000 });
    }
    const info = await page.evaluate(() => {
      const orbit = window.__ORBIT;
      const slot = orbit.slots[orbit.frontIndex];
      const mesh = slot.closed.hitMeshes.find((m) => m.userData.coverArtwork === 'front');
      mesh.updateWorldMatrix(true, false);
      const p = new window.T.Vector3();
      const xs = []; const ys = [];
      const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        p.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).project(orbit.camera);
        xs.push(((p.x + 1) * innerWidth) / 2);
        ys.push(((1 - p.y) * innerHeight) / 2);
      }
      return {
        state: orbit.state, frontIndex: orbit.frontIndex, env: orbit.env,
        envSrc: orbit.envSrc, scene: window.__orbitPerf.scene,
        renders: window.__orbitPerf.renders,
        sunColor: `#${orbit.studio.sun.color.getHexString()}`,
        fillColor: `#${orbit.studio.fill.color.getHexString()}`,
        daisVisible: (() => { let v = null; orbit.ringGroup.traverse((o) => { if (o.geometry?.parameters?.width === 94 * 2.9) v = o.visible; }); return v; })(),
        bbox: {
          x: Math.min(...xs), y: Math.min(...ys),
          w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys),
        },
      };
    });
    const shotPath = path.join(out, `parity-env${env}.png`);
    await page.screenshot({ path: shotPath, timeout: 60000 });
    report.modes[`env${env}`] = { ...info, envBytes, fgHiddenForGate: fgHidden, shot: path.basename(shotPath) };
    await page.close();
  }

  const [a64, b64] = await Promise.all([
    readFile(path.join(out, 'parity-env0.png'), 'base64'),
    readFile(path.join(out, 'parity-env1.png'), 'base64'),
  ]);
  const page = await browser.newPage();
  const diff = await page.evaluate(
    async ({ a64, b64, bbox }) => {
      const load = (b64) => new Promise((resolve, reject) => {
        const img = new Image(); img.onload = () => resolve(img); img.onerror = reject;
        img.src = `data:image/png;base64,${b64}`;
      });
      const [a, b] = await Promise.all([load(a64), load(b64)]);
      const w = a.naturalWidth; const h = a.naturalHeight;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true });
      const ex = bbox.x + bbox.w * 0.18, ey = bbox.y + bbox.h * 0.18;
      const ew = bbox.w * 0.64, eh = bbox.h * 0.64;
      g.drawImage(a, 0, 0); const da = g.getImageData(ex, ey, ew, eh);
      g.drawImage(b, 0, 0); const db = g.getImageData(ex, ey, ew, eh);
      let sum = 0, max = 0, over2 = 0, lumA = 0, lumB = 0;
      const n = da.data.length / 4;
      for (let i = 0; i < da.data.length; i += 4) {
        const la = 0.2126 * da.data[i] + 0.7152 * da.data[i + 1] + 0.0722 * da.data[i + 2];
        const lb = 0.2126 * db.data[i] + 0.7152 * db.data[i + 1] + 0.0722 * db.data[i + 2];
        lumA += la; lumB += lb;
        for (let k = 0; k < 3; k++) {
          const d = Math.abs(da.data[i + k] - db.data[i + k]);
          sum += d; if (d > max) max = d; if (d > 2) over2++;
        }
      }
      return {
        interior: { x: Math.round(ex), y: Math.round(ey), w: Math.round(ew), h: Math.round(eh) },
        pixels: n,
        meanAbs: +(sum / (n * 3)).toFixed(3),
        maxAbs: max,
        fracOver2: +(over2 / (n * 3)).toFixed(5),
        meanLumEnv0: +(lumA / n).toFixed(2),
        meanLumEnv1: +(lumB / n).toFixed(2),
      };
    },
    { a64, b64, bbox: report.modes.env0.bbox },
  );
  await page.close();
  report.coverInteriorDiff = diff;
  const bb = report.modes.env1.bbox, b0 = report.modes.env0.bbox;
  report.bboxDrift = {
    dx: +(bb.x - b0.x).toFixed(2), dy: +(bb.y - b0.y).toFixed(2),
    dw: +(bb.w - b0.w).toFixed(2), dh: +(bb.h - b0.h).toFixed(2),
  };
  report.drawDelta = report.modes.env1.scene.calls - report.modes.env0.scene.calls;
  report.triDelta = report.modes.env1.scene.triangles - report.modes.env0.scene.triangles;

  const check = (name, ok, detail) => {
    report[`gate_${name}`] = ok ? 'PASS' : `FAIL (${detail})`;
    if (!ok) failures.push(name);
  };
  check('bboxDrift', Math.max(Math.abs(report.bboxDrift.dx), Math.abs(report.bboxDrift.dy), Math.abs(report.bboxDrift.dw), Math.abs(report.bboxDrift.dh)) <= GATES.bboxDriftMax, JSON.stringify(report.bboxDrift));
  check('meanAbs', diff.meanAbs <= GATES.meanAbsMax, diff.meanAbs);
  check('maxAbs', diff.maxAbs <= GATES.maxAbsMax, diff.maxAbs);
  check('fracOver2', diff.fracOver2 <= GATES.fracOver2Max, diff.fracOver2);
  check('drawDelta', report.drawDelta <= GATES.drawDeltaMax, report.drawDelta);
  check('env0Bytes', report.modes.env0.envBytes === GATES.env0Bytes, report.modes.env0.envBytes);
  check('noErrors', report.errors.length === 0, report.errors.join(' | ').slice(0, 300));
  check('readability', diff.meanLumEnv1 >= 80, `lum ${diff.meanLumEnv1}`);
  report.verdict = failures.length === 0 ? 'PASS' : `FAIL: ${failures.join(',')}`;
  console.log(JSON.stringify(report, null, 2));
  if (!measureOnly && failures.length) process.exitCode = 1;
} catch (e) {
  report.failure = e.message;
  process.exitCode = 1;
  console.log(JSON.stringify(report, null, 2));
} finally {
  await writeFile(path.join(out, 'parity-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  server.close();
}
