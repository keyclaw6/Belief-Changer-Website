import {test,expect} from '@playwright/test';
const ready=page=>page.waitForFunction(()=>window.__ORBIT?.state==='orbit');
async function boot(page){await page.setViewportSize({width:900,height:600});await page.goto('/orbit/index.html');await ready(page);await page.evaluate(async()=>{window.T=await import('/orbit/vendor/three.module.js')})}
async function inspect(page){await page.locator('#open-book').click();await page.waitForFunction(()=>__ORBIT.state==='inspecting')}
async function atPage(page,n){await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(n=>{__ORBIT.reader.turnTo(n);dispatchEvent(new Event('orbit-invalidate'))},n);await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(n=>__ORBIT.reader.getState().turned===n,n)}

test('repair: printed ring, continuous featured and ordinary hover exit',async({page})=>{
 await boot(page);
 for(const kind of ['featured','ordinary']){
 const point=await page.evaluate(kind=>{const O=__ORBIT;
 for(const s of O.slots){if((kind==='featured')!==(s.host.userData.slotIndex===O.frontIndex))continue;s.host.updateWorldMatrix(true,true);const p=s.host.getWorldPosition(new T.Vector3()).project(O.camera);if(Math.abs(p.x)>.9||Math.abs(p.y)>.85)continue;
 const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(p.x,p.y),O.camera);const hits=ray.intersectObjects(O.slots.flatMap(s=>s.closed.hitMeshes),false);if(hits[0]?.object.userData.slotIndex===s.host.userData.slotIndex)return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,i:s.host.userData.slotIndex};}throw Error('no visible target')},kind);
 await page.mouse.move(point.x,point.y);await page.waitForFunction(i=>__ORBIT.motionDebug.hoverAmounts[i]>.25,point.i);
 const before=await page.evaluate(i=>__ORBIT.motionDebug.hoverAmounts[i],point.i);
 const samples=await page.evaluate(async i=>{document.querySelector('#stage canvas').dispatchEvent(new PointerEvent('pointerleave'));const values=[];for(let k=0;k<4;k++){await new Promise(requestAnimationFrame);values.push(__ORBIT.motionDebug.hoverAmounts[i])}return values},point.i);
 expect(samples[0]).toBeGreaterThan(0);expect(samples.at(-1)).toBeLessThan(before);
 }
 expect(await page.evaluate(()=>__orbitPerf.scene.calls)).toBeLessThan(100);
});

test('repair: return matches final slot from zoomed rotated page five and reopens cleanly',async({page})=>{
 await boot(page);await inspect(page);await atPage(page,5);
 await page.evaluate(()=>{__ORBIT.detailSpin.rotation.set(.4,.8,0);dispatchEvent(new Event('orbit-invalidate'))});await page.mouse.move(500,300);await page.mouse.wheel(0,350);
 await page.keyboard.press('Escape');await ready(page);
 const error=await page.evaluate(()=>{const O=__ORBIT,r=O.reader.group,s=O.slots[O.frontIndex].closed.group;r.updateWorldMatrix(true,true);s.updateWorldMatrix(true,true);return Math.max(...r.matrixWorld.elements.map((x,i)=>Math.abs(x-s.matrixWorld.elements[i])))});
 expect(error).toBeLessThan(.001);
 await inspect(page);expect(await page.evaluate(()=>__ORBIT.reader.getState())).toMatchObject({cover:0,turned:0,turning:-1});
});

test('repair: last cap raycast CTA and keyboard equivalent navigate to real book',async({page})=>{
 await boot(page);await inspect(page);await atPage(page,5);
 await expect(page.locator('#preview-end')).toBeVisible();await expect(page.locator('#preview-end')).toHaveAttribute('href','/en/books/sugar');
 expect(await page.evaluate(()=>__ORBIT.reader.userData.pages.length)).toBe(11);
 const point=await page.evaluate(()=>{const O=__ORBIT,m=O.reader.group.getObjectByName('preview-cap');m.updateWorldMatrix(true,false);const a=m.geometry.attributes.position;const p=new T.Vector3().fromBufferAttribute(a,Math.floor(a.count*.25));p.z=0;m.localToWorld(p);p.project(O.camera);const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(p.x,p.y),O.camera);if(!O.reader.previewLinkHit(ray))throw Error('cap target rejected');return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2}});
 await page.mouse.click(point.x,point.y);await page.waitForURL(/\/en\/books\/sugar\/?$/,{waitUntil:'domcontentloaded',timeout:60000});await expect(page.locator('h1')).toContainText('Sugar');
});

test('repair: cancellation releases owner and touch pinch stays outside physical surface',async({page})=>{
 await boot(page);await inspect(page);await atPage(page,0);
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:20,y:250,id:41}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:20,y:250,id:41},{x:100,y:250,id:42}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:20,y:250,id:41},{x:300,y:250,id:42}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 expect(await page.evaluate(()=>__ORBIT.motionDebug.activePointerId)).toBeNull();
 await page.mouse.move(500,300);await page.mouse.wheel(0,2000);
 const clearance=await page.evaluate(()=>{const O=__ORBIT;O.reader.group.updateWorldMatrix(true,true);let front=-Infinity;const p=new T.Vector3();for(const m of O.reader.hitMeshes){const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);front=Math.max(front,p.z)}}return O.camera.position.z-front});expect(clearance).toBeGreaterThanOrEqual(9.99);
 await page.locator('#reset-book').click();await page.waitForFunction(()=>__ORBIT.motionDebug.inspectZoom===0);
});
