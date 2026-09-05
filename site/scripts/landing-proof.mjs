import { chromium as playwright } from '@playwright/test';
import chromium from '@sparticuz/chromium';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const current = path.resolve(import.meta.dirname, '..');
const output = path.resolve(current, '../docs/qa-repair/landing');
await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'};
const fixture = `<!doctype html><style>body{margin:0;background:#dddcd4}canvas{display:block}</style><script src="/orbit/_extract/00-fonts.js"></script><script src="/orbit/_extract/01-noise.js"></script><script src="/orbit/_extract/02-geometry.js"></script><script src="/orbit/_extract/03-pageturn.js"></script><script src="/orbit/_extract/04-text.js"></script><script type="importmap">{"imports":{"three":"/orbit/vendor/three.module.js","troika-three-utils":"/orbit/vendor/troika/troika-three-utils.mjs","troika-worker-utils":"/orbit/vendor/troika/troika-worker-utils.mjs","webgl-sdf-generator":"/orbit/vendor/troika/webgl-sdf-generator.mjs","bidi-js":"/orbit/vendor/troika/bidi.mjs"}}</script><script type="module">
import * as T from 'three';import * as E from '/orbit/book-engine.js';
const renderer=new T.WebGLRenderer({antialias:true});E.configureRenderer(renderer,T);renderer.shadowMap.enabled=false;renderer.setSize(900,650);renderer.setPixelRatio(1);document.body.append(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#dddcd4');scene.add(new T.HemisphereLight(0xffffff,0x99958b,2));const key=new T.DirectionalLight(0xffffff,3);key.position.set(-10,30,40);scene.add(key);
const cam=new T.PerspectiveCamera(38,900/650,.2,300);cam.position.set(-8,9,53);cam.lookAt(-8,0,0);
const shared=await E.createSharedResources(T,{fontUrl:'/orbit/vendor/fonts/dm-sans-latin-500-normal.woff'});const meta=(await fetch('/orbit/_extract/books-meta.json').then(r=>r.json()))[0];
const r=await E.createReaderBook(T,shared,{...meta,author:'Belief Changer'});const pose=new T.Group();pose.rotation.set(.18,-.30,0);pose.add(r.group);scene.add(pose);r.setCover(1);
let now=performance.now();performance.now=()=>now;
function draw(){scene.updateMatrixWorld(true);r.updateFacing(cam);renderer.render(scene,cam)}
function vertices(i){return Array.from(r.hitMeshes.find(m=>m.userData.leafIndex===i).geometry.attributes.position.array)}
window.proof={r,draw,vertices,tick(ms){now+=ms;r.update(.016);draw()},begin(i,dir=1,u=.94,w=-.58){return r.beginDrag({i,dir,u,w})},scrub(t){r.updateDrag(t);draw()},state(){return r.getState()}};
await new Promise(resolve=>setTimeout(resolve,1500));draw();window.ready=true;
</script>`;
const roots=[['baseline','/agent/workspace/orbit-baseline/site/public'],[process.env.PROOF_NAME||'checkpoint',path.join(current,'public')]];
const servers=[];const browser=await playwright.launch({executablePath:await chromium.executablePath(),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const results={};
try{for(let j=0;j<roots.length;j++){
 const [name,root]=roots[j]; const server=createServer(async(req,res)=>{try{if(req.url==='/proof.html'){res.setHeader('Content-Type','text/html');res.end(fixture);return}const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(await readFile(f))}catch{res.writeHead(404);res.end('not found')}});await new Promise(r=>server.listen(3201+j,'127.0.0.1',r));servers.push(server);
 const page=await browser.newPage({viewport:{width:900,height:650}});page.on('pageerror',e=>console.log(name,e.message));await page.goto(`http://127.0.0.1:${3201+j}/proof.html`);await page.waitForFunction(()=>window.ready,{},{timeout:30000});
 results[name]={};
 for(let i=0;i<5;i++){
  const samples={};await page.evaluate(i=>{if(!proof.begin(i))throw Error('begin failed '+i)},i);
  for(const t of [.35,.45,.5,.55,.6,.65,.75,.85,.92,.97,1]){samples[t]=await page.evaluate(({i,t})=>{proof.scrub(t);return proof.vertices(i)},{i,t});if(i===2)await page.screenshot({path:path.join(output,`${name}-${t}.png`),timeout:60000})}
  samples.rest=await page.evaluate(i=>{proof.r.endDrag(true);proof.tick(1600);return proof.vertices(i)},i);
  results[name][i]=samples;
 }
 for(let i=4;i>=0;i--){await page.evaluate(i=>{if(!proof.begin(i,-1,.94,.58))throw Error('reverse failed');proof.scrub(.03)},i);const before=await page.evaluate(i=>proof.vertices(i),i);const rest=await page.evaluate(i=>{proof.scrub(0);proof.r.endDrag(true);proof.tick(1600);return proof.vertices(i)},i);results[name]['reverse'+i]={before,rest}}
 await page.close();
}
const [a,b]=Object.keys(results);const max=(v,w)=>v.reduce((m,x,i)=>Math.max(m,Math.abs(x-w[i])),0);
const summary={baseline:a,current:b,samples:[]};for(let i=0;i<5;i++){for(const t of [.65,.75,.85,.92,.97,1,'rest'])summary.samples.push({leaf:i,t,baselineCurrentMax:max(results[a][i][t],results[b][i][t])});summary.samples.push({leaf:i,t:'landingJumpBaseline',max:max(results[a][i][1],results[a][i].rest)},{leaf:i,t:'landingJumpCurrent',max:max(results[b][i][1],results[b][i].rest)})}
await writeFile(path.join(output,`${b}-comparison.json`),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary));
for(const name of [a,b]){await sharp({create:{width:1800,height:1300,channels:3,background:'#dddcd4'}}).composite(await Promise.all([.65,.75,.85,.92,.97,1].map(async(t,i)=>({input:await sharp(path.join(output,`${name}-${t}.png`)).resize(600,650).toBuffer(),left:i%3*600,top:Math.floor(i/3)*650})))).png().toFile(path.join(output,`${name}-contact.png`))}
}finally{await browser.close();for(const s of servers)s.close()}
