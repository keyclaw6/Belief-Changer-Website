import sharp from 'sharp'
import { mkdir, readdir, readFile, writeFile, stat } from 'node:fs/promises'
import { resolve, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
const site = fileURLToPath(new URL('../', import.meta.url))
const manifest = {}
let originalBytes = 0, largestBytes = 0
for (const family of ['covers', 'site']) {
  const output = resolve(site, 'public/responsive', family)
  await mkdir(output, { recursive: true })
  const files = (await readdir(resolve(site, 'public', family))).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort()
  for (const file of files) {
    const source = resolve(site, 'public', family, file)
    const info = await sharp(source).metadata()
    const widths = [...new Set((family === 'covers' ? [320, 640, 1024] : [640, 1280, 1920]).map(w => Math.min(w, info.width)))].sort((a,b)=>a-b)
    const variants = []
    for (const width of widths) {
      const name = `${basename(file, extname(file))}-${width}.webp`
      const target = resolve(output, name)
      await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: family === 'covers' ? 91 : 86, effort: 5 }).toFile(target)
      variants.push({ width, src: `/responsive/${family}/${name}`, bytes: (await stat(target)).size })
    }
    originalBytes += (await stat(source)).size
    largestBytes += variants.at(-1).bytes
    manifest[`/${family}/${file}`] = { width: info.width, height: info.height, variants }
  }
}
await writeFile(resolve(site, 'src/lib/image-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
// The orbit consumes the same untouched cover sources, at display-appropriate resolutions.
const metaPath = resolve(site, 'public/orbit/_extract/books-meta.json')
const books = JSON.parse(await readFile(metaPath, 'utf8'))
for (const book of books) {
  const image = manifest[`/covers/${book.file}`]
  book.coverUrl = image.variants.at(-1).src
  book.ringCoverUrl = image.variants.find(v => v.width >= 640)?.src || book.coverUrl
}
await writeFile(metaPath, JSON.stringify(books, null, 2) + '\n')
console.log(JSON.stringify({ images: Object.keys(manifest).length, originalBytes, largestWebpBytes: largestBytes, reductionPercent: +(100 * (1-largestBytes/originalBytes)).toFixed(1) }))
