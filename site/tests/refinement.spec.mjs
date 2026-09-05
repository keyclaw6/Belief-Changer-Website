import { test, expect } from '@playwright/test';
async function home(
  page,
  { locale = 'en', viewport = { width: 960, height: 720 } } = {},
) {
  await page.setViewportSize(viewport);
  await page.goto('/' + locale);
  await page.waitForFunction(
    () =>
      document
        .querySelector('iframe[data-orbit-frame]')
        ?.getAttribute('aria-hidden') === 'false',
  );
  const f = page.frames().find((f) => f.url().includes('/orbit/index.html'));
  await f.waitForFunction(() => window.__ORBIT?.state === 'orbit');
  return f;
}
async function endPreview(frame) {
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
}

test('refinement: headline only and cord releases across iframe without double toggle', async ({
  page,
}) => {
  const frame = await home(page);
  await expect(page.locator('.atmospheric-hero__heading')).toHaveText(
    'A little clarity. A different life.',
  );
  const knob = page.locator('.pullcord-knob');
  await page.waitForTimeout(800);
  const b = await knob.boundingBox();
  const before = await page.locator('html').getAttribute('data-theme');
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x - 120, b.y + 95, { steps: 12 });
  await page.mouse.up();
  await expect(knob).not.toHaveAttribute('data-dragging', 'true');
  expect(await page.locator('html').getAttribute('data-theme')).not.toBe(
    before,
  );
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.mouse.move(400, 400);
  await page.waitForTimeout(500);
  expect(await page.locator('html').getAttribute('data-theme')).toBe(theme);
  await knob.focus();
  await page.keyboard.press('Enter');
  expect(await page.locator('html').getAttribute('data-theme')).not.toBe(theme);
  expect(await frame.evaluate(() => __ORBIT.state)).toBe('orbit');
});

test('refinement: stationary overhead-only dark lamp and multisampled edges', async ({
  page,
}) => {
  const frame = await home(page);
  await page.locator('.pullcord-knob').focus();
  await page.keyboard.press('Enter');
  await frame.waitForFunction(() => __ORBIT.sceneDark);
  const before = await frame.evaluate(() => ({
    p: __ORBIT.lamp.position.toArray(),
    target: __ORBIT.lamp.target.position.toArray(),
  }));
  const samples = await frame.evaluate(async () => {
    const o = __ORBIT;
    o.goToIndex(35);
    const samples = [];
    for (let i = 0; i < 15; i++) {
      await new Promise(requestAnimationFrame);
      samples.push({
        p: o.lamp.position.toArray(),
        target: o.lamp.target.position.toArray(),
      });
    }
    return samples;
  });
  for (const s of samples) expect(s).toEqual(before);
  const light = await frame.evaluate(() => {
    const o = __ORBIT;
    return {
      ambient: [
        o.studio.sun.intensity,
        o.studio.fill.intensity,
        o.studio.rim.intensity,
        o.studio.hemi.intensity,
        o.readingFill.intensity,
        o.scene.environmentIntensity,
      ],
      samples: o.atmosphere.target.samples,
    };
  });
  expect(light.ambient).toEqual([0, 0, 0, 0, 0, 0]);
  expect(light.samples).toBeGreaterThanOrEqual(2);
});

test('refinement: featured and reader use identical live print layout', async ({
  page,
}) => {
  const frame = await home(page);
  await frame.waitForFunction(
    () => __ORBIT.slots[__ORBIT.frontIndex].featuredBook,
  );
  const before = await frame.evaluate(() => {
    const g =
      __ORBIT.slots[__ORBIT.frontIndex].host.getObjectByName('troikaTitle');
    return g.children.map((t) => ({
      text: t.text,
      font: t.font,
      size: t.fontSize,
      y: t.position.y,
      spacing: t.letterSpacing,
    }));
  });
  await frame.locator('#open-book').click();
  await frame.waitForFunction(() => __ORBIT.state === 'inspecting');
  const after = await frame.evaluate(() =>
    __ORBIT.reader.group.getObjectByName('troikaTitle').children.map((t) => ({
      text: t.text,
      font: t.font,
      size: t.fontSize,
      y: t.position.y,
      spacing: t.letterSpacing,
    })),
  );
  expect(after).toEqual(before);
  await frame.locator('#panel-back').click();
  await frame.waitForFunction(
    () =>
      __ORBIT.state === 'orbit' &&
      __ORBIT.slots[__ORBIT.frontIndex].featuredBook,
  );
});

