import { chromium as playwright } from '@playwright/test';
import chromium from '@sparticuz/chromium';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root =
    process.env.PROFILE_ROOT || path.resolve(import.meta.dirname, '../public'),
  name = process.env.PROFILE_NAME || 'current',
  out = path.resolve(import.meta.dirname, '../../docs/qa-final');
await mkdir(out, { recursive: true });
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
const server = createServer(async (req, res) => {
  try {
    const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    res.setHeader(
      'Content-Type',
      mime[path.extname(f)] || 'application/octet-stream',
    );
    res.end(await readFile(f));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(3250, '127.0.0.1', r));
const browser = await playwright.launch({
  executablePath: await chromium.executablePath(),
  args: [
    '--no-sandbox',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--disable-dev-shm-usage',
  ],
});
const result = { name, renderer: 'SwiftShader software GL', errors: [] };
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  page.on('pageerror', (e) => result.errors.push(e.message));
  await page.goto('http://127.0.0.1:3250/orbit/index.html');
  await page.waitForFunction(() => window.__ORBIT?.state === 'orbit');
  await page.locator('#open-book').click();
  await page.waitForFunction(() => __ORBIT.state === 'inspecting');
  result.measurements = await page.evaluate(async () => {
    const O = __ORBIT,
      r = O.reader;
    r.setCover(1);
    dispatchEvent(new Event('orbit-invalidate'));
    await new Promise(requestAnimationFrame);
    const leaf = r.hitMeshes.find((m) => m.userData.leafIndex === 0),
      tex = leaf.material.map;
    const instances = [];
    O.scene.traverse((o) => {
      if (o.isInstancedMesh) instances.push(o);
    });
    const version = () =>
      instances.reduce((sum, m) => sum + m.instanceMatrix.version, 0);
    const v0 = version();
    r.beginDrag({ i: 0, dir: 1, u: 0.94, w: 0.6 });
    const times = [];
    for (let i = 0; i < 150; i++) {
      const t = performance.now();
      r.updateDrag((i % 99) / 100);
      times.push(performance.now() - t);
    }
    r.updateDrag(0.5);
    for (let i = 0; i < 8; i++) {
      dispatchEvent(new Event('orbit-invalidate'));
      await new Promise(requestAnimationFrame);
    }
    const v1 = version();
    times.sort((a, b) => a - b);
    const result = {
      paperTexture: {
        width: tex.image.width,
        height: tex.image.height,
        rgbaBytes: tex.image.width * tex.image.height * 4,
      },
      instanceBufferUpdatesAcross8ReadingFrames: v1 - v0,
      instanceCount: instances.length,
      pageSolveMedianMs: times[75],
      pageSolveP95Ms: times[142],
      bootRevealMs: window.__orbitPerf.reveal,
      scene: { ...__orbitPerf.scene },
      memory: { ...O.renderer.info.memory },
      dpr: O.renderer.getPixelRatio(),
      msaa: O.atmosphere.target.samples,
    };
    r.endDrag(false);
    dispatchEvent(new Event('orbit-invalidate'));
    return result;
  });
  console.log(JSON.stringify(result));
} catch (e) {
  result.failure = e.message;
  console.log(JSON.stringify(result));
  process.exitCode = 1;
} finally {
  await writeFile(
    path.join(out, `profile-${name}.json`),
    JSON.stringify(result, null, 2),
  );
  await browser.close();
  server.close();
}
