import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const routePath = path.join(root, '../src/routes/$locale/cinematic-window-r14.tsx')
const compPath = path.join(root, '../src/components/home/CinematicWindowR14.tsx')
const cssPath = path.join(root, '../src/components/home/cinematic-window-r14.css')
const homePath = path.join(root, '../src/routes/$locale/index.tsx')
const genPath = path.join(root, '../scripts/generate-r14-assets.py')
const pub = (f) => path.join(root, '../public/responsive/site', f)
const sitePub = (f) => path.join(root, '../public/site', f)

// R7, R8, R9, R13 must be preserved unchanged by the R14 pass.
const preserved = [
  '../src/routes/$locale/cinematic-window.tsx',
  '../src/components/home/CinematicWindow.tsx',
  '../src/components/home/cinematic-window.css',
  '../src/routes/$locale/cinematic-window-r8.tsx',
  '../src/components/home/CinematicWindowR8.tsx',
  '../src/components/home/cinematic-window-r8.css',
  '../src/routes/$locale/cinematic-window-r9.tsx',
  '../src/components/home/CinematicWindowR9.tsx',
  '../src/components/home/cinematic-window-r9.css',
  '../src/routes/$locale/cinematic-window-r13.tsx',
  '../src/components/home/CinematicWindowR13.tsx',
  '../src/components/home/cinematic-window-r13.css',
]

