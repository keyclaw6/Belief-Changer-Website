# R13 Result — Living Editorial Atlas: material continuity (Track B)

Branch: `experiment/living-editorial-atlas` · Work dir: `/tmp/bc-site-track-b` · Date: 2026-09-15
**Verdict: PASS** (all hard kill gates checked below; none tripped, nothing reverted).

## Question asked

Can physical staging alone — no new interface — make the R11 room feel like an
inhabited reading room and one real collection? R11's SAME-DOM-NODE shelf→desk
transfer (deterministic lift/carry/settle, keyboard/focus/ARIA aware, instant
reduced-motion cut) is kept verbatim; R13 is one physical-material CSS pass.

## Exact changes (5 new files, 0 modified files)

| File | What |
| ---- | ---- |
| `site/src/components/home/reading-room-r13.css` | The entire R13 pass. Static overrides over the R11 selectors: pose, thickness, light-true shadows, uneven occupancy. No keyframes/transitions/animations, no gradients, no images, no chrome. 2.11 kB (0.56 kB gzip). |
| `site/src/components/home/ReadingRoomR13.tsx` | 20-line wrapper rendering `<ReadingRoomR11>` verbatim + importing the R13 CSS after the R11 CSS. Owns no state/timers/refs. 531 B gzip. |
| `site/src/routes/$locale/reading-room-r13.tsx` | Isolated route (room only, hreflang, same 4-book collection). 804 B gzip. |
| `site/tests/reading-room-r13.test.mjs` | 8 contract tests (machine reuse, 3 KiB JS gate, no-motion, no-interface, feet-planted pose, desk geometry, paper thickness + handedness, route isolation). |
| `site/scripts/capture-r13.mjs` | R11 harness retargeted via `ROUTE`/`OUTDIR` env + LCP observer; mid-transfer measured before the screenshot so the in-flight instant is honest. |

Touched nothing else: `LivingLibrary.tsx` + `$locale/index.tsx` user modifications
preserved as found; R9/R10/R11 components, routes, CSS, tests unmodified;
`assets/covers/` + `site/public/site/reading-room-r9-*` plate pixels unmodified.
No commit/push/merge/publish/deploy.

## The material pass (detail)

- **Occupancy/pose:** slot lefts 41→40.5, 52.5→51.9, 64→64.2 (gaps 11.4/12.3,
  mobile 49.6/64.9/81.4). Lean + foreshorten on the INNER cover box only
  (`shelf-btn > div:first-child`, origin 50% 100%): −0.45°/0.982, +0.35°/1.008,
  −0.3°/0.992. Button, slot, bottoms, widths, hover lift, FLIP travel: R11-identical.
- **Thickness:** shelf fore-edge page block (physical right, dim stock `#e9e3d3`,
  2.6% wide, tucked top/bottom) + spine turn shade (physical left, 2.2%,
  rgba 0.34); desk gets a matching spine shade. Adjacent pseudo-elements only.
- **Light:** shelf contact + desk landing shadows re-cut toward the room (left,
  away from the plate's right-hand window): tight core under the feet, soft
  leftward falloff. Static fills; no filter/box-shadow animation.
- **Occlusion (assessed):** the plate's shelf is an open alcove — no shelf-line
  architectural occluder exists without inventing staging, so per the brief's
  "where the existing plate supports it" no fake pillar/beam was added. Honest
  occlusion is per-book self-occlusion (fore-edge behind face, spine over face).
- **Continuity:** desk geometry untouched (deskRatio 1.65 desktop, 1.98 mobile —
  identical to R11); same cover art travels; room plate never moves.

## Checks (all run, none partial)

- Unit tests: `npm run test` → **73/73 pass** (65 pre-existing + 8 new R13).
- Typecheck: `npm run typecheck` → clean. Build: `npm run build` → clean
  (r13 css 0.56 kB / js 0.29 kB gzip in bundle).
- Captures served from prod bridge (`scripts/serve-prod.mjs`, real bundle).

## Capture paths (AFTER = `r13-captures/`, BEFORE = `r11-captures/`)

- `r13-captures/r13-desktop-light.png` — rest, light 1440
- `r13-captures/r13-desktop-light-selected.png` — Sugar selected on desk
- `r13-captures/r13-desktop-light-mid-transfer.png` — in-flight (flying=1 at measure)
- `r13-captures/r13-mobile-390-light.png` (+ `r13-mobile-360-light.png`) — portrait crop, same physics, no card stack
- `r13-captures/r13-desktop-dark.png` — identical plate/staging, dark chrome only
- `r13-captures/r13-desktop-rtl-ar.png` — room unmirrored, read → `/ar/books/…`
- `r13-captures/r13-desktop-reduced-motion.png` — static rest state
- Extras: `r13-desktop-1024.png`, `r13-desktop-light-keyboard-focus.png`, `r13-desktop-light-rapid-end.png`

## Kill-gate scoreboard

| Gate | Result |
| ---- | ------ |
| Selected-cover duplication | PASS — rapid `noDup=true`, mid `flying=1`→after `0`, every title once in all shots |
| Same-node continuity lost | PASS — R11 component reused verbatim; wrapper owns no machine |
| Shelf still an evenly spaced toolbar (3 s glance) | PASS — uneven gaps + varied heights + page/spine thickness break the alignment read (self-assessed from AFTER vs BEFORE) |
| Selected reads as PDP/retail (2-of-3) | PASS (self-assessed) — no new hero treatment; deskRatio 1.65 = R11; same art moved closer; no price/CTA/card chrome |
| Contact shadow floats | PASS — cores touch feet in every shot; bottoms unchanged |
| Focus lost after selection | PASS — `focusKept=true`, rescued to `BUTTON` (newly shelved outgoing) |
| Reduced-motion animates | PASS — zero motion properties in R13 layer; R11 matchMedia instant cut shared |
| Registration error >1 px at resting contacts | PASS — slot bottoms/widths untouched; pose pivots at feet; feet on board in shots |
| Additional JS >3 KiB gzip | PASS — wrapper 531 B + route 804 B = **1335 B** |
| CLS >0.05 | PASS — **cls=0** |
| LCP >2.5 s or >200 ms regression | PASS — R13 desktop LCP **168 ms** vs R11 **164 ms** (+4 ms); all shots 52–168 ms |
| Console/page errors | PASS — 0 in all 10 contexts |

## BEFORE→AFTER comparison (vs `r11-captures/`)

Same room, same machine, same collection. AFTER differs only in: books sit at
slightly different heights/gaps with visible page fore-edges and spine turns;
shadows fall left into the room instead of pooling symmetrically; the desk book
is otherwise the identical object at the identical 1.65 scale step. Copy, Read
link (one activation from reading), plate, motion timings (647 ms ≤ 700),
focus behavior: unchanged.
