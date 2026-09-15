import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const routePath = path.join(root, '../src/routes/$locale/cinematic-window.tsx')
const compPath = path.join(root, '../src/components/home/CinematicWindow.tsx')
const cssPath = path.join(root, '../src/components/home/cinematic-window.css')
const samplePath = path.join(root, '../src/data/sample-chapters.ts')
const plate = (w, ext) => path.join(root, `../public/responsive/site/a-r7-plate-${w}.${ext}`)

test('cinematic-window R7 slice exists and stays isolated (not in production nav)', () => {
  assert.ok(existsSync(routePath), 'route file exists')
  assert.ok(existsSync(compPath), 'component file exists')
  assert.ok(existsSync(cssPath), 'scoped css exists')
  const home = readFileSync(path.join(root, '../src/routes/$locale/index.tsx'), 'utf8')
  assert.doesNotMatch(home, /cinematic-window/)
})

test('R7 stage is the approved photographic plate, decorative, optimized', () => {
  const comp = readFileSync(compPath, 'utf8')
  // AVIF primary, WebP fallback, responsive widths from the same master.
  assert.match(comp, /a-r7-plate-.*\.avif/)
  assert.match(comp, /a-r7-plate-.*\.webp/)
  assert.match(comp, /768w.*1280w.*1672w/)
  // Decorative semantics: the DOM owns all copy and links, nothing baked in.
  assert.match(comp, /alt=""/)
  assert.match(comp, /aria-hidden/)
  assert.match(comp, /aria-describedby/)
  // Optimized derivatives ship in the repo; the 2.2MB source PNG stays out.
  for (const w of [768, 1280, 1672]) {
    for (const ext of ['webp', 'avif']) {
      const p = plate(w, ext)
      assert.ok(existsSync(p), `plate derivative exists: ${p}`)
      assert.ok(statSync(p).size > 4000, `plate derivative non-trivial: ${p}`)
    }
  }
  assert.ok(statSync(plate(1672, 'webp')).size <= 300_000, 'desktop plate <=300KB guardrail')
  assert.ok(statSync(plate(1672, 'avif')).size <= 300_000, 'desktop plate avif <=300KB guardrail')
  assert.ok(statSync(plate(768, 'webp')).size <= 150_000, 'mobile plate <=150KB guardrail')
})

