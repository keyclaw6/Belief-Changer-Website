import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const tsx = readFileSync(new URL('../src/components/home/ReadingRoomR11.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/components/home/reading-room-r11.css', import.meta.url), 'utf8')
const route = readFileSync(new URL('../src/routes/$locale/reading-room-r11.tsx', import.meta.url), 'utf8')
const home = readFileSync(new URL('../src/routes/$locale/index.tsx', import.meta.url), 'utf8')
const r10tsx = readFileSync(new URL('../src/components/home/ReadingRoomR10.tsx', import.meta.url), 'utf8')
const r9tsx = readFileSync(new URL('../src/components/home/ReadingRoom.tsx', import.meta.url), 'utf8')

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
const tsxCode = strip(tsx)
const cssCode = strip(css)

test('R11 exports an isolated room stage with shelf-to-desk selection', () => {
  assert.match(tsx, /export function ReadingRoomR11/)
  assert.match(tsx, /selectedSlug/)
  assert.match(tsx, /useState/)
  assert.match(tsx, /reading-room-r11__stage/)
  assert.match(tsx, /key=\{selected\.slug\}/)
  assert.match(route, /ReadingRoomR11/)
  assert.match(route, /createFileRoute\('\/\$locale\/reading-room-r11'\)/)
})

test('R11: exactly one mechanism — deterministic lift/carry/settle phase machine with desired-target queue', () => {
  assert.match(tsx, /R11_LIFT_MS/)
  assert.match(tsx, /R11_CARRY_MS/)
  assert.match(tsx, /R11_SETTLE_MS/)
  assert.match(tsx, /R11_TOTAL_MS/)
  assert.match(tsx, /phase:\s*Phase/)
  assert.match(tsx, /'lift'/)
  assert.match(tsx, /'carry'/)
  assert.match(tsx, /'settle'/)
  // Desired-target queue: rapid selections record the latest desire, never overlap.
  assert.match(tsx, /pendingRef/)
  assert.match(tsx, /transferRef/)
  const lift = Number(tsx.match(/R11_LIFT_MS\s*=\s*(\d+)/)[1])
  const carry = Number(tsx.match(/R11_CARRY_MS\s*=\s*(\d+)/)[1])
  const settle = Number(tsx.match(/R11_SETTLE_MS\s*=\s*(\d+)/)[1])
  const total = lift + carry + settle
  assert.ok(total <= 700, `total click transfer must be <=700ms, found ${total}ms`)
  assert.equal(total, 600, `expected the 120+320+160=600ms budget, found ${total}ms`)
  // No bounce easing anywhere in the slice.
  assert.ok(!/ease-out-back|easeOutBack|cubic-bezier\([^)]*1\.5|spring|bounce/i.test(tsxCode), 'no bounce easing in tsx')
  assert.ok(!/bounce|spring/i.test(cssCode), 'no bounce/spring easing in css')
})

test('R11: one mounted node per title — the incoming shelf button flies, single-cut handoff, no clone/duplicate/placeholder', () => {
  for (const banned of ['vacant', 'Vacant', 'placeholder', 'dashed', 'empty-recess', 'skeleton', 'clone', 'Clone', 'duplicate']) {
    assert.ok(!tsxCode.includes(banned), `tsx must not contain ${banned}`)
    assert.ok(!cssCode.includes(banned), `css must not contain ${banned}`)
  }
  assert.ok(!/border:\s*1px dashed/i.test(cssCode), 'no dashed recess anywhere in the slice')
  assert.match(tsx, /books\.filter\(\(b\) => b\.slug !== selected\.slug\)\.slice\(0, 3\)/)
  assert.match(tsx, /reading-room-r11__shelf-btn/)
  // The travelling node is the incoming shelf button itself (FLIP via
  // data-flying), so focus never leaves its control and no second copy of
  // any title is ever mounted. Honest scope: at commit the flying button
  // unmounts and the desk node (keyed by slug) mounts the same title in one
  // cut — per-title single-mount continuity, not DOM-node migration.
  assert.match(tsx, /data-flying/)
  assert.match(tsx, /btnRefs/)
  const shelfBlock = tsx.slice(tsx.indexOf('<ul className="reading-room-r11__shelf"'), tsx.indexOf('</ul>'))
  assert.ok(shelfBlock.includes('BookCover'), 'shelf books render real covers')
  assert.ok(!shelfBlock.includes('selected'), 'shelf branch must not special-case the selected slug')
})

