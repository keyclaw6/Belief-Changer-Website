import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const site = fileURLToPath(new URL('../', import.meta.url))
const modules = resolve(site, 'node_modules')
const output = resolve(site, 'public/orbit/vendor')
const files = {
  '@fontsource/newsreader/files/newsreader-latin-400-normal.woff': 'fonts/newsreader-latin-400-normal.woff',
  'three/build/three.module.js': 'three.module.js',
  'three/build/three.core.js': 'three.core.js',
  'troika-three-text/dist/troika-three-text.esm.js': 'troika-three-text.module.js',
  'troika-three-utils/dist/troika-three-utils.esm.js': 'troika/troika-three-utils.mjs',
  'troika-worker-utils/dist/troika-worker-utils.esm.js': 'troika/troika-worker-utils.mjs',
  'webgl-sdf-generator/dist/webgl-sdf-generator.mjs': 'troika/webgl-sdf-generator.mjs',
  'bidi-js/dist/bidi.mjs': 'troika/bidi.mjs',
  '@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff': 'fonts/dm-sans-latin-500-normal.woff',
}
for (const [source, target] of Object.entries(files)) {
  const path = resolve(output, target)
  await mkdir(dirname(path), { recursive: true })
  await copyFile(resolve(modules, source), path)
}
const notices = []
for (const name of ['three', 'troika-three-text', 'troika-three-utils', 'troika-worker-utils', 'webgl-sdf-generator', 'bidi-js', '@fontsource/dm-sans', '@fontsource/newsreader']) {
  const pkg = JSON.parse(await readFile(resolve(modules, name, 'package.json'), 'utf8'))
  let license = ''
  for (const file of ['LICENSE', 'LICENSE.md', 'OFL.txt']) {
    try { license = await readFile(resolve(modules, name, file), 'utf8'); break } catch {}
  }
  notices.push(`${name} ${pkg.version} (${pkg.license})\n${license}`)
}
await writeFile(resolve(output, 'LICENSES.txt'), notices.join('\n\n---\n\n'))
console.log(`Vendored ${Object.keys(files).length} pinned runtime files; no CDN requests required.`)
