import { chromium as playwright } from '@playwright/test'
import chromium from '@sparticuz/chromium'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

// Run npm run serve first. Usage: node scripts/capture-hero.mjs [home|desktop|mobile|dark]
const mode = process.argv[2] || 'home'
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3100'
const output = fileURLToPath(new URL('../../docs/qa-v2/', import.meta.url))
await mkdir(output, { recursive: true })
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (process.platform === 'linux' ? await chromium.executablePath() : undefined)
const browser = await playwright.launch({ executablePath, args: process.platform === 'linux' ? ['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage'] : [] })
try {
  const page = await browser.newPage({ viewport: mode === 'mobile' ? {width:390,height:844} : {width:1440,height:1000}, colorScheme:mode==='dark'?'dark':'light' })
  const errors = []
  page.on('pageerror',error=>errors.push(error.message))
  page.on('console',message=>{ if(message.type()==='error') errors.push(message.text()) })
  await page.goto(`${base}/${mode==='home'?'en':'orbit/index.html'}`)
  if(mode==='home') await page.waitForFunction(()=>document.querySelector('iframe')?.getAttribute('aria-hidden')==='false')
  const scene = mode==='home' ? page.frames().find(frame=>frame.url().includes('/orbit/')) : page
  await scene.waitForFunction(()=>window.__ORBIT?.state==='orbit' && __ORBIT.books().length===__ORBIT.N,{},{timeout:60000})
  await scene.waitForFunction(()=>!__ORBIT.motionDebug.frameScheduled,{},{timeout:20000})
  const stats = await scene.evaluate(()=>({books:__ORBIT.N,scene:__orbitPerf.scene,focus:__ORBIT.atmosphere.uniforms.focus.value,resources:__ORBIT.renderer.info.memory,frameScheduled:__ORBIT.motionDebug.frameScheduled}))
  await page.screenshot({path:resolve(output,`${mode}.png`),timeout:60000})
  await writeFile(resolve(output,`${mode}.json`),JSON.stringify({stats,errors},null,2))
  if(errors.length) throw new Error(errors.join('\n'))
  console.log(JSON.stringify({mode,...stats}))
} finally { await browser.close() }
