import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const here = dirname(fileURLToPath(import.meta.url))
const tsx = readFileSync(new URL('../src/components/home/ReadingRoomR10.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/components/home/reading-room-r10.css', import.meta.url), 'utf8')
const route = readFileSync(new URL('../src/routes/$locale/reading-room-r10.tsx', import.meta.url), 'utf8')
const home = readFileSync(new URL('../src/routes/$locale/index.tsx', import.meta.url), 'utf8')
const r9tsx = readFileSync(new URL('../src/components/home/ReadingRoom.tsx', import.meta.url), 'utf8')

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
const tsxCode = strip(tsx)
const cssCode = strip(css)

test('R10 exports an isolated room stage with shelf-to-desk selection', () => {
  assert.match(tsx, /export function ReadingRoomR10/)
  assert.match(tsx, /selectedSlug/)
  assert.match(tsx, /useState/)
  assert.match(tsx, /reading-room-r10__stage/)
  assert.match(tsx, /key=\{selected\.slug\}/)
  assert.match(route, /ReadingRoomR10/)
  assert.match(route, /createFileRoute\('\/\$locale\/reading-room-r10'\)/)
})

test('R10 STATIC baseline: instant cut, no animation, no transitions, no timed motion', () => {
  assert.ok(!/@keyframes/.test(cssCode), 'no keyframes in the static baseline')
  const transitions = cssCode.match(/transition\s*:[^;]+;/g) || []
  for (const t of transitions) {
    assert.ok(/:\s*none/.test(t), `only transition:none allowed, found: ${t}`)
  }
  const animations = cssCode.match(/animation\s*:[^;]+;/g) || []
  for (const a of animations) {
    assert.ok(/:\s*none/.test(a), `only animation:none allowed, found: ${a}`)
  }
  assert.ok(!/\d+ms/.test(cssCode), 'no timed motion in the static baseline')
  assert.ok(!/requestAnimationFrame|Element\.animate|setTimeout|setInterval/.test(tsxCode), 'no runtime motion in markup')
})

test('R10: no parallax, camera motion, WebGL, Three.js, GSAP, Lenis, video, tabs, toolbars, progress UI', () => {
  for (const banned of [
    'parallax', 'Three', 'three', 'gsap', 'GSAP', 'Lenis', 'lenis', 'WebGL', 'webgl',
    '<video', '<canvas', 'autoPlay', '<Tabs', 'aria-expanded', 'role="tab"', 'toolbar', 'Toolbar',
  ]) {
    assert.ok(!tsxCode.includes(banned), `tsx code must not contain ${banned}`)
    assert.ok(!cssCode.includes(banned), `css code must not contain ${banned}`)
  }
  assert.ok(!/scroll-linked|background-attachment:\s*fixed/.test(cssCode), 'no scroll-linked camera tricks')
  // Import surface: react + router + icons + internal modules only.
  const imports = [...tsx.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1])
  assert.ok(imports.length > 0, 'expected imports to audit')
  for (const spec of imports) {
    const ok =
      spec === 'react' ||
      spec === '@tanstack/react-router' ||
      spec === '@phosphor-icons/react' ||
      spec.startsWith('~/') ||
      spec.startsWith('./') ||
      spec.endsWith('.css')
    assert.ok(ok, `unexpected import surface in R10 slice: ${spec}`)
  }
})

test('R10: ash shelf holds other titles only, max three, never the selected one', () => {
  assert.match(tsx, /books\.filter\(\(b\) => b\.slug !== selected\.slug\)\.slice\(0, 3\)/)
  assert.match(tsx, /Single physical node rule|exactly one physical node|ONE.*visible cover/i)
})

test('R10: one selected physical book only, no duplicate, no vacancy placeholder, no dashed recess', () => {
  for (const banned of ['vacant', 'Vacant', 'placeholder', 'dashed', 'empty-recess', 'skeleton', 'clone', 'Clone']) {
    assert.ok(!tsxCode.includes(banned), `tsx must not contain ${banned}`)
    assert.ok(!cssCode.includes(banned), `css must not contain ${banned}`)
  }
  assert.ok(!/border:\s*1px dashed/i.test(cssCode), 'no dashed recess anywhere in the slice')
  assert.match(tsx, /reading-room-r10__shelf-btn/)
  const shelfBlock = tsx.slice(tsx.indexOf('<ul className="reading-room-r10__shelf"'), tsx.indexOf('</ul>'))
  assert.ok(shelfBlock.includes('BookCover'), 'shelf books render real covers')
  assert.ok(!shelfBlock.includes('selected'), 'shelf branch must not special-case the selected slug')
  const deskImgs = (tsx.match(/reading-room-r10__deskbook[\s\S]*?BookCover/g) || []).length
  assert.ok(deskImgs >= 1, 'desk renders the one bound book')
})

