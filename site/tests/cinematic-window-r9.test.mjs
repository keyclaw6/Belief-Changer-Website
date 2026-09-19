import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const routePath = path.join(root, '../src/routes/$locale/cinematic-window-r9.tsx')
const compPath = path.join(root, '../src/components/home/CinematicWindowR9.tsx')
const cssPath = path.join(root, '../src/components/home/cinematic-window-r9.css')

// R7 and R8 must be preserved unchanged by the R9 spike.
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

const comp = () => readFileSync(compPath, 'utf8')
const css = () => readFileSync(cssPath, 'utf8')
const bareCss = () => css().replace(/\/\*[\s\S]*?\*\//g, '')
const bareComp = () => comp().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
const count = (hay, needle) => hay.split(needle).length - 1

test('R9 spike is isolated and preserves R7/R8 unchanged', () => {
  assert.ok(existsSync(routePath), 'R9 route file exists')
  assert.ok(existsSync(compPath), 'R9 component file exists')
  assert.ok(existsSync(cssPath), 'R9 scoped css exists')
  for (const rel of [...r7files, ...r8files]) {
    assert.ok(existsSync(path.join(root, rel)), `preserved: ${rel}`)
  }
  const home = readFileSync(path.join(root, '../src/routes/$locale/index.tsx'), 'utf8')
  // R14 promoted the pattern to the homepage hero; lab slices stay off it.
  assert.doesNotMatch(home, /cinematic-window-r(7|8|9|13)/)
  // R9 reuses its own r9- namespace; no r7-/r8- class may leak into the spike
  // (the shared a-r7-plate asset name is the one sanctioned exception).
  assert.doesNotMatch(bareComp(), /r7-(?!plate)/)
  assert.doesNotMatch(bareComp(), /r8-/)
  assert.doesNotMatch(bareCss(), /\.r7-(?!plate)/)
  assert.doesNotMatch(bareCss(), /\.r8-/)
})

test('R9 route is isolated with its own hreflang alternates', () => {
  const route = readFileSync(routePath, 'utf8')
  assert.match(route, /createFileRoute\('\/\$locale\/cinematic-window-r9'\)/)
  assert.match(route, /hreflangAlternates\('\/cinematic-window-r9'\)/)
  assert.match(route, /getBook\('sugar'\)/)
  assert.match(route, /CinematicWindowR9/)
})

test('R9 reuses the approved R7 plate, decorative, no new plate asset', () => {
  assert.match(comp(), /a-r7-plate-.*\.avif/)
  assert.match(comp(), /a-r7-plate-.*\.webp/)
  assert.match(comp(), /768w.*1280w.*1672w/)
  assert.match(comp(), /alt=""/)
  assert.match(comp(), /aria-hidden/)
  assert.match(comp(), /aria-describedby/)
})

test('R9 cover stays exact: true 2:3 face, no filter/tint/transform on the cover node', () => {
  assert.match(comp(), /BookCover/)
  const cssText = bareCss()
  assert.doesNotMatch(comp(), /grayscale\(1\)|hue-rotate|sepia\(|saturate\(/)
  assert.doesNotMatch(cssText, /grayscale\(|sepia\(|hue-rotate\(|saturate\(|brightness\(|invert\(|drop-shadow\(|mix-blend/)
  const faceRule = cssText.match(/\.r9-face\s*\{[^}]*\}/)
  assert.ok(faceRule, 'r9-face rule exists')
  assert.doesNotMatch(faceRule[0], /transform\s*:/)
  assert.doesNotMatch(faceRule[0], /filter\s*:/)
  const faceImgRule = cssText.match(/\.r9-face img\s*\{[^}]*\}/)
  assert.ok(faceImgRule, 'r9-face img rule exists')
  assert.doesNotMatch(faceImgRule[0], /transform\s*:/)
  assert.doesNotMatch(faceImgRule[0], /filter\s*:/)
  assert.match(cssText, /\.r9-face[\s\S]*?aspect-ratio:\s*2\s*\/\s*3/)
  // No per-layer cover distortion anywhere in the slice.
  assert.doesNotMatch(bareComp(), /scale\(|rotate\(|skew\(|perspective/)
  assert.doesNotMatch(cssText, /scale\(|rotate\(|skew\(|perspective/)
})

test('R9 shell registers flush: 1px overlap (0px gap), physical right only', () => {
  const cssText = bareCss()
  for (const cls of ['r9-shell', 'r9-board', 'r9-pages', 'r9-face']) {
    assert.match(comp(), new RegExp(cls))
    assert.match(css(), new RegExp('\\.' + cls))
  }
  assert.match(cssText, /\.r9-shell[\s\S]*?left:\s*calc\(100% - 1px\)/)
  assert.match(cssText, /--r9-edge:\s*clamp\(4px,\s*0\.6vw,\s*9px\)/)
  assert.doesNotMatch(cssText, /inline-start|inline-end/)
  assert.match(cssText, /direction:\s*ltr/)
  assert.doesNotMatch(cssText, /scaleX\(-1\)/)
})

test('R9 has exactly one shadow owner and one sill occluder', () => {
  const cssText = bareCss()
  assert.match(cssText, /\.r9-face img\s*\{[^}]*box-shadow:\s*none !important/)
  assert.equal(count(cssText, 'box-shadow'), 1, 'exactly one box-shadow declaration (the neutralization)')
  assert.equal(count(comp(), 'r9-contact'), 1, 'exactly one contact element in the component')
  assert.equal(count(comp(), 'r9-sill'), 1, 'at most one sill occluder in the component')
  assert.equal(count(cssText, 'blur('), 1, 'exactly one blur (the contact matte)')
  assert.match(cssText, /\.r9-sill[\s\S]*?height:\s*2px/)
  assert.match(cssText, /\.r9-sill[\s\S]*?top:\s*calc\(100% - 1px\)/)
})

test('R9 copy sits in the safe plaster field: no scrim/card, clears the shadow band', () => {
  assert.match(comp(), /<h1/)
  assert.match(comp(), /\{book\.title\}/)
  assert.match(bareCss(), /left:\s*clamp\(150px,\s*15vw,\s*300px\)/)
  assert.doesNotMatch(bareCss(), /card|scrim|panel/)
  assert.doesNotMatch(bareCss(), /radial-gradient/)
})

test('R9 reading action is one ordinary link: no details gate, no button', () => {
  assert.doesNotMatch(bareComp(), /<details/)
  assert.doesNotMatch(bareComp(), /<summary/)
  assert.doesNotMatch(bareComp(), /<button/)
  assert.equal(count(bareComp(), '<Link'), 1, 'exactly one reading link')
  assert.match(comp(), /\/books\/\$\{book\.slug\}\/read\//)
  assert.match(comp(), /Read the sample chapter|Læs uddraget|اقرأ الفصل الكامل/)
  assert.doesNotMatch(bareCss(), /pill|progress/)
})

test('R9 shared camera: one rigid rig, single X axis, transform-only, no independent layers', () => {
  // One rig owns ALL motion: plate + copy + book ride it together.
  assert.equal(count(bareComp(), 'r9-rig'), 1, 'exactly one rig element in the component')
  assert.match(comp(), /r9-rig/)
  assert.match(css(), /\.r9-rig/)
  // The rig overscans the stage so drift never exposes an edge.
  assert.match(bareCss(), /\.r9-rig[\s\S]*?left:\s*-18px/)
  assert.match(bareCss(), /\.r9-rig[\s\S]*?right:\s*-18px/)
  // Drift ceiling: ±14px ≈ 1% of a 1440 stage, hard ceiling 3%.
  assert.match(comp(), /R9_DRIFT_MAX = 14/)
  assert.match(comp(), /R9_OVERSCAN = 18/)
  // Single axis: exactly one translate3d call, Y pinned to 0.
  assert.equal(count(bareComp(), 'translate3d'), 1, 'exactly one translate3d (the shared rig)')
  assert.match(comp(), /translate3d\(\$\{current\.toFixed\(2\)\}px, 0, 0\)/)
  // No second moving layer: no per-element parallax factors, no scroll
  // coupling, no gyro/device-orientation, no rotation/skew/perspective.
  for (const banned of ['parallax', 'depth', 'DeviceOrientation', 'DeviceMotion', 'gyroscop', 'AbsoluteOrientation', 'scrollY', 'scrollX', 'addEventListener(\'scroll\'', 'addEventListener("scroll"']) {
    assert.ok(!bareComp().includes(banned) && !bareCss().includes(banned), `banned: ${banned}`)
  }
  // Motion is pointermove-driven on the stage only, eased in rAF.
  assert.match(comp(), /pointermove/)
  assert.match(comp(), /requestAnimationFrame/)
  assert.doesNotMatch(bareCss(), /scale\(|rotate\(|skew\(|perspective/)
})

test('R9 motion is gated: fine-pointer + hover only, reduced-motion bails, no new deps', () => {
  assert.match(comp(), /hover: hover/)
  assert.match(comp(), /pointer: fine/)
  assert.match(comp(), /prefers-reduced-motion/)
  assert.match(bareCss(), /prefers-reduced-motion:\s*reduce/)
  assert.match(bareCss(), /animation:\s*none/)
  assert.doesNotMatch(comp(), /from ['"]three['"]|from ['"]gsap|from ['"]lenis|from ['"]motion/i)
  const pkg = readFileSync(path.join(root, '../package.json'), 'utf8')
  assert.doesNotMatch(pkg, /gsap|lenis/)
})

test('R9 ships portrait composition, physical RTL, reduced-motion still, fixed daylight in dark', () => {
  const cssText = css()
  assert.match(cssText, /max-width:\s*900px/)
  assert.match(cssText, /object-position:/)
  assert.match(cssText, /aspect-ratio:\s*3\s*\/\s*4/)
  assert.match(cssText, /prefers-reduced-motion:\s*reduce/)
  assert.match(cssText, /html\[dir="rtl"\]/)
  assert.match(cssText, /#26241e/)
})

test('R9 incremental payload stays under 40KB (plate and cover already loaded)', () => {
  const bytes = statSync(compPath).size + statSync(cssPath).size + statSync(routePath).size
  assert.ok(bytes < 40_000, `R9 new files ${bytes}B < 40KB`)
})
