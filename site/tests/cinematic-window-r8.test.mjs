import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const routePath = path.join(root, '../src/routes/$locale/cinematic-window-r8.tsx')
const compPath = path.join(root, '../src/components/home/CinematicWindowR8.tsx')
const cssPath = path.join(root, '../src/components/home/cinematic-window-r8.css')

// R7 must be preserved unchanged by the R8 spike.
const r7route = path.join(root, '../src/routes/$locale/cinematic-window.tsx')
const r7comp = path.join(root, '../src/components/home/CinematicWindow.tsx')
const r7css = path.join(root, '../src/components/home/cinematic-window.css')

const comp = () => readFileSync(compPath, 'utf8')
const css = () => readFileSync(cssPath, 'utf8')
const bareCss = () => css().replace(/\/\*[\s\S]*?\*\//g, '')
const bareComp = () => comp().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
const count = (hay, needle) => hay.split(needle).length - 1

test('R8 spike is isolated and preserves R7 unchanged', () => {
  assert.ok(existsSync(routePath), 'R8 route file exists')
  assert.ok(existsSync(compPath), 'R8 component file exists')
  assert.ok(existsSync(cssPath), 'R8 scoped css exists')
  for (const p of [r7route, r7comp, r7css]) assert.ok(existsSync(p), `R7 file preserved: ${p}`)
  const home = readFileSync(path.join(root, '../src/routes/$locale/index.tsx'), 'utf8')
  assert.doesNotMatch(home, /cinematic-window/)
  // R8 reuses its own r8- namespace; no r7- class may leak into the spike
  // (the shared a-r7-plate asset name is the one sanctioned exception).
  assert.doesNotMatch(bareComp(), /r7-(?!plate)/)
  assert.doesNotMatch(bareCss(), /\.r7-(?!plate)/)
})

test('R8 route is isolated with its own hreflang alternates', () => {
  const route = readFileSync(routePath, 'utf8')
  assert.match(route, /createFileRoute\('\/\$locale\/cinematic-window-r8'\)/)
  assert.match(route, /hreflangAlternates\('\/cinematic-window-r8'\)/)
  assert.match(route, /getBook\('sugar'\)/)
  assert.match(route, /CinematicWindowR8/)
})

test('R8 reuses the approved R7 plate, decorative, no new plate asset', () => {
  assert.match(comp(), /a-r7-plate-.*\.avif/)
  assert.match(comp(), /a-r7-plate-.*\.webp/)
  assert.match(comp(), /768w.*1280w.*1672w/)
  assert.match(comp(), /alt=""/)
  assert.match(comp(), /aria-hidden/)
  assert.match(comp(), /aria-describedby/)
})

test('R8 cover stays exact: true 2:3 face, no filter/tint/transform', () => {
  assert.match(comp(), /BookCover/)
  const cssText = bareCss()
  assert.doesNotMatch(comp(), /grayscale\(1\)|hue-rotate|sepia\(|saturate\(/)
  assert.doesNotMatch(cssText, /grayscale\(|sepia\(|hue-rotate\(|saturate\(|brightness\(|invert\(|drop-shadow\(|mix-blend/)
  const faceRule = cssText.match(/\.r8-face\s*\{[^}]*\}/)
  assert.ok(faceRule, 'r8-face rule exists')
  assert.doesNotMatch(faceRule[0], /transform\s*:/)
  assert.doesNotMatch(faceRule[0], /filter\s*:/)
  // Face keeps the true 2:3 aspect, exactly like the immutable cover.
  assert.match(cssText, /\.r8-face[\s\S]*?aspect-ratio:\s*2\s*\/\s*3/)
  assert.doesNotMatch(bareComp(), /scale\(|rotate\(|skew\(|perspective/)
  assert.doesNotMatch(cssText, /scale\(|rotate\(|skew\(|perspective/)
})

test('R8 shell registers flush: 1px overlap (0px gap), physical right only', () => {
  const cssText = bareCss()
  for (const cls of ['r8-shell', 'r8-board', 'r8-pages', 'r8-face']) {
    assert.match(comp(), new RegExp(cls))
    assert.match(css(), new RegExp('\\.' + cls))
  }
  // Overlap, never a gap: shell starts 1px under the face.
  assert.match(cssText, /\.r8-shell[\s\S]*?left:\s*calc\(100% - 1px\)/)
  // Edge budget: 8.6px at 1440 (visible 7.6), 4px at 390 (visible 3).
  assert.match(cssText, /--r8-edge:\s*clamp\(4px,\s*0\.6vw,\s*9px\)/)
  // Physical right (ltr-pinned stage), never a logical/mirrored edge.
  assert.doesNotMatch(cssText, /inline-start|inline-end/)
  assert.match(cssText, /direction:\s*ltr/)
  assert.doesNotMatch(cssText, /scaleX\(-1\)/)
})

test('R8 has exactly one shadow owner and one sill occluder', () => {
  const cssText = bareCss()
  // The component shadow is neutralized so the contact matte owns all shadow.
  assert.match(cssText, /\.r8-face img\s*\{[^}]*box-shadow:\s*none !important/)
  assert.equal(count(cssText, 'box-shadow'), 1, 'exactly one box-shadow declaration (the neutralization)')
  assert.equal(count(comp(), 'r8-contact'), 1, 'exactly one contact element in the component')
  assert.equal(count(comp(), 'r8-sill'), 1, 'at most one sill occluder in the component')
  // The tight blur lives only on the owned contact matte.
  assert.equal(count(cssText, 'blur('), 1, 'exactly one blur (the contact matte)')
  // Sill lip is 2px, overlapping the base by 1px.
  assert.match(cssText, /\.r8-sill[\s\S]*?height:\s*2px/)
  assert.match(cssText, /\.r8-sill[\s\S]*?top:\s*calc\(100% - 1px\)/)
})

test('R8 copy sits in the safe plaster field: no scrim/card, clears the shadow band', () => {
  assert.match(comp(), /<h1/)
  assert.match(comp(), /\{book\.title\}/)
  // Copy tracks right of the corner shadow band at every desktop width.
  assert.match(bareCss(), /left:\s*clamp\(150px,\s*15vw,\s*300px\)/)
  assert.doesNotMatch(bareCss(), /card|scrim|panel/)
  assert.doesNotMatch(bareCss(), /radial-gradient/)
})

test('R8 reading action is one ordinary link: no details gate, no button, no JS', () => {
  assert.doesNotMatch(bareComp(), /<details/)
  assert.doesNotMatch(bareComp(), /<summary/)
  assert.doesNotMatch(bareComp(), /<button/)
  assert.equal(count(bareComp(), '<Link'), 1, 'exactly one reading link')
  assert.match(comp(), /\/books\/\$\{book\.slug\}\/read\//)
  assert.match(comp(), /Read the sample chapter|Læs uddraget|اقرأ الفصل الكامل/)
  const cssText = bareCss()
  assert.doesNotMatch(cssText, /pill|progress/)
  for (const retired of ['parallax', 'drift', 'sticky', 'useState', 'useEffect', 'useRef', 'requestAnimationFrame', 'translate3d', 'scrollIntoView', 'scrollTo']) {
    assert.ok(!bareComp().includes(retired) && !cssText.includes(retired), `retired: ${retired}`)
  }
  assert.doesNotMatch(comp(), /from ['"]three['"]|from ['"]gsap|from ['"]lenis|from ['"]motion/i)
  const pkg = readFileSync(path.join(root, '../package.json'), 'utf8')
  assert.doesNotMatch(pkg, /gsap|lenis/)
})

test('R8 ships portrait composition, physical RTL, reduced-motion still, fixed daylight in dark', () => {
  const cssText = css()
  assert.match(cssText, /max-width:\s*900px/)
  assert.match(cssText, /object-position:/)
  assert.match(cssText, /aspect-ratio:\s*3\s*\/\s*4/)
  assert.match(cssText, /prefers-reduced-motion:\s*reduce/)
  assert.match(cssText, /animation:\s*none/)
  assert.match(cssText, /html\[dir="rtl"\]/)
  // Shell/support tones are fixed daylight values, never themed.
  assert.doesNotMatch(cssText, /var\(--color-.*\)\s*;?\s*\/\*.*shell/i)
  assert.match(cssText, /#26241e/)
})

test('R8 incremental payload stays under 40KB (plate and cover already loaded)', () => {
  const bytes = statSync(compPath).size + statSync(cssPath).size + statSync(routePath).size
  assert.ok(bytes < 40_000, `R8 new files ${bytes}B < 40KB`)
})