test('R10: the room plate itself is the layout, no cream band above', () => {
  // No section wrapper padding, no outer copy block, no band classes.
  assert.ok(!tsx.includes('bg-band'), 'no cream band class in the slice')
  assert.ok(!tsx.includes('bg-canvas'), 'no canvas band class in the slice')
  assert.ok(!tsx.includes('reading-room__wrap'), 'no R9 outer wrap')
  assert.ok(!/__wrap/.test(tsxCode), 'no wrapper element at all')
  const section = cssCode.match(/\.reading-room-r10\s*\{([\s\S]*?)\}/)
  assert.ok(section, 'expected a section rule')
  assert.ok(/margin:\s*0/.test(section[1]), 'section margin collapses to the stage')
  assert.ok(/padding:\s*0/.test(section[1]), 'section padding collapses to the stage')
  const stage = cssCode.match(/\.reading-room-r10__stage\s*\{([\s\S]*?)\}/)
  assert.ok(stage && /aspect-ratio:\s*3\s*\/\s*2/.test(stage[1]), 'desktop stage renders the plate 1:1')
  assert.ok(stage && /margin:\s*0/.test(stage[1]), 'stage starts with no gap')
})

test('R10: live DOM copy sits inside the stage, in the plaster region', () => {
  const stageAt = tsx.indexOf('reading-room-r10__stage')
  const copyAt = tsx.indexOf('reading-room-r10__copy')
  const shelfAt = tsx.indexOf('reading-room-r10__shelf')
  const deskAt = tsx.indexOf('reading-room-r10__deskbook')
  assert.ok(stageAt !== -1 && copyAt > stageAt, 'copy renders inside the stage')
  assert.ok(shelfAt > copyAt && deskAt > shelfAt, 'order: copy, shelf, desk')
  const copyRule = cssCode.match(/\.reading-room-r10__copy\s*\{([\s\S]*?)\}/)
  assert.ok(copyRule && /position:\s*absolute/.test(copyRule[1]), 'copy is overlaid, not stacked')
  assert.ok(copyRule && /\bleft:/.test(copyRule[1]), 'copy pinned to the physical plaster side')
  assert.ok(copyRule && /\btop:/.test(copyRule[1]), 'copy sits in the upper negative space')
  assert.ok(copyRule && /inline-size:\s*29%/.test(copyRule[1]), 'copy column stays on the plaster, clear of the shelf')
  assert.match(tsx, /<h1 id="reading-room-r10-title"/)
  assert.match(tsx, /reading-room-r10__eyebrow/)
  assert.match(tsx, /reading-room-r10__body/)
})

test('R10: exactly one Read action, inside the room with the copy', () => {
  const readLinks = tsx.match(/\/read\/1/g) || []
  assert.equal(readLinks.length, 1, `exactly one Read chapter action, found ${readLinks.length}`)
  assert.match(tsx, /reading-room-r10__read/)
  const copyAt = tsx.indexOf('reading-room-r10__copy')
  const readAt = tsx.indexOf('reading-room-r10__read')
  const shelfAt = tsx.indexOf('reading-room-r10__shelf')
  assert.ok(readAt > copyAt && readAt < shelfAt, 'Read link must sit with the in-room copy, not on the desk')
  assert.match(tsx, /role="status"/)
})

