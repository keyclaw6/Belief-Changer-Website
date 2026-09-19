import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const routePath = path.join(root, '../src/routes/$locale/cinematic-window-r13.tsx')
const compPath = path.join(root, '../src/components/home/CinematicWindowR13.tsx')
const cssPath = path.join(root, '../src/components/home/cinematic-window-r13.css')
const pub = (f) => path.join(root, '../public/responsive/site', f)

// R7, R8, and R9 must be preserved unchanged by the R13 spike.
const r7files = [
  '../src/routes/$locale/cinematic-window.tsx',
  '../src/components/home/CinematicWindow.tsx',
  '../src/components/home/cinematic-window.css',
]
const r8files = [
  '../src/routes/$locale/cinematic-window-r8.tsx',
  '../src/components/home/CinematicWindowR8.tsx',
  '../src/components/home/cinematic-window-r8.css',
]
const r9files = [
  '../src/routes/$locale/cinematic-window-r9.tsx',
  '../src/components/home/CinematicWindowR9.tsx',
  '../src/components/home/cinematic-window-r9.css',
]

const comp = () => readFileSync(compPath, 'utf8')
const css = () => readFileSync(cssPath, 'utf8')
const bareCss = () => css().replace(/\/\*[\s\S]*?\*\//g, '')
const bareComp = () => comp().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
const count = (hay, needle) => hay.split(needle).length - 1

test('R13 spike is isolated and preserves R7/R8/R9 unchanged', () => {
  assert.ok(existsSync(routePath), 'R13 route file exists')
  assert.ok(existsSync(compPath), 'R13 component file exists')
  assert.ok(existsSync(cssPath), 'R13 scoped css exists')
  for (const rel of [...r7files, ...r8files, ...r9files]) {
    assert.ok(existsSync(path.join(root, rel)), `preserved: ${rel}`)
  }
  const home = readFileSync(path.join(root, '../src/routes/$locale/index.tsx'), 'utf8')
  // R14 promoted the pattern to the homepage hero; lab slices stay off it.
  assert.doesNotMatch(home, /cinematic-window-r(7|8|9|13)/)
  // R13 reuses its own r13- namespace; no r7-/r8-/r9- class may leak into the
  // spike (the shared a-r7-plate asset name and the a-r13-fore cutout name
  // are the two sanctioned exceptions).
  assert.doesNotMatch(bareComp(), /r7-(?!plate)/)
  assert.doesNotMatch(bareComp(), /r8-/)
  assert.doesNotMatch(bareComp(), /r9-/)
  assert.doesNotMatch(bareCss(), /\.r7-(?!plate)/)
  assert.doesNotMatch(bareCss(), /\.r8-/)
  assert.doesNotMatch(bareCss(), /\.r9-/)
})

test('R13 route is isolated with its own hreflang alternates', () => {
  const route = readFileSync(routePath, 'utf8')
  assert.match(route, /createFileRoute\('\/\$locale\/cinematic-window-r13'\)/)
  assert.match(route, /hreflangAlternates\('\/cinematic-window-r13'\)/)
  assert.match(route, /getBook\('sugar'\)/)
  assert.match(route, /CinematicWindowR13/)
})

test('R13 reuses the approved R7 plate, decorative, no new plate asset', () => {
  assert.match(comp(), /a-r7-plate-.*\.avif/)
  assert.match(comp(), /a-r7-plate-.*\.webp/)
  assert.match(comp(), /768w.*1280w.*1672w/)
  assert.match(comp(), /alt=""/)
  assert.match(comp(), /aria-hidden/)
  assert.match(comp(), /aria-describedby/)
})

test('R13 cover stays exact: true 2:3 face, no filter/tint/transform on the cover node', () => {
  assert.match(comp(), /BookCover/)
  const cssText = bareCss()
  assert.doesNotMatch(comp(), /grayscale\(1\)|hue-rotate|sepia\(|saturate\(/)
  assert.doesNotMatch(cssText, /grayscale\(|sepia\(|hue-rotate\(|saturate\(|brightness\(|invert\(|drop-shadow\(|mix-blend/)
  const faceRule = cssText.match(/\.r13-face\s*\{[^}]*\}/)
  assert.ok(faceRule, 'r13-face rule exists')
  assert.doesNotMatch(faceRule[0], /transform\s*:/)
  assert.doesNotMatch(faceRule[0], /filter\s*:/)
  const faceImgRule = cssText.match(/\.r13-face img\s*\{[^}]*\}/)
  assert.ok(faceImgRule, 'r13-face img rule exists')
  assert.doesNotMatch(faceImgRule[0], /transform\s*:/)
  assert.doesNotMatch(faceImgRule[0], /filter\s*:/)
  assert.match(cssText, /\.r13-face[\s\S]*?aspect-ratio:\s*2\s*\/\s*3/)
  // No per-layer cover distortion anywhere in the slice.
  assert.doesNotMatch(bareComp(), /scale\(|rotate\(|skew\(|perspective/)
  assert.doesNotMatch(cssText, /scale\(|rotate\(|skew\(|perspective/)
})

test('R13 shell registers flush: 1px overlap (0px gap), physical right only', () => {
  const cssText = bareCss()
  for (const cls of ['r13-shell', 'r13-board', 'r13-pages', 'r13-face']) {
    assert.match(comp(), new RegExp(cls))
    assert.match(css(), new RegExp('\\.' + cls))
  }
  assert.match(cssText, /\.r13-shell[\s\S]*?left:\s*calc\(100% - 1px\)/)
  assert.match(cssText, /--r13-edge:\s*clamp\(4px,\s*0\.6vw,\s*9px\)/)
  assert.doesNotMatch(cssText, /inline-start|inline-end/)
  assert.match(cssText, /direction:\s*ltr/)
  assert.doesNotMatch(cssText, /scaleX\(-1\)/)
})

test('R13 keeps the banked shell: one shadow owner, one sill lip, re-seated base', () => {
  const cssText = bareCss()
  assert.match(cssText, /\.r13-face img\s*\{[^}]*box-shadow:\s*none !important/)
  assert.equal(count(cssText, 'box-shadow'), 1, 'exactly one box-shadow declaration (the neutralization)')
  assert.equal(count(comp(), 'r13-contact'), 1, 'exactly one contact element in the component')
  assert.equal(count(comp(), 'r13-sill'), 1, 'exactly one sill lip in the component')
  assert.equal(count(cssText, 'blur('), 1, 'exactly one blur (the contact matte)')
  // Re-seated DOWN to the nosing (R8 bottom was 33%): same left/height.
  assert.match(cssText, /\.r13-book[\s\S]*?left:\s*27%/)
  assert.match(cssText, /\.r13-book[\s\S]*?bottom:\s*25\.2%/)
  assert.match(cssText, /\.r13-book[\s\S]*?height:\s*44%/)
})

test('R13 foreground leaf: one plate-derived cutout, registered box, verbatim pixels', () => {
  // Exactly one strip element; responsive cutout renditions mirror the plate.
  assert.equal(count(comp(), 'r13-strip'), 2, 'strip wrapper + strip img only')
  assert.match(comp(), /a-r13-fore-.*\.webp/)
  assert.match(comp(), /768w.*1280w.*1672w/)
  assert.match(comp(), /sizes="100vw"/)
  // The cutout is enhancement, never LCP: low fetch priority, async decode.
  assert.match(comp(), /fetchPriority="low"/)
  assert.match(comp(), /decoding="async"/)
  assert.match(comp(), /draggable=\{false\}/)
  // Decorative and layout-inert: never intercepts inspection, never shifts.
  assert.match(bareCss(), /\.r13-strip[\s\S]*?pointer-events:\s*none/)
  assert.match(bareCss(), /\.r13-strip[\s\S]*?inset:\s*0/)
  // Same box/fit/position as the plate at every breakpoint: registration by
  // construction. Desktop 50% 50%; portrait 30% 55% for BOTH layers.
  assert.match(bareCss(), /\.r13-strip-img[\s\S]*?object-position:\s*50%\s*50%/)
  const media = bareCss().match(/@media\s*\(max-width:\s*900px\)[\s\S]*$/)
  assert.ok(media, 'portrait block exists')
  assert.match(media[0], /object-position:\s*30%\s*55%/)
  assert.ok(media[0].indexOf('.r13-plate img') !== -1 && media[0].indexOf('.r13-strip-img') !== -1,
    'plate and strip share the portrait crop box')
  // Verbatim plate pixels: no image processing on the leaf either.
  const stripRule = bareCss().match(/\.r13-strip-img\s*\{[^}]*\}/)
  assert.ok(stripRule, 'r13-strip-img rule exists')
  assert.doesNotMatch(stripRule[0], /filter\s*:/)
  assert.doesNotMatch(bareCss(), /grayscale\(|sepia\(|hue-rotate\(|saturate\(|brightness\(|invert\(|drop-shadow\(|mix-blend/)
  // The cutout files exist on disk.
  for (const f of ['a-r13-fore-768.webp', 'a-r13-fore-1280.webp', 'a-r13-fore-1672.webp']) {
    assert.ok(existsSync(pub(f)), `cutout exists: ${f}`)
  }
})

test('R13 leaf-only parallax: strip moves, plate/book/copy pinned, no camera gimmick', () => {
  // Exactly one translate3d call, and it targets the strip ref only.
  assert.equal(count(bareComp(), 'translate3d'), 1, 'exactly one translate3d (the leaf)')
  assert.match(comp(), /strip\.style\.transform/)
  assert.doesNotMatch(bareComp(), /rig\.style\.transform/)
  assert.doesNotMatch(bareComp(), /book\.style\.transform|plate\.style\.transform/)
  // Leaf ceilings: ±6px X, ±3px Y (subtle, never a zoom or camera move).
  assert.match(comp(), /R13_STRIP_MAX_X = 6/)
  assert.match(comp(), /R13_STRIP_MAX_Y = 3/)
  // Pointer inspection only: no scroll coupling, no gyro, no video.
  assert.match(comp(), /pointermove/)
  assert.match(comp(), /pointerleave/)
  assert.match(comp(), /requestAnimationFrame/)
  for (const banned of ['parallax', 'scrollY', 'scrollX', 'DeviceOrientation', 'DeviceMotion', 'gyroscop', 'AbsoluteOrientation', 'addEventListener(\'scroll\'', 'addEventListener("scroll"', 'wheel', '<video', 'zoom']) {
    assert.ok(!bareComp().includes(banned) && !bareCss().includes(banned), `banned: ${banned}`)
  }
  assert.doesNotMatch(bareComp(), /scale\(|rotate\(|skew\(|perspective/)
  assert.doesNotMatch(bareCss(), /scale\(|rotate\(|skew\(|perspective/)
})

test('R13 motion is gated: fine-pointer + hover only, reduced-motion still, no new deps', () => {
  assert.match(comp(), /hover: hover/)
  assert.match(comp(), /pointer: fine/)
  assert.match(comp(), /prefers-reduced-motion/)
  assert.match(bareCss(), /prefers-reduced-motion:\s*reduce/)
  assert.match(bareCss(), /\.r13-strip\s*\{[^}]*transform:\s*none/)
  assert.match(bareCss(), /animation:\s*none/)
  assert.doesNotMatch(comp(), /from ['"]three['"]|from ['"]gsap|from ['"]lenis|from ['"]motion/i)
  const pkg = readFileSync(path.join(root, '../package.json'), 'utf8')
  assert.doesNotMatch(pkg, /gsap|lenis/)
})

test('R13 copy sits in the safe plaster field: no scrim/card', () => {
  assert.match(comp(), /<h1/)
  assert.match(comp(), /\{book\.title\}/)
  assert.match(bareCss(), /left:\s*clamp\(150px,\s*15vw,\s*300px\)/)
  assert.doesNotMatch(bareCss(), /card|scrim|panel/)
  assert.doesNotMatch(bareCss(), /radial-gradient/)
})

test('R13 reading action is one ordinary link: no details gate, no button', () => {
  assert.doesNotMatch(bareComp(), /<details/)
  assert.doesNotMatch(bareComp(), /<summary/)
  assert.doesNotMatch(bareComp(), /<button/)
  assert.equal(count(bareComp(), '<Link'), 1, 'exactly one reading link')
  assert.match(comp(), /\/books\/\$\{book\.slug\}\/read\//)
  assert.match(comp(), /Read the sample chapter|Læs uddraget|اقرأ الفصل الكامل/)
  assert.doesNotMatch(bareCss(), /pill|progress/)
})

test('R13 ships portrait composition, physical RTL, reduced-motion still, fixed daylight in dark', () => {
  const cssText = css()
  assert.match(cssText, /max-width:\s*900px/)
  assert.match(cssText, /aspect-ratio:\s*3\s*\/\s*4/)
  assert.match(cssText, /prefers-reduced-motion:\s*reduce/)
  assert.match(cssText, /html\[dir="rtl"\]/)
  assert.match(cssText, /#26241e/)
  // Portrait volume re-seats to the nosing inside the mobile crop.
  const media = bareCss().match(/@media\s*\(max-width:\s*900px\)[\s\S]*$/)
  assert.ok(media, 'portrait block exists')
  assert.match(media[0], /\.r13-book[\s\S]*?bottom:\s*25\.3%/)
})

test('R13 kill budgets hold on disk: scene JS <=4KiB gzip, images <=180/320KiB', () => {
  const jsGzip = gzipSync(readFileSync(compPath)).length
  assert.ok(jsGzip <= 4 * 1024, `R13 scene JS gzip ${jsGzip}B <= 4KiB`)
  const mob = statSync(pub('a-r13-fore-768.webp')).size
  const desk = statSync(pub('a-r13-fore-1672.webp')).size
  assert.ok(mob <= 180 * 1024, `R13 mobile cutout ${mob}B <= 180KiB`)
  assert.ok(desk <= 320 * 1024, `R13 desktop cutout ${desk}B <= 320KiB`)
})