const comp = () => readFileSync(compPath, 'utf8')
const css = () => readFileSync(cssPath, 'utf8')
const bareCss = () => css().replace(/\/\*[\s\S]*?\*\//g, '')
const bareComp = () => comp().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
const count = (hay, needle) => hay.split(needle).length - 1

test('R14 is isolated and preserves R7/R8/R9/R13 files', () => {
  assert.ok(existsSync(routePath), 'R14 route file exists')
  assert.ok(existsSync(compPath), 'R14 component file exists')
  assert.ok(existsSync(cssPath), 'R14 scoped css exists')
  assert.ok(existsSync(genPath), 'R14 asset generator exists')
  for (const rel of preserved) {
    assert.ok(existsSync(path.join(root, rel)), `preserved: ${rel}`)
  }
  // R14 reuses its own r14- namespace; no lab-slice class may leak into it
  // (the a-r14-plate / a-r14-fore asset names are the sanctioned exceptions).
  assert.doesNotMatch(bareComp(), /r7-(?!plate)/)
  assert.doesNotMatch(bareComp(), /r8-/)
  assert.doesNotMatch(bareComp(), /r9-/)
  assert.doesNotMatch(bareComp(), /r13-/)
  assert.doesNotMatch(bareCss(), /\.r7-(?!plate)/)
  assert.doesNotMatch(bareCss(), /\.r8-/)
  assert.doesNotMatch(bareCss(), /\.r9-/)
  assert.doesNotMatch(bareCss(), /\.r13-/)
})

test('R14 route is isolated with its own hreflang alternates', () => {
  const route = readFileSync(routePath, 'utf8')
  assert.match(route, /createFileRoute\('\/\$locale\/cinematic-window-r14'\)/)
  assert.match(route, /hreflangAlternates\('\/cinematic-window-r14'\)/)
  assert.match(route, /getBook\('sugar'\)/)
  assert.match(route, /CinematicWindowR14/)
  assert.match(route, /<main>/)
})

test('R14 is the homepage hero and the lab slices stay off the homepage', () => {
  const home = readFileSync(homePath, 'utf8')
  assert.match(home, /CinematicWindowR14/)
  assert.match(home, /getBook\('sugar'\)/)
  assert.doesNotMatch(home, /cinematic-window-r(7|8|9|13)/)
  assert.doesNotMatch(home, /from '~\/components\/home\/Hero'/)
})

test('R14 plate: responsive desktop + separately composed mobile sources', () => {
  // URLs are built by plate()/platem() helpers; assert the asset stems plus
  // the rendition width lists.
  assert.match(comp(), /\/responsive\/site\/a-r14-plate-\$\{w\}\.\$\{ext\}/)
  assert.match(comp(), /\/responsive\/site\/a-r14-platem-\$\{w\}\.\$\{ext\}/)
  assert.match(comp(), /plate\(768.*plate\(1280.*plate\(1536/s)
  assert.match(comp(), /platem\(480.*platem\(768.*platem\(941/s)
  assert.match(comp(), /type="image\/avif"/)
  assert.match(comp(), /type="image\/webp"/)
  assert.match(comp(), /media="\(max-width: 900px\)"/)
  assert.match(comp(), /alt=""/)
  assert.match(comp(), /aria-hidden/)
  assert.match(comp(), /aria-describedby/)
  // The plate is LCP: eager, high fetch priority, explicit dimensions.
  assert.match(comp(), /fetchPriority="high"/)
  assert.match(comp(), /loading="eager"/)
  assert.match(comp(), /width=\{PLATE_W\}/)
  // All renditions exist on disk; masters exist, are immutable input, and
  // differ in aspect (mobile is its own composition, not a crop).
  for (const f of [
    'a-r14-plate-768.webp', 'a-r14-plate-1280.webp', 'a-r14-plate-1536.webp',
    'a-r14-plate-768.avif', 'a-r14-plate-1280.avif', 'a-r14-plate-1536.avif',
    'a-r14-platem-480.webp', 'a-r14-platem-768.webp', 'a-r14-platem-941.webp',
    'a-r14-platem-480.avif', 'a-r14-platem-768.avif', 'a-r14-platem-941.avif',
    'a-r14-fore.webp', 'a-r14-forem.webp',
  ]) {
    assert.ok(existsSync(pub(f)), `rendition exists: ${f}`)
  }
  assert.ok(existsSync(sitePub('a-r14-master-desktop.png')), 'desktop master present')
  assert.ok(existsSync(sitePub('a-r14-master-mobile.png')), 'mobile master present')
})

test('R14 cover stays exact: true 2:3 face, no filter/tint/transform', () => {
  assert.match(comp(), /BookCover/)
  assert.match(comp(), /book=\{book\}/)
  const cssText = bareCss()
  assert.doesNotMatch(comp(), /grayscale\(1\)|hue-rotate|sepia\(|saturate\(/)
  assert.doesNotMatch(cssText, /grayscale\(|sepia\(|hue-rotate\(|saturate\(|brightness\(|invert\(|drop-shadow\(|mix-blend/)
  const faceRule = cssText.match(/\.r14-face\s*\{[^}]*\}/)
  assert.ok(faceRule, 'r14-face rule exists')
  assert.doesNotMatch(faceRule[0], /transform\s*:/)
  assert.doesNotMatch(faceRule[0], /filter\s*:/)
  const faceImgRule = cssText.match(/\.r14-face img\s*\{[^}]*\}/)
  assert.ok(faceImgRule, 'r14-face img rule exists')
  assert.doesNotMatch(faceImgRule[0], /transform\s*:/)
  assert.doesNotMatch(faceImgRule[0], /filter\s*:/)
  assert.match(cssText, /\.r14-face[\s\S]*?aspect-ratio:\s*2\s*\/\s*3/)
  assert.doesNotMatch(bareComp(), /scale\(|rotate\(|skew\(|perspective/)
  assert.doesNotMatch(cssText, /scale\(|rotate\(|skew\(|perspective/)
  assert.doesNotMatch(cssText, /scaleX\(-1\)/)
})

test('R14 shell registers flush: 1px overlap, physical right only, one shadow', () => {
  const cssText = bareCss()
  for (const cls of ['r14-shell', 'r14-board', 'r14-pages', 'r14-face', 'r14-contact']) {
    assert.match(comp(), new RegExp(cls))
    assert.match(css(), new RegExp('\\.' + cls))
  }
  assert.match(cssText, /\.r14-shell[\s\S]*?left:\s*calc\(100% - 1px\)/)
  assert.match(cssText, /--r14-edge:\s*clamp\(4px,\s*0\.6vw,\s*9px\)/)
  assert.doesNotMatch(cssText, /inline-start|inline-end/)
  assert.match(cssText, /direction:\s*ltr/)
  // Single shadow owner: exactly one box-shadow declaration (the cover
  // neutralization) and exactly one blur (the contact matte).
  assert.match(cssText, /\.r14-face img\s*\{[^}]*box-shadow:\s*none !important/)
  assert.equal(count(cssText, 'box-shadow'), 1, 'exactly one box-shadow declaration')
  assert.equal(count(cssText, 'blur('), 1, 'exactly one blur (the contact matte)')
  assert.equal(count(comp(), 'r14-contact'), 1, 'exactly one contact element')
  // No invented sill-lip line: the real nosing is the lip.
  assert.doesNotMatch(bareComp(), /r14-sill/)
  assert.doesNotMatch(cssText, /\.r14-sill/)
})

test('R14 seat geometry matches the reserved plate fractions', () => {
  const cssText = bareCss()
  assert.match(cssText, /\.r14-book[\s\S]*?left:\s*27%/)
  assert.match(cssText, /\.r14-book[\s\S]*?top:\s*31%/)
  assert.match(cssText, /\.r14-book[\s\S]*?height:\s*44%/)
})

test('R14 foreground band: one honest occluder per plate, registered box', () => {
  assert.equal(count(comp(), 'className="r14-fore'), 2, 'fore wrapper + fore img only')
  assert.match(comp(), /a-r14-fore\.webp/)
  assert.match(comp(), /a-r14-forem\.webp/)
  assert.match(comp(), /fetchPriority="low"/)
  assert.match(comp(), /decoding="async"/)
  assert.match(comp(), /draggable=\{false\}/)
  assert.match(bareCss(), /\.r14-fore[\s\S]*?pointer-events:\s*none/)
  // Desktop band box in plate fractions of 1536x1024: (380,720,760,800).
  assert.match(bareCss(), /\.r14-fore\s*\{[^}]*left:\s*24\.7396/)
  assert.match(bareCss(), /\.r14-fore\s*\{[^}]*top:\s*70\.31/)
  assert.match(bareCss(), /\.r14-fore\s*\{[^}]*width:\s*24\.7396/)
  const media = bareCss().match(/@media\s*\(max-width:\s*900px\)[\s\S]*$/)
  assert.ok(media, 'portrait block exists')
  // Mobile book stands left 8% (clear of the jamb); band box in plate
  // fractions of 941x1672: (45,1210,595,1280).
  assert.match(media[0], /\.r14-book\s*\{[^}]*left:\s*8%/)
  assert.match(media[0], /left:\s*4\.7821/)
  assert.match(media[0], /top:\s*72\.3684/)
  assert.match(media[0], /width:\s*58\.4485/)
  // Verbatim plate pixels: no image processing on the band either.
  const foreRule = bareCss().match(/\.r14-fore-img\s*\{[^}]*\}/)
  assert.ok(foreRule, 'r14-fore-img rule exists')
  assert.doesNotMatch(foreRule[0], /filter\s*:/)
  assert.doesNotMatch(foreRule[0], /transform\s*:/)
})

test('R14 SSR read link: one direct reading action, no JS required', () => {
  assert.match(comp(), /localePath\(locale, `\/books\/\$\{book\.slug\}\/read\/\$\{sample\?\.n \?\? 1\}`\)/)
  assert.match(comp(), /<Link className="r14-link" to=\{readHref\}>/)
  assert.equal(count(comp(), '<Link'), 1, 'exactly one action link')
  assert.match(comp(), /<h1 id="r14-title"[^>]*>\{book\.title\}<\/h1>/)
  // No card, no scrim, no pills, no progress chrome.
  assert.doesNotMatch(bareComp(), /card|scrim|pill|progress|spinner/i)
  assert.doesNotMatch(bareCss(), /card|scrim|pill|progress|spinner/i)
})

test('R14 is a true still: zero client JS, zero animation', () => {
  assert.doesNotMatch(bareComp(), /useEffect|useRef|useState|requestAnimationFrame|addEventListener|setInterval|setTimeout/)
  assert.doesNotMatch(comp(), /motion\/react|three|gsap|lenis/)
  const cssText = bareCss().replace(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*$/, '')
  assert.doesNotMatch(cssText, /@keyframes/)
  assert.doesNotMatch(cssText, /transition\s*:/)
  assert.doesNotMatch(cssText, /animation\s*:/)
  // The reduced-motion block pins the still contract explicitly.
  assert.match(bareCss(), /@media\s*\(prefers-reduced-motion:\s*reduce\)/)
})

test('R14 RTL: scene never mirrors, copy alignment only', () => {
  const cssText = bareCss()
  assert.match(cssText, /\.r14-stage\s*\{[^}]*direction:\s*ltr/)
  assert.match(cssText, /html\[dir="rtl"\] \.r14-copy/)
  assert.doesNotMatch(cssText, /scaleX\(-1\)/)
  assert.doesNotMatch(bareComp(), /dir=\{|direction:/)
})

test('R14 dark mode: daylight plate untouched, no fake night scene', () => {
  const cssText = bareCss()
  assert.doesNotMatch(cssText, /\[data-theme[^}]*\.r14-(plate|fore|face|book)/)
  assert.doesNotMatch(cssText, /\.dark[^}]*\.r14-(plate|fore|face|book)/)
  const plateRule = cssText.match(/\.r14-plate img\s*\{[^}]*\}/)
  assert.ok(plateRule, 'r14-plate img rule exists')
  assert.doesNotMatch(plateRule[0], /filter\s*:/)
  // Copy ink is fixed daylight plaster tone, not themed.
  assert.match(cssText, /\.r14-copy\s*\{[^}]*color:\s*#26241e/)
})