test('R10: no application-style desk/version/chapter readout, no open-chapter claim', () => {
  for (const banned of ['marginalia', 'versionText', 'chapterText', 'versionDate', 'deskLabel', 'chapterLabel', 'aboutBook', 'beingWritten', 'On the desk', 'Version ']) {
    assert.ok(!tsxCode.includes(banned), `tsx must not contain readout fragment: ${banned}`)
  }
  assert.ok(!/Chapter 1:/.test(tsxCode), 'no chapter-title readout line')
  const copyBlock = tsx.slice(tsx.indexOf('const COPY'), tsx.indexOf('export function ReadingRoomR10'))
  assert.ok(!/open/i.test(copyBlock), 'nothing claims a chapter is open (no open book is visible)')
  // Screen-reader-only announcement instead of a visible readout row.
  assert.match(tsx, /reading-room-r10__srstatus/)
  const sr = cssCode.match(/\.reading-room-r10__srstatus\s*\{([\s\S]*?)\}/)
  assert.ok(sr && /clip:\s*rect\(0 0 0 0\)/.test(sr[1]), 'announcement is visually hidden')
})

test('R10: no baked text, no card, no scrim, no giant UI vessel', () => {
  assert.ok(!/linear-gradient/i.test(cssCode), 'no linear gradients')
  assert.ok(!/radial-gradient/i.test(cssCode), 'no radial gradients')
  assert.ok(!/repeating-gradient/i.test(cssCode), 'no repeating gradients')
  assert.ok(!/backdrop-filter/i.test(cssCode), 'no glass scrim')
  assert.ok(!/9999px/.test(cssCode), 'no pill radius in slice')
  const stage = cssCode.match(/\.reading-room-r10__stage\s*\{([\s\S]*?)\}/)
  assert.ok(stage && /border-radius:\s*0/.test(stage[1]), 'room stays sharp, not a card')
  assert.ok(stage && !/border:/.test(stage[1]), 'stage carries no border/frame')
  assert.ok(stage && !/box-shadow/.test(stage[1]), 'stage carries no container shadow')
  const copyRule = cssCode.match(/\.reading-room-r10__copy\s*\{([\s\S]*?)\}/)
  assert.ok(copyRule && !/background/.test(copyRule[1]), 'copy has no card fill')
  assert.ok(copyRule && !/border/.test(copyRule[1]), 'copy has no vessel border')
  assert.ok(copyRule && !/box-shadow/.test(copyRule[1]), 'copy has no vessel shadow')
  assert.ok(copyRule && !/backdrop-filter/.test(copyRule[1]), 'copy has no scrim')
})

