import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const tsx = readFileSync(new URL('../src/components/home/ReadingRoomR13.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/components/home/reading-room-r13.css', import.meta.url), 'utf8')
const route = readFileSync(new URL('../src/routes/$locale/reading-room-r13.tsx', import.meta.url), 'utf8')
const home = readFileSync(new URL('../src/routes/$locale/index.tsx', import.meta.url), 'utf8')
const r11tsx = readFileSync(new URL('../src/components/home/ReadingRoomR11.tsx', import.meta.url), 'utf8')

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
const cssCode = strip(css)
const tsxCode = strip(tsx)

test('R13 reuses the R11 same-node machine: wrapper only, no second state machine', () => {
  assert.match(tsx, /export function ReadingRoomR13/)
  assert.match(tsx, /import \{ ReadingRoomR11 \} from '\.\/ReadingRoomR11'/)
  assert.match(tsx, /<ReadingRoomR11 locale=\{locale\} books=\{books\} \/>/)
  for (const banned of ['useState', 'useRef', 'setTimeout', 'requestAnimationFrame', 'pendingRef', 'transferRef', 'data-flying', 'R11_LIFT_MS', 'R11_CARRY_MS', 'R11_SETTLE_MS']) {
    assert.ok(!tsxCode.includes(banned), `R13 wrapper must not reimplement the machine (found ${banned})`)
  }
  // The machine itself is untouched: R11 still owns the one mechanism.
  assert.match(r11tsx, /export function ReadingRoomR11/)
  assert.match(r11tsx, /phase:\s*Phase/)
})

test('R13 additional JS stays under the 3 KiB gzip kill gate', () => {
  const gzTsx = gzipSync(Buffer.from(tsx, 'utf8')).length
  const gzRoute = gzipSync(Buffer.from(route, 'utf8')).length
  const total = gzTsx + gzRoute
  assert.ok(total < 3 * 1024, `R13 additional JS must stay under 3KiB gzip, found tsx=${gzTsx}B route=${gzRoute}B total=${total}B`)
  console.log(`R13 additional JS gzip: wrapper=${gzTsx}B route=${gzRoute}B total=${total}B`)
})

test('R13 CSS adds no motion: no keyframes/transitions/animations (R11 layer owns the one mechanism)', () => {
  assert.ok(!/@keyframes/.test(cssCode), 'no keyframes in the material layer')
  assert.ok(!/transition\s*:/.test(cssCode), 'no transitions in the material layer')
  assert.ok(!/animation\s*:/.test(cssCode), 'no animations in the material layer')
})

test('R13 CSS adds no interface: no chrome, gradients, scrims, pills, vacancies, timber labels, new images', () => {
  for (const banned of ['vacant', 'Vacant', 'placeholder', 'dashed', 'skeleton', 'clone', 'Clone', 'duplicate', 'Tabs', 'toolbar', 'Toolbar', 'progress', 'pill', 'dropdown', 'Dropdown', 'backdrop-filter', 'linear-gradient', 'radial-gradient', '9999px', '<video', '<canvas', 'gsap', 'lenis', 'Three', 'three', 'parallax']) {
    assert.ok(!cssCode.includes(banned), `r13 css must not contain ${banned}`)
  }
  assert.ok(!/border:\s*1px dashed/i.test(cssCode), 'no dashed recess anywhere')
  assert.ok(!/assetPath|url\(/.test(cssCode), 'no new images in the material layer')
})

test('R13 pose lives on the inner cover box (feet-planted), never on the travelling button or slot', () => {
  assert.ok(/transform-origin:\s*50% 100%/.test(cssCode), 'pose pivots at the feet')
  assert.ok(/shelf-btn\s*>\s*div:first-child/.test(cssCode), 'pose targets the inner cover box')
  // No transform on the button itself (FLIP travel + hover lift stay R11-pure)
  // and none on the slot (registration stays R11-pure).
  const btnPlain = [...cssCode.matchAll(/\.reading-room-r11__shelf-btn\s*\{([^}]*)\}/g)]
  for (const m of btnPlain) {
    assert.ok(!/transform\s*:/.test(m[1]), `never transform the travelling button, found: ${m[1].slice(0, 80)}`)
  }
  const slotPlain = [...cssCode.matchAll(/\.reading-room-r11__slot--\d\s*\{([^}]*)\}/g)]
  assert.ok(slotPlain.length > 0, 'expected per-slot occupancy overrides')
  for (const m of slotPlain) {
    assert.ok(!/transform\s*:/.test(m[1]) && !/bottom\s*:/.test(m[1]), `slots keep R11 feet registration, found: ${m[1].slice(0, 80)}`)
  }
  // In-plane lean stays sub-degree so resting contacts move <1px.
  const rotates = [...cssCode.matchAll(/rotate\(\s*(-?[\d.]+)deg\s*\)/g)].map((m) => Math.abs(Number(m[1])))
  assert.ok(rotates.length > 0, 'expected lean rotations')
  const inPlane = rotates.filter((v) => v < 10)
  for (const v of inPlane) assert.ok(v <= 0.5, `in-plane lean must stay <=0.5deg, found ${v}deg`)
})

test('R13 desk geometry untouched: scale continuity with the shelf traveller preserved', () => {
  const deskPlain = [...cssCode.matchAll(/\.reading-room-r11__deskbook\s*\{([^}]*)\}/g)]
  assert.equal(deskPlain.length, 0, 'never restyle the desk resting box itself (only ::before/::after)')
  assert.ok(!/inline-size/.test(cssCode) || /width:\s*1\.\d%/.test(cssCode), 'no resting-size changes in the material layer')
})

test('R13 thickness is adjacent paper matter, never cover pixels; handedness physical (RTL-safe)', () => {
  assert.ok(cssCode.includes('#e9e3d3'), 'fore-edge uses a dim page stock, never a bright tab')
  assert.ok(!/scaleX\(\s*-1/.test(cssCode), 'never mirror art or thickness')
  assert.ok(/shelf-btn::before/.test(cssCode), 'shelf fore-edge present')
  assert.ok(/shelf-btn::after/.test(cssCode), 'shelf spine shade present')
  assert.ok(/deskbook::before/.test(cssCode), 'desk spine shade present')
})

test('R13 route is isolated: room only, R13 stays off the homepage', () => {
  assert.match(route, /createFileRoute\('\/\$locale\/reading-room-r13'\)/)
  assert.match(route, /ReadingRoomR13/)
  assert.match(route, /hreflangAlternates\('\/reading-room-r13'\)/)
  for (const banned of ['<Hero', '<TrustStrip', '<HomeBeats', '<LibrarySection', '<Marquee', '<LivingLibrary', 'bg-band', 'bg-canvas']) {
    assert.ok(!route.includes(banned), `route must not contain ${banned}`)
  }
  assert.ok(!home.includes('ReadingRoomR13'), 'R13 stays off the homepage')
  assert.ok(!home.includes('ReadingRoomR11'), 'R11 stays off the homepage')
})