test('refinement: phone Arabic destination keeps locale, real content and transition cleanup', async ({
  page,
}) => {
  const external = [];
  page.on('request', (request) => {
    if (
      /^https?:/.test(request.url()) &&
      new URL(request.url()).hostname !== '127.0.0.1'
    )
      external.push(request.url());
  });
  const frame = await home(page, {
    locale: 'ar',
    viewport: { width: 390, height: 844 },
  });
  await endPreview(frame);
  const portal = page.locator('[data-destination-portal]');
  await expect(portal).toHaveAttribute('data-visible', 'true', {
    timeout: 20000,
  });
  await expect(page.locator('[data-destination-frame]')).toHaveAttribute(
    'data-destination-frame',
    /\/ar\/books\/sugar/,
  );
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector('[data-destination-portal]'))
        .opacity === '1',
  );
  await page.screenshot({
    path: '../docs/qa-final/phone-arabic-portal.png',
    timeout: 45000,
  });
  await frame.locator('#preview-end').click({ noWaitAfter: true });
  await page.waitForURL(/\/ar\/books\/sugar\/?$/, { timeout: 60000 });
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(portal).toHaveCount(0);
  expect(external).toEqual([]);
});

test('refinement: failed destination preview retains a normal usable link', async ({
  page,
}) => {
  const frame = await home(page);
  await page.route('**/en/books/sugar', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'text/html',
      body: '<html><body>Preview unavailable</body></html>',
    }),
  );
  await endPreview(frame);
  await page.waitForTimeout(700);
  await expect(frame.locator('#preview-end')).toBeVisible();
  await expect(page.locator('[data-destination-portal]')).not.toHaveAttribute(
    'data-visible',
    'true',
  );
  await page.unroute('**/en/books/sugar');
  await frame.locator('#preview-end').click({ noWaitAfter: true });
  await page.waitForURL(/\/en\/books\/sugar\/?$/, { timeout: 60000 });
  await expect(page.locator('h1')).toContainText('Sugar');
});

test('final: destination is preloaded at inspection and provides a visible click cue', async ({
  page,
}) => {
  const frame = await home(page);
  await frame.locator('#open-book').click();
  await frame.waitForFunction(() => __ORBIT.state === 'inspecting');
  const preview = page.locator('[data-destination-frame]');
  await expect(preview).toHaveCount(1);
  await expect(
    page.frameLocator('[data-destination-frame]').locator('main h1'),
  ).toContainText('Sugar');
  expect(
    await preview.evaluate(
      (el) => el.contentDocument.querySelectorAll('script').length,
    ),
  ).toBe(0);
  expect(await frame.evaluate(() => __ORBIT.reader.getState().turned)).toBe(0);
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
  await expect(page.locator('[data-destination-cue]')).toContainText(
    'Click to open the book',
  );
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector('[data-destination-cue]'))
        .opacity === '1',
  );
});

test('refinement: real destination is mounted on page eleven then expands into matching route', async ({
  page,
}) => {
  const frame = await home(page);
  await endPreview(frame);
  const portal = page.locator('[data-destination-portal]');
  await expect(portal).toHaveAttribute('data-visible', 'true', {
    timeout: 20000,
  });
  const surface = page.frameLocator('[data-destination-frame]');
  await expect(surface.locator('h1')).toContainText('Sugar');
  expect(
    await portal.evaluate((el) => getComputedStyle(el).transform),
  ).toContain('matrix3d');
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector('[data-destination-portal]'))
        .opacity === '1',
  );
  await page.screenshot({
    path: '../docs/qa-final/page11-portal.png',
    timeout: 45000,
  });
  await frame.locator('#preview-end').click({ noWaitAfter: true });
  await page.waitForURL(/\/en\/books\/sugar\/?$/, { timeout: 60000 });
  await expect(page.locator('h1')).toContainText('Sugar');
  await expect(portal).toHaveCount(0);
});