test('R11: transform/opacity only — no GSAP/Lenis/WebGL/video/new images/new deps, no filter/box-shadow animation', () => {
  for (const banned of [
    'parallax', 'Three', 'three', 'gsap', 'GSAP', 'Lenis', 'lenis', 'WebGL', 'webgl',
    '<video', '<canvas', 'autoPlay', '<Tabs', 'aria-expanded', 'role="tab"', 'toolbar', 'Toolbar',
  ]) {
    assert.ok(!tsxCode.includes(banned), `tsx code must not contain ${banned}`)
    assert.ok(!cssCode.includes(banned), `css code must not contain ${banned}`)
  }
  assert.ok(!/scroll-linked|background-attachment:\s*fixed/.test(cssCode), 'no scroll-linked camera tricks')
  assert.ok(!/@keyframes/.test(cssCode), 'motion via transitions only, no keyframes')
  const transitions = [...cssCode.matchAll(/transition\s*:[^;]+;/g)].map((m) => m[0])
  assert.ok(transitions.length > 0, 'expected transitions for the one mechanism')
  for (const t of transitions) {
    const props = t.replace(/cubic-bezier\([^)]*\)/g, '')
    assert.ok(!/box-shadow/.test(props), `never animate box-shadow, found: ${t}`)
    assert.ok(!/(?<!text-)filter/.test(props.replace(/filter:\s*blur\([^)]*\)/g, '')), `never animate filter, found: ${t}`)
    assert.ok(/transform|opacity|none/.test(t), `only transform/opacity transitions allowed, found: ${t}`)
  }
  assert.ok(!/assetPath\('\/site\/(?!reading-room-r9-)/.test(tsx), 'no new images: only the R9 plate set')
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
    assert.ok(ok, `unexpected import surface in R11 slice: ${spec}`)
  }
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
  for (const dep of ['gsap', 'lenis', '@use-gesture/root', 'framer-motion']) {
    assert.ok(!(dep in allDeps), `no new runtime dependency for R11 (found ${dep})`)
  }
})

test('R11: hover/focus lift <= 2px, calm ease only', () => {
  assert.ok(/translateY\(-2px\)/.test(cssCode), 'lift ceiling of 2px present')
  const lifts = [...cssCode.matchAll(/translateY\(-(\d+)px\)/g)].map((m) => Number(m[1]))
  assert.ok(lifts.length > 0, 'expected lift rules')
  for (const px of lifts) {
    // The 8px desk yield is a sink on the outgoing copy, not a hover lift;
    // hover/focus lifts are capped at 2px and asserted via selector below.
    if (px !== 8) assert.ok(px <= 2, `lift must be <=2px, found ${px}px`)
  }
  const hoverBlock = cssCode.match(/shelf-btn:not\(\[data-flying\]\):hover\s*\{([^}]*)\}/)
  assert.ok(hoverBlock && /translateY\(-2px\)/.test(hoverBlock[1]), 'hover lift is exactly -2px')
  assert.ok(/cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)/.test(cssCode), 'sanctioned calm ease')
})

