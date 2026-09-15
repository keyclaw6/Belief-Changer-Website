import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const tsx = readFileSync(new URL('../src/components/home/ReadingRoom.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/components/home/reading-room.css', import.meta.url), 'utf8')
const home = readFileSync(new URL('../src/routes/$locale/index.tsx', import.meta.url), 'utf8')

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
const tsxCode = strip(tsx)
const cssCode = strip(css)

test('reading room exports one photographic alcove with shelf-to-desk selection', () => {
  assert.match(tsx, /export function ReadingRoom/)
  assert.match(tsx, /selectedSlug/)
  assert.match(tsx, /useState/)
  assert.match(tsx, /reading-room__alcove/)
  // The desk assembly swaps per selection with an instant cut (static baseline).
  assert.match(tsx, /key=\{selected\.slug\}/)
})

test('R9 STATIC baseline: instant cut, no animation, no transitions, no timed motion', () => {
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

test('R9: ash shelf holds other titles only, max three, never the selected one', () => {
  assert.match(tsx, /books\.filter\(\(b\) => b\.slug !== selected\.slug\)\.slice\(0, 3\)/)
  assert.match(tsx, /Single physical node rule|exactly one physical node|ONE.*visible cover/i)
})

test('R9: no vacancy placeholder, no dashed recess, no duplicate cover', () => {
  for (const banned of ['vacant', 'Vacant', 'placeholder', 'dashed', 'empty-recess', 'skeleton']) {
    assert.ok(!tsxCode.includes(banned), `tsx must not contain ${banned}`)
    assert.ok(!cssCode.includes(banned), `css must not contain ${banned}`)
  }
  assert.ok(!/border:\s*1px dashed/i.test(cssCode), 'no dashed recess anywhere in the slice')
  assert.match(tsx, /reading-room__shelf-btn/)
  const shelfBlock = tsx.slice(tsx.indexOf('<ul className="reading-room__shelf"'), tsx.indexOf('</ul>'))
  assert.ok(shelfBlock.includes('BookCover'), 'shelf books render real covers')
  assert.ok(!shelfBlock.includes('selected'), 'shelf branch must not special-case the selected slug')
})

test('R9: photographic plate wired as decorative AVIF/WebP, 1:1 desktop frame', () => {
  assert.match(tsx, /reading-room__plate/)
  assert.match(tsx, /type="image\/avif"/)
  assert.match(tsx, /type="image\/webp"/)
  assert.match(tsx, /reading-room-r9-960\.avif/)
  assert.match(tsx, /reading-room-r9-1536\.avif/)
  assert.match(tsx, /reading-room-r9-960\.webp/)
  assert.match(tsx, /reading-room-r9-1536\.webp/)
  assert.match(tsx, /assetPath\('\/site\/reading-room-r9-/)
  // Decorative: empty alt + hidden from AT, eager LCP with intrinsic size.
  assert.match(tsx, /alt=""/)
  assert.match(tsx, /aria-hidden="true"/)
  assert.match(tsx, /fetchPriority="high"/)
  assert.match(tsx, /width=\{1536\}\s*\n?\s*height=\{1024\}/)
  // No synthetic CSS room materials remain.
  for (const dead of ['--rr-wall', '--rr-return', '--rr-daylight', '--rr-ash-face', '--rr-desk', 'reading-room__return', 'reading-room__wall', 'reading-room__ledge', 'reading-room__stage', 'reading-room__bookrest']) {
    assert.ok(!tsxCode.includes(dead), `tsx must not contain R8 synthetic layer ${dead}`)
    assert.ok(!cssCode.includes(dead), `css must not contain R8 synthetic layer ${dead}`)
  }
  const alcove = cssCode.match(/\.reading-room__alcove\s*\{([\s\S]*?)\}/)
  assert.ok(alcove && /aspect-ratio:\s*3\s*\/\s*2/.test(alcove[1]), 'desktop alcove renders the plate 1:1')
  assert.ok(alcove && /min-block-size:\s*max\(50vh/.test(alcove[1]), 'desktop room must be >=50vh tall')
})

test('R9: plate derivatives exist on disk within byte budget', () => {
  let total = 0
  for (const f of ['reading-room-r9-960.avif', 'reading-room-r9-960.webp', 'reading-room-r9-1536.avif', 'reading-room-r9-1536.webp']) {
    const st = statSync(resolve(here, '../public/site', f))
    assert.ok(st.size > 4096, `${f} must be a real derivative`)
    total += st.size
  }
  assert.ok(total < 250 * 1024, `plate delivery set must stay lean, found ${total}B`)
})

test('R9: no enclosing rounded container, no tabs, dropdowns, glass, gradients', () => {
  for (const banned of [
    'reading-room__tabs',
    'reading-room__tab',
    'reading-room__desktext',
    'reading-room__actions-menu',
    'aria-expanded',
    'CaretDown',
    'btnPrimary',
    'btnSecondary',
  ]) {
    assert.ok(!tsx.includes(banned), `tsx must not contain ${banned}`)
    assert.ok(!css.includes(banned), `css must not contain ${banned}`)
  }
  assert.ok(!/linear-gradient/i.test(cssCode), 'no linear gradients')
  assert.ok(!/radial-gradient/i.test(cssCode), 'no radial gradients')
  assert.ok(!/repeating-gradient/i.test(cssCode), 'no repeating gradients')
  assert.ok(!/backdrop-filter/i.test(cssCode), 'no glass')
  assert.ok(!/9999px/.test(cssCode), 'no pill radius in slice')
  const alcove = cssCode.match(/\.reading-room__alcove\s*\{([\s\S]*?)\}/)
  assert.ok(alcove && /border-radius:\s*0/.test(alcove[1]), 'room stays sharp, not a card')
  assert.ok(alcove && !/border:/.test(alcove[1]), 'alcove carries no border/frame')
  assert.ok(alcove && !/box-shadow/.test(alcove[1]), 'alcove carries no container shadow')
})

test('R9: credible scale, support, contact outside cover faces', () => {
  // Shelf slots registered with physical coordinates; desk book seated once.
  assert.match(css, /\.reading-room__slot--1/)
  assert.match(css, /\.reading-room__slot--2/)
  assert.match(css, /\.reading-room__slot--3/)
  assert.match(css, /\.reading-room__deskbook::after/)
  const contact = cssCode.match(/\.reading-room__deskbook::after\s*\{([\s\S]*?)\}/)
  assert.ok(contact && /box-shadow:[\s\S]*?,[\s\S]*?;/.test(contact[1]), 'contact must layer a tight core plus a soft falloff')
  assert.ok(/perspective\(/.test(cssCode), 'bound book seats with a small static perspective')
  assert.ok(/rotateY\(/.test(cssCode), 'bound book seats with a small rotateY')
  assert.match(css, /\.reading-room__edge/)
  const desk = cssCode.match(/\.reading-room__deskbook\s*\{([\s\S]*?)\}/)
  assert.ok(desk && /inline-size:\s*14cqw/.test(desk[1]), 'desk book must carry a definite container-relative size')
})

test('R9: exactly one Read action adjacent to editorial copy, never on decoration', () => {
  const readLinks = tsx.match(/\/read\/1/g) || []
  assert.equal(readLinks.length, 1, `exactly one Read chapter action, found ${readLinks.length}`)
  assert.match(tsx, /inkLink/)
  assert.match(tsx, /reading-room__actions/)
  const actionsAt = tsx.indexOf('reading-room__actions')
  const alcoveAt = tsx.indexOf('reading-room__alcove')
  assert.ok(actionsAt !== -1 && actionsAt < alcoveAt, 'Read action must sit with the copy, before the room')
  const readAt = tsx.indexOf('reading-room__read')
  assert.ok(readAt > actionsAt && readAt < alcoveAt, 'Read link must be adjacent to copy, not on the desk')
  assert.match(tsx, /role="status"/)
  assert.match(tsx, /type-mono-meta/)
  const marg = cssCode.match(/\.reading-room__marginalia\s*\{([\s\S]*?)\}/)
  assert.ok(marg && !/background|border/.test(marg[1]), 'marginalia must be unboxed')
  assert.match(tsx, /reading-room__marginalia-facts/)
  assert.match(css, /\.reading-room__marginalia-facts\s*\{[^}]*min-block-size:\s*2lh/)
})

test('R9: plate and covers immutable, dark mode never touches the photograph', () => {
  assert.match(tsx, /import \{ BookCover \} from '~\/components\/BookCover'/)
  const plateImg = cssCode.match(/\.reading-room__plate-img\s*\{([\s\S]*?)\}/)
  assert.ok(plateImg, 'expected a plate-img rule')
  assert.ok(!/filter/.test(plateImg[1]), 'plate must never be filtered or re-lit')
  assert.ok(!/prefers-color-scheme:\s*dark/.test(cssCode), 'no dark-mode photographic override')
  assert.ok(!/\[data-theme=['"]dark['"]\]/.test(cssCode), 'no dark-theme photographic override')
  assert.match(tsx, /text-ink-secondary/)
  assert.match(tsx, /text-ink/)
  assert.match(css, /var\(--color-focus\)/)
  const blocks = cssCode.split('}')
  for (const block of blocks) {
    const [selector] = block.split('{')
    if (/book-face|deskbook|standing|edge/.test(selector || '')) {
      assert.ok(!/object-fit/i.test(block), `cover selector must not size art: ${(selector || '').trim()}`)
    }
  }
  assert.ok(!/filter\s*:\s*(?!blur)/.test(cssCode.replace(/filter:\s*blur\([^;]+\);?/g, '')), 'covers must never be re-lit/tinted (blur allowed only on shadows)')
})

test('R9: RTL camera-fixed, photograph and covers never mirrored', () => {
  assert.match(tsx, /camera-fixed/)
  assert.ok(!/scaleX\(\s*-1/.test(cssCode), 'cover/camera art must never be mirrored')
  assert.ok(!/scaleX\(\s*-1/.test(tsxCode), 'no mirrored art in markup')
  // Slots register with physical coordinates: the photograph does not flip.
  assert.ok(/\.reading-room__slot--1\s*\{[^}]*\bleft:/.test(cssCode), 'shelf slots use physical left registration')
  assert.ok(/\.reading-room__deskbook\s*\{[^}]*\bleft:/.test(cssCode), 'desk book uses physical left registration')
})

test('R9: phone is a deliberate portrait crop of the same master', () => {
  assert.match(css, /max-width:\s*640px/)
  const mobile = css.slice(css.indexOf('@media (max-width: 640px)'))
  assert.ok(/\.reading-room__alcove\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*5/.test(mobile), 'phone room is a portrait crop')
  assert.ok(/\.reading-room__plate-img\s*\{[^}]*object-position:\s*(?!50% 50%)[^;}]+/.test(mobile), 'phone crop tunes object-position')
  assert.ok(/\.reading-room__slot--1\s*\{[^}]*left:/.test(mobile), 'shelf slots re-register to the visible window')
  assert.ok(/\.reading-room__deskbook\s*\{[^}]*inline-size:\s*30cqw/.test(mobile), 'desk book stays one object on the plane, never a stacked card')
  assert.ok(!/grid-template-columns/.test(mobile), 'no stacked card grid anywhere on phone')
})

test('R9: editorial copy, no prototype banner, subhead <= 20 words', () => {
  const copyBlock = tsx.slice(tsx.indexOf('const COPY'), tsx.indexOf('export function ReadingRoom'))
  assert.ok(!/TRACK B/i.test(copyBlock), 'no prototype banner in UI copy')
  assert.ok(!copyBlock.toLowerCase().includes('prototype'), 'no prototype language in UI copy')
  assert.ok(tsx.includes('One rests on the desk'), 'missing R9 en subhead')
  const body = 'Four small books about everyday habits. One rests on the desk; the first chapter is open.'
  assert.ok(body.split(/\s+/).length <= 20, 'subhead must be <= 20 words')
  for (const s of ['Pick a book up, read a little', 'Tag en bog ned', 'تناول كتابا']) {
    assert.ok(tsx.includes(s), `missing editorial copy: ${s}`)
  }
})

test('no efficacy claims in slice copy', () => {
  const banned = ['willpower', 'relief', 'escape', 'guarantee', 'proven', 'heal', 'sacrifice', 'triumph', 'luxury']
  const copyBlock = tsx.slice(tsx.indexOf('const COPY'), tsx.indexOf('export function ReadingRoom')).toLowerCase()
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

test('homepage still mounts the slice after the trust strip', () => {
  assert.match(home, /ReadingRoom/)
  const trustAt = home.indexOf('<TrustStrip')
  const roomAt = home.indexOf('<ReadingRoom')
  const beatsAt = home.indexOf('<HomeBeats')
  assert.ok(trustAt !== -1 && roomAt > trustAt && beatsAt > roomAt, 'order: Hero, TrustStrip, ReadingRoom, HomeBeats')
})
