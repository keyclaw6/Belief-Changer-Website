import {chromium as playwright} from '@playwright/test';
import chromium from '@sparticuz/chromium';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const site=path.resolve(import.meta.dirname,'..'),out=path.resolve(site,'../docs/qa-repair');await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{const f=path.join(site,'public',decodeURIComponent(req.url.split('?')[0]));res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(await readFile(f))}catch{res.writeHead(404);res.end('not found')}});await new Promise(r=>server.listen(3200,'127.0.0.1',r));
const browser=await playwright.launch({executablePath:await chromium.executablePath(),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const report={errors:[],gestures:[],metrics:{}};
try{
const page=await browser.newPage({viewport:{width:960,height:640}});page.on('pageerror',e=>report.errors.push(e.message));
await page.goto('http://127.0.0.1:3200/orbit/index.html');await page.waitForFunction(()=>window.__ORBIT?.state==='orbit',null,{timeout:60000});console.log('ready');
await page.evaluate(async()=>{window.T=await import('/orbit/vendor/three.module.js')});
await page.getByRole('button',{name:'Explore this book',exact:true}).click();await page.waitForFunction(()=>__ORBIT.state==='inspecting');console.log('inspecting');
const cover=await page.evaluate(()=>{const O=__ORBIT,m=O.reader.hitMeshes[3];m.updateWorldMatrix(true,false);const p=m.localToWorld(new T.Vector3()).project(O.camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,axis:O.reader.dragProjection(null,O.camera,innerWidth,innerHeight)}});
await page.mouse.move(cover.x,cover.y);await page.mouse.down();await page.mouse.move(cover.x+cover.axis.x*cover.axis.span,cover.y+cover.axis.y*cover.axis.span,{steps:8});await page.mouse.up();console.log('cover drag',cover,await page.evaluate(()=>({s:__ORBIT.reader.getState(),debug:__ORBIT.motionDebug})));await page.waitForFunction(()=>__ORBIT.reader.getState().cover===1);report.gestures.push({kind:'cover',passed:true});
const modes=[process.env.POSE||'neutral'];
const start=+(process.env.START||0),count=+(process.env.COUNT||5),direction=+(process.env.DIRECTION||1);
await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(n=>{__ORBIT.reader.turnTo(n);dispatchEvent(new Event('orbit-invalidate'))},direction>0?start:5-start);await page.emulateMedia({reducedMotion:'no-preference'});
for(const mode of modes){
if(mode==='rotated'){await page.mouse.move(80,250);await page.mouse.down();await page.mouse.move(155,285,{steps:10});await page.waitForTimeout(130);await page.mouse.up();await page.mouse.wheel(0,300);await page.waitForTimeout(350)}
for(const dir of [direction])for(let k=start;k<Math.min(5,start+count);k++){
 const i=dir>0?k:4-k;
 const point=await page.evaluate(({i,dir,k})=>{const O=__ORBIT,r=O.reader,m=r.hitMeshes.find(m=>m.userData.leafIndex===i);m.updateWorldMatrix(true,false);const a=m.geometry.attributes.position;
 for(const j of [k%2?8:26,26,42])for(const u of [.8,.55,.95,.3]){const p=new T.Vector3().fromBufferAttribute(a,j*133+Math.round(u*132));m.localToWorld(p);p.project(O.camera);const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(p.x,p.y),O.camera);const hit=r.pickLeaf(ray);if(hit?.i===i && hit.dir===dir)return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,axis:r.dragProjection(hit,O.camera,innerWidth,innerHeight),hit}}
 throw Error('No visible leaf '+i+' dir '+dir);
 },{i,dir,k});
 await page.mouse.move(point.x,point.y);await page.mouse.down();
 const owns=await page.evaluate(()=>__ORBIT.motionDebug.pageDragging);if(!owns)throw Error('pointer did not own leaf '+i);
 await page.mouse.move(point.x+point.axis.x*point.axis.span*.96*dir,point.y+point.axis.y*point.axis.span*.96*dir,{steps:6});
 await page.mouse.up();await page.waitForFunction(n=>{const s=__ORBIT.reader.getState();return s.turned===n&&s.turning<0},dir>0?i+1:i,{timeout:15000});report.gestures.push({kind:'leaf',i,dir,mode,passed:true});console.log('passed',i,dir,mode);
}
}
if(process.env.CAPTURE_GESTURE)await page.screenshot({path:path.join(out,`reading-${process.env.POSE||'neutral'}-${process.env.DIRECTION||1}.png`),timeout:60000});
report.metrics=await page.evaluate(()=>({scene:__orbitPerf.scene,boot:__orbitPerf.reveal,geometry:__ORBIT.renderer.info.memory.geometries,textures:__ORBIT.renderer.info.memory.textures}));
console.log(JSON.stringify(report));
}catch(e){report.failure=e.message;console.log(JSON.stringify(report));process.exitCode=1}finally{await writeFile(path.join(out,`gesture-results-${process.env.POSE||'neutral'}-${process.env.DIRECTION||1}-${process.env.START||0}.json`),JSON.stringify(report,null,2));await browser.close();server.close()}
