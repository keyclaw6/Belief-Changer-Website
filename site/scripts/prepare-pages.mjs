import { cp, readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, join, extname } from 'node:path'
const site = fileURLToPath(new URL('../', import.meta.url))
const output = process.env.PAGES_OUTPUT
if (!output) throw new Error('PAGES_OUTPUT must name a new deployment directory')
const base = (process.env.PREVIEW_BASE || '/Belief-Changer-Website/').replace(/\/$/, '')
await mkdir(output, { recursive: false })
await cp(resolve(site, 'dist/client'), output, { recursive: true })
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (['.html','.js','.mjs','.json','.css'].includes(extname(path))) {
      let text = await readFile(path, 'utf8')
      // Raw public orbit modules are not processed by Vite. Prefix their root assets
      // and document navigation; don't rewrite relative imports or application route ids.
      if (path.startsWith(join(output,'orbit')+'/')) {
        text = text.replace(/(["'`(])\/(fonts|orbit-materials|orbit|responsive|covers|site|en|da|ar)(?=\/|["'`])/g, `$1${base}/$2`)
        text = text.replace(/`\/\$\{LOCALE\}\/books\//g, '`'+base+'/${LOCALE}/books/')
      }
      if (path.endsWith('.html')) text = text.replace(/<head>/, '<head><meta name="robots" content="noindex,nofollow">')
      await writeFile(path,text)
    }
  }
}
await walk(output)
await writeFile(join(output,'.nojekyll'),'')
await writeFile(join(output,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0; url=${base}/en/"><title>Belief Changer preview</title></head><body><a href="${base}/en/">Open the Belief Changer preview</a></body></html>`)
await writeFile(join(output,'404.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Preview page not found</title></head><body style="font:18px system-ui;padding:5vw"><h1>This preview page is not available.</h1><a href="${base}/en/">Return to the library</a></body></html>`)
await writeFile(join(output,'robots.txt'),'User-agent: *\nDisallow: /\n')
console.log(`Prepared isolated Pages artifact at ${output}`)
