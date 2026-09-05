import {test,expect} from '@playwright/test';
test('landing: dense reversible samples converge to rest without a final jump',async({page})=>{
 await page.setViewportSize({width:900,height:600});await page.goto('/orbit/index.html');await page.waitForFunction(()=>window.__ORBIT?.state==='orbit');await page.locator('#open-book').click();await page.waitForFunction(()=>__ORBIT.state==='inspecting');
 const report=await page.evaluate(()=>{
  const r=__ORBIT.reader,clock=performance.now.bind(performance);let now=clock();performance.now=()=>now;r.setCover(1);
  const records=[];
  try{for(const dir of [1,-1])for(let k=0;k<5;k++){
   const i=dir>0?k:4-k,m=r.hitMeshes.find(m=>m.userData.leafIndex===i),a=m.geometry.attributes.position.array;
   if(!r.beginDrag({i,dir,u:k%2?.5:.94,w:k%2?0:.8}))throw Error('begin refused');
   const cost=[];let prior=null,maxStep=0;
   for(let j=0;j<=100;j++){
    const t=dir>0?j/100:1-j/100,begin=clock();r.updateDrag(t);cost.push(clock()-begin);
    if(!a.every(Number.isFinite))throw Error('nonfinite vertex');
    if(prior && j>=70)maxStep=Math.max(maxStep,...a.map((v,k)=>Math.abs(v-prior[k])));
    prior=new Float32Array(a);
   }
   // Approach from inside the trajectory, not just the exact endpoint branch.
   r.updateDrag(dir>0?.99999:.00001);const near=new Float32Array(a);r.updateDrag(dir>0?1:0);const endpoint=new Float32Array(a);
   r.endDrag(true);now+=1800;r.update(.016);
   let jump=0,nearDelta=0;for(let j=0;j<a.length;j++){jump=Math.max(jump,Math.abs(a[j]-endpoint[j]));nearDelta=Math.max(nearDelta,Math.abs(a[j]-near[j]));}
   cost.sort((a,b)=>a-b);records.push({i,dir,jump,nearDelta,maxStep,solveMedianMs:cost[50],solveP95Ms:cost[95]});
  }}finally{performance.now=clock;dispatchEvent(new Event('orbit-invalidate'))}
  return records;
 });
 console.log('LANDING_EVIDENCE',JSON.stringify(report));
 for(const r of report){expect(r.jump).toBeLessThan(1e-6);expect(r.nearDelta).toBeLessThan(.002);expect(r.maxStep).toBeLessThan(1);}
});