test('R11: reduced motion instant-cuts to the R10-equivalent static state', () => {
  assert.match(tsx, /prefers-reduced-motion/)
  assert.match(tsx, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/)
  assert.match(css, /prefers-reduced-motion:\s*reduce/)
  assert.match(css, /transition:\s*none/)
  assert.match(css, /animation:\s*none/)
  // Static geometry parity with R10: same plate aspect, slots, desk, copy.
  for (const rule of [
    /aspect-ratio:\s*3\s*\/\s*2/,
    /max\(8\.5cqw,\s*90px\)/,
    /min\(14cqw/,
    /inline-size:\s*29%/,
    /perspective\(900px\) rotateY\(-5deg\)/,
  ]) {
    assert.ok(rule.test(cssCode), `R11 static geometry must match R10: ${rule}`)
  }
})

test('R11: native buttons/keyboard, visible focus, SR status, link retarget, focus rescue', () => {
  assert.match(tsx, /<button/)
  assert.match(tsx, /type="button"/)
  assert.match(tsx, /aria-label=\{book\.title\}/)
  assert.match(tsx, /role="status"/)
  assert.match(tsx, /reading-room-r11__srstatus/)
  assert.match(tsx, /focus\(\)/)
  assert.match(tsx, /document\.activeElement/)
  const readLinks = tsx.match(/\/read\/1/g) || []
  assert.equal(readLinks.length, 1, `exactly one Read chapter action, found ${readLinks.length}`)
  const copyAt = tsx.indexOf('reading-room-r11__copy')
  const readAt = tsx.indexOf('reading-room-r11__read')
  const shelfAt = tsx.indexOf('reading-room-r11__shelf')
  assert.ok(readAt > copyAt && readAt < shelfAt, 'Read link must sit with the in-room copy, not on the desk')
})

test('R11: room plate itself is the layout; no baked text, no card, no scrim', () => {
  assert.ok(!tsx.includes('bg-band'), 'no cream band class in the slice')
  assert.ok(!tsx.includes('bg-canvas'), 'no canvas band class in the slice')
  assert.ok(!/__wrap/.test(tsxCode), 'no wrapper element at all')
  assert.ok(!/linear-gradient/i.test(cssCode), 'no linear gradients')
  assert.ok(!/radial-gradient/i.test(cssCode), 'no radial gradients')
  assert.ok(!/backdrop-filter/i.test(cssCode), 'no glass scrim')
  assert.ok(!/9999px/.test(cssCode), 'no pill radius in slice')
  const stage = cssCode.match(/\.reading-room-r11__stage\s*\{([\s\S]*?)\}/)
  assert.ok(stage && /border-radius:\s*0/.test(stage[1]), 'room stays sharp, not a card')
  assert.match(tsx, /<h1 id="reading-room-r11-title"/)
})

test('R11: dark mode keeps the same plate; RTL camera-fixed, never mirrored', () => {
  assert.ok(!/prefers-color-scheme:\s*dark/.test(cssCode), 'no dark-mode photographic override')
  assert.ok(!/\[data-theme=['"]dark['"]\]/.test(cssCode), 'no dark-theme photographic override')
  assert.ok(cssCode.includes('#16130f'), 'fixed dark ink present for plaster contrast')
  assert.ok(!/scaleX\(\s*-1/.test(cssCode), 'cover/camera art must never be mirrored')
  assert.ok(/\.reading-room-r11__slot--1\s*\{[^}]*\bleft:/.test(cssCode), 'shelf slots use physical left registration')
  assert.ok(/\.reading-room-r11__deskbook\s*\{[^}]*\bleft:/.test(cssCode), 'desk book uses physical left registration')
})

test('R11: phone stays a portrait crop in the same world', () => {
  assert.match(css, /max-width:\s*640px/)
  const mobile = css.slice(css.indexOf('@media (max-width: 640px)'))
  assert.ok(/\.reading-room-r11__stage\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*5/.test(mobile), 'phone room is a portrait crop')
  assert.ok(/\.reading-room-r11__plate-img\s*\{[^}]*object-position:\s*(?!50% 50%)[^;}]+/.test(mobile), 'phone crop tunes object-position')
  assert.ok(!/grid-template-columns/.test(mobile), 'no stacked card grid anywhere on phone')
})

test('R11: editorial copy parity with R10, no prototype banner, three locales', () => {
  const copyBlock = tsx.slice(tsx.indexOf('const COPY'), tsx.indexOf('export function ReadingRoomR11'))
  assert.ok(!/TRACK B/i.test(copyBlock), 'no prototype banner in UI copy')
  assert.ok(!copyBlock.toLowerCase().includes('prototype'), 'no prototype language in UI copy')
  assert.ok(tsx.includes('Pick one up from the shelf'), 'missing en subhead parity')
  for (const s of ['Pick a book up, read a little', 'Tag en bog ned', 'تناول كتابا']) {
    assert.ok(tsx.includes(s), `missing editorial copy: ${s}`)
  }
})

test('R11 route is isolated: room only, no hero band, no other sections', () => {
  for (const banned of ['<Hero', '<TrustStrip', '<HomeBeats', '<LibrarySection', '<Marquee', '<LivingLibrary', 'bg-band', 'bg-canvas']) {
    assert.ok(!route.includes(banned), `route must not contain ${banned}`)
  }
  assert.match(route, /shelfBooks/)
  assert.match(route, /hreflangAlternates\('\/reading-room-r11'\)/)
})

test('R9/R10/R11 slices are preserved as files; homepage mounts R13 only', () => {
  assert.match(r9tsx, /export function ReadingRoom/)
  assert.match(r10tsx, /export function ReadingRoomR10/)
  assert.match(home, /ReadingRoomR13/)
  assert.ok(!home.includes('ReadingRoomR10'), 'R10 stays off the homepage')
  assert.ok(!home.includes('ReadingRoomR11 ') && !home.includes('ReadingRoomR11/'), 'R11 wrapper stays off the homepage (R13 owns the machine)')
  assert.ok(!home.includes('<ReadingRoom ') && !home.includes('<ReadingRoom/'), 'generic R9 insertion replaced by R13, not duplicated')
})

test('R11 incremental JS stays lean, no new runtime dependency', () => {
  const gz = gzipSync(Buffer.from(tsx, 'utf8')).length
  assert.ok(gz < 7 * 1024, `R11 component JS must stay under 7KB gzip, found ${gz}B`)
  console.log(`R11 tsx gzip=${gz}B`)
})