test('R7 uses the sugar book and real reading destinations with an unaltered cover', () => {
  const route = readFileSync(routePath, 'utf8')
  const comp = readFileSync(compPath, 'utf8')
  assert.match(route, /getBook\('sugar'\)/)
  assert.match(comp, /\/books\/\$\{book\.slug\}\/read\//)
  assert.match(comp, /BookCover/)
  // Cover art must not be altered: no tint/regrade filters or transforms on
  // the book assembly (the owned contact matte uses a tight blur only).
  assert.doesNotMatch(comp, /grayscale\(1\)|hue-rotate|sepia\(|saturate\(/)
  const css = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  assert.doesNotMatch(css, /grayscale\(|sepia\(|hue-rotate\(|saturate\(|brightness\(|invert\(|drop-shadow\(/)
  const bookRule = css.match(/\.r7-book\s*\{[^}]*\}/)
  assert.ok(bookRule, 'r7-book rule exists')
  assert.doesNotMatch(bookRule[0], /transform\s*:/)
  assert.doesNotMatch(bookRule[0], /filter\s*:/)
})

test('R7 H1 is the featured book title, not a slogan or kicker', () => {
  const comp = readFileSync(compPath, 'utf8')
  assert.match(comp, /<h1/)
  assert.match(comp, /\{book\.title\}/)
  assert.doesNotMatch(comp, /One room\. One open window\.|Et rum\. Et åbent vindue\.|غرفة واحدة/)
})

test('R7 retires the R6 synthetic world: photographic stage, no drift/parallax/sticky', () => {
  const comp = readFileSync(compPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
  const css = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  for (const retired of ['r6-', 'r5-', 'r4-', 'cw-progress', 'cw-state', 'cw-hint', 'cw-card', 'Browse library', 'aria-current', 'goToState', 'parallax', 'drift', 'sticky', 'useState', 'useEffect', 'useRef', 'requestAnimationFrame', 'translate3d', 'scrollIntoView', 'scrollTo']) {
    assert.ok(!comp.includes(retired) && !css.includes(retired), `retired: ${retired}`)
  }
  // No new dependency: the slice imports only router/data/i18n/cover/deployment.
  assert.doesNotMatch(comp, /from ['"]three['"]|from ['"]gsap|from ['"]lenis|from ['"]motion/i)
  const pkg = readFileSync(path.join(root, '../package.json'), 'utf8')
  assert.doesNotMatch(pkg, /gsap|lenis/)
})

test('R7 builds the still: full-bleed plate ratio, copy on plaster, book on sill', () => {
  const comp = readFileSync(compPath, 'utf8')
  const css = readFileSync(cssPath, 'utf8')
  const bareCss = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const bareComp = comp.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const cls of ['r7-stage', 'r7-plate', 'r7-copy', 'r7-title', 'r7-factual', 'r7-book', 'r7-contact', 'r7-examine']) {
    assert.match(comp, new RegExp(cls))
    assert.match(css, new RegExp('\\.' + cls))
  }
  // Stage keeps the plate's 1672:941 ratio full-bleed, no panel/card.
  assert.match(css, /aspect-ratio:\s*1672\s*\/\s*941/)
  assert.doesNotMatch(bareCss, /card|scrim|panel/)
  // Book stands structurally: absolute base at the backstop/sill junction, true
  // 2:3 aspect, owned contact matte, no floating machinery, no distortion.
  assert.match(bareCss, /\.r7-book[\s\S]*?aspect-ratio:\s*2\s*\/\s*3/)
  assert.doesNotMatch(bareComp, /drop-shadow/)
  assert.doesNotMatch(bareCss, /drop-shadow/)
  assert.doesNotMatch(bareCss, /radial-gradient/)
  assert.doesNotMatch(bareComp, /scale\(|rotate\(|skew\(|perspective/)
  assert.doesNotMatch(bareCss, /scale\(|rotate\(|skew\(|perspective/)
})

test('R7 examine action is native, immediate, and reveals a genuine passage', () => {
  const comp = readFileSync(compPath, 'utf8')
  // One explicit live-DOM action, available with zero JS.
  assert.match(comp, /<details/)
  assert.match(comp, /<summary/)
  assert.match(comp, /Examine a passage|Undersøg et uddrag|افحص مقطعا/)
  // The passage is the genuine repo sample, verbatim, not invented.
  assert.match(comp, /sample\?\.body.*slice\(0,\s*2\)/)
  const sample = readFileSync(samplePath, 'utf8')
  assert.match(sample, /Start with the moment itself/)
  // Source + qualification + the real sample-reading link beside the object.
  assert.match(comp, /r7-source/)
  assert.match(comp, /r7-qual/)
  assert.match(comp, /An excerpt, not a promise|Et uddrag, ikke et løfte|مقتطف وليس وعدا/)
  assert.match(comp, /Read the sample chapter|Læs uddraget|اقرأ الفصل الكامل/)
})

test('R7 makes no efficacy or transformation claims', () => {
  const comp = readFileSync(compPath, 'utf8')
  const hay = comp.toLowerCase()
  for (const banned of ['will change your life', 'transform your', 'before/after', 'before / after', 'testimonial', 'proven results', 'guaranteed', 'you will feel']) {
    assert.ok(!hay.includes(banned), `must not claim: ${banned}`)
  }
})

test('R7 keeps copy quiet: no CTA slab, pills, progress, labels, or scroll chrome', () => {
  const comp = readFileSync(compPath, 'utf8')
  const css = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  assert.doesNotMatch(comp, /<button/)
  for (const banned of ['r7-cta', 'pill', 'progress', 'scroll hint', 'Scroll to move', 'kicker', 'scene name', 'instruction']) {
    assert.ok(!comp.includes(banned) && !css.includes(banned), `banned: ${banned}`)
  }
})

test('R7 ships portrait composition, physical RTL, reduced-motion still, fixed daylight in dark', () => {
  const comp = readFileSync(compPath, 'utf8')
  const css = readFileSync(cssPath, 'utf8')
  // Dedicated portrait composition via crop/object-position, not shrunk desktop.
  assert.match(css, /max-width:\s*900px/)
  assert.match(css, /object-position:/)
  assert.match(css, /aspect-ratio:\s*3\s*\/\s*4/)
  assert.match(css, /prefers-reduced-motion:\s*reduce/)
  assert.match(css, /animation:\s*none/)
  // Physical camera: stage pinned ltr, text re-asserts rtl, never mirrored art.
  assert.match(css, /direction:\s*ltr/)
  assert.match(css, /html\[dir="rtl"\]/)
  assert.doesNotMatch(css, /scaleX\(-1\)/)
  // Same daylight world in dark: the plate and on-plate ink are fixed tones,
  // no regrade filters anywhere in the slice.
  assert.doesNotMatch(css, /brightness\(|invert\(|sepia\(|hue-rotate/)
  assert.doesNotMatch(comp, /ShelfStage/)
})
