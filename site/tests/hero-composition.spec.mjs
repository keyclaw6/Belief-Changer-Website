import { test, expect } from '@playwright/test'

test('portrait hero separates headline, featured cover and caption', async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 })
  await page.goto('/orbit/index.html')
  await page.waitForFunction(() => window.__ORBIT?.state === 'orbit' && __ORBIT.books().length === 56)
  const composition = await page.evaluate(() => {
    const orbit = __ORBIT;
    const slot = orbit.slots[orbit.frontIndex];
    const mesh = slot.closed.hitMeshes.find(m => m.userData.coverArtwork === 'front');
    mesh.updateWorldMatrix(true, false);
    const p = slot.host.position.clone();
    const points = [];
    for (let i=0; i<mesh.geometry.attributes.position.count; i++) {
      p.fromBufferAttribute(mesh.geometry.attributes.position,i).applyMatrix4(mesh.matrixWorld).project(orbit.camera);
      points.push({ x:(p.x+1)*innerWidth/2, y:(1-p.y)*innerHeight/2 });
    }
    const near = slot.host.getWorldPosition(p).applyMatrix4(orbit.camera.matrixWorldInverse).z;
    const far = orbit.slots[28].host.getWorldPosition(p).applyMatrix4(orbit.camera.matrixWorldInverse).z;
    return { top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y)),
      heading:document.getElementById('hero-heading').getBoundingClientRect().bottom,
      caption:document.getElementById('caption').getBoundingClientRect().top,
      depthSeparation:near-far, draws:__orbitPerf.scene.calls };
  });
  expect(composition.top).toBeGreaterThan(composition.heading + 10);
  expect(composition.bottom).toBeLessThan(composition.caption - 6);
  expect(composition.depthSeparation).toBeGreaterThan(150);
  // Dense instanced printing plus one live SDF featured volume, not SDF on every slot.
  expect(composition.draws).toBeLessThan(90);
})

test('homepage heading is server-rendered and fades during inspection', async ({ page, request }) => {
  const html = await (await request.get('/en')).text();
  expect(html).toContain('A little clarity.');
  await page.goto('/en');
  const frame = page.frameLocator('iframe[data-orbit-frame]');
  await expect(frame.getByRole('button', { name:'Explore this book' })).toBeEnabled({ timeout:30000 });
  await frame.getByRole('button', { name:'Explore this book' }).click();
  await expect(page.locator('.atmospheric-hero')).toHaveAttribute('data-inspecting','true');
  await frame.getByRole('button', { name:'Back to the orbit', exact:true }).click();
  await expect(page.locator('.atmospheric-hero')).toHaveAttribute('data-inspecting','false');
})