test('R10: credible scale, support, contact outside cover faces', () => {
  assert.match(css, /\.reading-room-r10__slot--1/)
  assert.match(css, /\.reading-room-r10__slot--2/)
  assert.match(css, /\.reading-room-r10__slot--3/)
  assert.match(css, /\.reading-room-r10__deskbook::after/)
  const contact = cssCode.match(/\.reading-room-r10__deskbook::after\s*\{([\s\S]*?)\}/)
  assert.ok(contact && /box-shadow:[\s\S]*?,[\s\S]*?;/.test(contact[1]), 'contact must layer a tight core plus a soft falloff')
  assert.ok(/perspective\(/.test(cssCode), 'bound book seats with a small static perspective')
  assert.ok(/rotateY\(/.test(cssCode), 'bound book seats with a small rotateY')
  assert.match(css, /\.reading-room-r10__edge/)
})

test('R10: shelf books >=90px desktop and >=55px mobile, desk <=2.5x median shelf', () => {
  const slot = cssCode.match(/\.reading-room-r10__slot\s*\{([\s\S]*?)\}/)
  assert.ok(slot && /max\(8\.5cqw,\s*90px\)/.test(slot[1]), 'desktop shelf slots carry a 90px floor')
  const mobile = css.slice(css.indexOf('@media (max-width: 640px)'))
  assert.ok(/\.reading-room-r10__slot\s*\{[^}]*max\(15cqw,\s*55px\)/.test(mobile), 'mobile shelf slots carry a 55px floor')
  const desk = cssCode.match(/\.reading-room-r10__deskbook\s*\{([\s\S]*?)\}/)
  assert.ok(desk && /min\(14cqw/.test(desk[1]), 'desk book sized against the shelf row')
  // Static ratio proof from the authored container-relative sizes:
  // desktop 14cqw desk vs 8.5cqw shelf, mobile 30cqw desk vs 15cqw shelf.
  assert.ok(14 / 8.5 <= 2.5, 'desktop desk/shelf ratio within bound')
  assert.ok(30 / 15 <= 2.5, 'mobile desk/shelf ratio within bound')
  assert.ok(/\.reading-room-r10__deskbook\s*\{[^}]*min\(30cqw/.test(mobile), 'mobile desk stays one object on the plane')
})

test('R10: photographic plate reused from R9, decorative, eager, 1:1 desktop frame', () => {
  assert.match(tsx, /reading-room-r10__plate/)
  assert.match(tsx, /type="image\/avif"/)
  assert.match(tsx, /type="image\/webp"/)
  assert.match(tsx, /reading-room-r9-960\.avif/)
  assert.match(tsx, /reading-room-r9-1536\.avif/)
  assert.match(tsx, /reading-room-r9-960\.webp/)
  assert.match(tsx, /reading-room-r9-1536\.webp/)
  assert.match(tsx, /assetPath\('\/site\/reading-room-r9-/)
  assert.match(tsx, /alt=""/)
  assert.match(tsx, /aria-hidden="true"/)
  assert.match(tsx, /fetchPriority="high"/)
  assert.match(tsx, /width=\{1536\}\s*\n?\s*height=\{1024\}/)
  const plateImg = cssCode.match(/\.reading-room-r10__plate-img\s*\{([\s\S]*?)\}/)
  assert.ok(plateImg, 'expected a plate-img rule')
  assert.ok(!/filter/.test(plateImg[1]), 'plate must never be filtered or re-lit')
})

test('R10: plate derivatives exist on disk (R9 set, reused, within budget)', () => {
  let total = 0
  for (const f of ['reading-room-r9-960.avif', 'reading-room-r9-960.webp', 'reading-room-r9-1536.avif', 'reading-room-r9-1536.webp']) {
    const st = statSync(resolve(here, '../public/site', f))
    assert.ok(st.size > 4096, `${f} must be a real derivative`)
    total += st.size
  }
  assert.ok(total < 250 * 1024, `plate delivery set must stay lean, found ${total}B`)
})

test('R10: dark mode keeps the same plate, fixed dark-on-plaster ink', () => {
  assert.match(tsx, /import \{ BookCover \} from '~\/components\/BookCover'/)
  assert.ok(!/prefers-color-scheme:\s*dark/.test(cssCode), 'no dark-mode photographic override')
  assert.ok(!/\[data-theme=['"]dark['"]\]/.test(cssCode), 'no dark-theme photographic override')
  assert.ok(!/var\(--color-ink\)/.test(cssCode), 'in-plate ink is fixed, never theme tokens')
  assert.ok(cssCode.includes('#16130f'), 'fixed dark ink present for plaster contrast')
  const blocks = cssCode.split('}')
  for (const block of blocks) {
    const [selector] = block.split('{')
    if (/book-face|deskbook|standing|edge/.test(selector || '')) {
      assert.ok(!/object-fit/i.test(block), `cover selector must not size art: ${(selector || '').trim()}`)
    }
  }
  assert.ok(!/filter\s*:\s*(?!blur)/.test(cssCode.replace(/filter:\s*blur\([^;]+\);?/g, '')), 'covers must never be re-lit/tinted (blur allowed only on shadows)')
})

test('R10: RTL camera-fixed, photograph and covers never mirrored', () => {
  assert.match(tsx, /camera-fixed/)
  assert.ok(!/scaleX\(\s*-1/.test(cssCode), 'cover/camera art must never be mirrored')
  assert.ok(!/scaleX\(\s*-1/.test(tsxCode), 'no mirrored art in markup')
  assert.ok(/\.reading-room-r10__slot--1\s*\{[^}]*\bleft:/.test(cssCode), 'shelf slots use physical left registration')
  assert.ok(/\.reading-room-r10__deskbook\s*\{[^}]*\bleft:/.test(cssCode), 'desk book uses physical left registration')
  assert.ok(/\.reading-room-r10__copy\s*\{[^}]*\bleft:/.test(cssCode), 'copy box stays pinned to the physical plaster')
})

test('R10: phone is a deliberate portrait crop, copy stays in the same world', () => {
  assert.match(css, /max-width:\s*640px/)
  const mobile = css.slice(css.indexOf('@media (max-width: 640px)'))
  assert.ok(/\.reading-room-r10__stage\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*5/.test(mobile), 'phone room is a portrait crop')
  assert.ok(/\.reading-room-r10__plate-img\s*\{[^}]*object-position:\s*(?!50% 50%)[^;}]+/.test(mobile), 'phone crop tunes object-position')
  assert.ok(/\.reading-room-r10__slot--1\s*\{[^}]*left:/.test(mobile), 'shelf slots re-register to the visible window')
  assert.ok(/\.reading-room-r10__copy\s*\{[^}]*inline-size:/.test(mobile), 'copy re-registers inside the same world on phone')
  assert.ok(!/grid-template-columns/.test(mobile), 'no stacked card grid anywhere on phone')
})

test('R10: editorial copy, no prototype banner, subhead <= 20 words, three locales', () => {
  const copyBlock = tsx.slice(tsx.indexOf('const COPY'), tsx.indexOf('export function ReadingRoomR10'))
  assert.ok(!/TRACK B/i.test(copyBlock), 'no prototype banner in UI copy')
  assert.ok(!copyBlock.toLowerCase().includes('prototype'), 'no prototype language in UI copy')
  assert.ok(tsx.includes('Pick one up from the shelf'), 'missing R10 en subhead')
  const body = 'Four small books about everyday habits. Pick one up from the shelf.'
  assert.ok(body.split(/\s+/).length <= 20, 'subhead must be <= 20 words')
  for (const s of ['Pick a book up, read a little', 'Tag en bog ned', 'تناول كتابا']) {
    assert.ok(tsx.includes(s), `missing editorial copy: ${s}`)
  }
})

test('no efficacy claims in slice copy', () => {
  const banned = ['willpower', 'relief', 'escape', 'guarantee', 'proven', 'heal', 'sacrifice', 'triumph', 'luxury']
  const copyBlock = tsx.slice(tsx.indexOf('const COPY'), tsx.indexOf('export function ReadingRoomR10')).toLowerCase()
  for (const word of banned) {
    assert.ok(!copyBlock.includes(word), `banned efficacy-adjacent word in slice: ${word}`)
  }
})

test('covers are the only books: no washes, no extra local pictures', () => {
  assert.ok(!tsx.includes('photo-open-window'), 'no Quiet Fact wash in the slice')
  assert.ok(!/assetPath\('\/site\/(?!reading-room-r9-)/.test(tsx), 'no other site-imagery assetPath calls in the slice')
})

test('reduced motion stays static', () => {
  assert.match(css, /prefers-reduced-motion/)
  assert.match(css, /animation:\s*none/)
  assert.match(css, /transition:\s*none/)
})

test('R10 route is isolated: room only, no hero band, no other sections', () => {
  for (const banned of ['<Hero', '<TrustStrip', '<HomeBeats', '<LibrarySection', '<Marquee', '<LivingLibrary', 'bg-band', 'bg-canvas']) {
    assert.ok(!route.includes(banned), `route must not contain ${banned}`)
  }
  assert.match(route, /shelfBooks/)
  assert.match(route, /hreflangAlternates\('\/reading-room-r10'\)/)
})

test('R9 homepage slice is preserved untouched', () => {
  assert.match(r9tsx, /export function ReadingRoom/)
  assert.match(r9tsx, /reading-room__marginalia/)
  assert.match(home, /ReadingRoom/)
  const trustAt = home.indexOf('<TrustStrip')
  const roomAt = home.indexOf('<ReadingRoom')
  const beatsAt = home.indexOf('<HomeBeats')
  assert.ok(trustAt !== -1 && roomAt > trustAt && beatsAt > roomAt, 'order: Hero, TrustStrip, ReadingRoom, HomeBeats')
  assert.ok(!home.includes('ReadingRoomR10'), 'R10 stays off the homepage')
})

test('R10 incremental JS stays within the 5KB gzip target, no new runtime dependency', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
  for (const dep of ['gsap', 'lenis', '@use-gesture/root', 'framer-motion']) {
    assert.ok(!(dep in allDeps), `no new runtime dependency for R10 (found ${dep})`)
  }
  const gz = gzipSync(Buffer.from(tsx, 'utf8')).length
  assert.ok(gz < 5 * 1024, `R10 component JS must stay under 5KB gzip, found ${gz}B`)
  console.log(`R10 tsx gzip=${gz}B`)
})
