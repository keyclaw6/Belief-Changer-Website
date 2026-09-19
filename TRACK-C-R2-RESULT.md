# Track C R2 — authored world result: PROMOTE

Date: 2026-09-19. Worktree: `/tmp/bc-site-track-c` ONLY (isolated experimental
worktree). No merge or deploy was made, and no other worktree was touched. The
final experiment branch is intended to be committed and pushed for review.
E2e side effects under `docs/qa-final/` were reverted.

## What was built

The final Track C homepage Orbit now inhabits a physically authored world. The
real Orbit interaction, reader, live SDF type, localization, SSR fallback,
cover pixels, demand scheduling, and book mechanics are untouched; the
environment is part of the actual homepage path (default on), not a lab toggle.

- **Genuine plates, four of them** (`site/public/orbit/env/`, immutable, see
  `docs/experiments/2026-09-15-three-track/C-R2-IMAGE-PROVENANCE.md`): desktop
  day, desktop night, mobile day (portrait), mobile night (portrait, arrived
  before finalization — no dim stand-in anywhere). R1's temporary proof plate
  was deleted. Pure-CSS plate dimming was removed.
- **Support-plane fit**: the plates were authored around the Orbit geometry
  (stone dais under the ring, calm sky reserved for the headline, blurred
  foreground parapet at the bottom). The ring keeps its exact camera and poses
  (front-cover bbox drift exactly 0 vs baseline); the dais is aligned under it
  with `object-position` per breakpoint (50% 45% desktop, 50% 38% mobile).
- **One grounding mechanism** (`daisAnchor` in `orbit.js`): a single warm
  analytic contact ellipse parented to the ring group. No shadow maps, no
  per-frame cost beyond one quad. Existing contact pool + per-book footprints
  unchanged.
- **Lighting match**: the day plate's key is a warm afternoon sun from the
  left, which is where the studio key already sits — direction kept, only key
  (0xffffff → 0xfff1de) and fill (→ 0xdfe9f4 cool sky bounce) temperatures
  shift, light+env mode only, intensities untouched. Dark keeps the exact
  single-lamp path (stationary-lamp e2e contract still passes unmodified).
- **Foreground occlusion leaf**: the SAME plate file rendered a second time
  above the canvas (z2, below all copy/chrome), clipped to its bottom strip,
  so the plate's genuine blurred parapet passes in front of the nearest book
  bases. Zero WebGL calls, zero new pixels.
- **env=0 baseline/diagnostic preserved**: `?env=0` (standalone or homepage)
  restores the atmosphere pass + neutral light with zero env bytes. ShelfStage
  forwards the default (on) and bakes `&env=0` into the iframe URL for the
  diagnostic so no plate byte is ever fetched there.
- **RTL**: physical scene/ring unmirrored; logical text/control placement only
  (verified Arabic capture). **Reduced motion**: static plate composition, no
  autoplay, StaticShelf fallback byte/behavior compatible (verified).
- **Live DOM copy only**: no baked UI/text in any plate; headline, caption,
  and controls are the existing live DOM.

## Exact files changed

Modified (4):

- `site/public/orbit/index.html`: `#env-plate` (genuine plates, per-breakpoint
  alignment, night-plate rule replaces the R1 dim) + new `#env-foreground`
  occlusion leaf (same-file bottom strip, z2, pointer-transparent).
- `site/public/orbit/orbit.js`: env default-on (`?env=0` forces baseline),
  responsive day/mobile/night asset selection incl. genuine night-mobile,
  warm-key/cool-fill match (light+env only), one `daisAnchor` quad (env only),
  `__ORBIT.envSrc` + `__orbitPerf.scene.{env,asset}` QA surface.
- `site/src/components/ShelfStage.tsx`: homepage defaults to the authored
  environment; `?env=0` is baked into the iframe URL (zero-byte diagnostic).
- (incidental, reverted after validation: two `docs/qa-final/` e2e side
  effects, restored/removed.)

Added (5 + captures):

- `site/public/orbit/env-select.js`: pure plate-selection/default module.
- `site/tests/env-select.test.mjs`: 3 unit tests (desktop/day-night, mobile
  incl. genuine night-mobile, default-on/?env=0).
- `site/scripts/check-env-r2.mjs`: parity + readability + budget gates.
- `site/scripts/capture-env-r2.mjs`: 15-shot env0/R2 matrix (standalone +
  homepage, day/night, 1440/1024/390/360, Arabic RTL, reduced motion,
  fallback) with errors/draws/bytes/LCP/CLS per shot.
- `docs/experiments/2026-09-15-three-track/C-R2-IMAGE-PROVENANCE.md`.
- `r2-captures/` (15 matrix PNGs + `parity-env0/1.png` pair +
  `r2-home-390-env0-check.png` pre-existing-issue diagnostic +
  `parity-report.json` + `capture-matrix.json`).

To fully revert: `git checkout -- site/public/orbit/index.html
site/public/orbit/orbit.js site/src/components/ShelfStage.tsx` and delete
`site/public/orbit/env-select.js`, the four R2 plates, the two scripts, the
unit test, `r2-captures/`, and the two R2 docs.

## Measured results (not claimed — measured)

- **Cover parity** (desktop 1440x900 light, boot slot, foreground leaf hidden
  for the gate so it isolates 3D rendering + lighting): interior 118x175
  (20,650 px) — **meanAbs 2.956, maxAbs 9, fracOver2 0.594, bbox drift 0**,
  luminance 214.29 → 211.58 (readable, near-white cover preserved). Gate
  thresholds (6.0 / 16 / 0.75 / 1.0px) admit the intended warm tint with ~2x
  margin: **PASS all 8 gates** (`node scripts/check-env-r2.mjs` exits 0).
- **Draw calls**: env0 **61 / 450,404** vs R2 **61 / 450,404** (Δ0 ≤ +1 budget:
  atmosphere quad skipped, `daisAnchor` added). Night 58 / 450,240; mobile day
  61 / 315,284; mobile night 58 / 315,168. Triangles Δ0 in every mode.
- **Bytes**: day-desktop 2,461,037; day-mobile 2,157,486; night-desktop
  2,213,935; night-mobile 1,994,776 (single response each). env0 transfers
  **zero** env bytes on both standalone (`?env=0`) and homepage (`/en?env=0`,
  verified after baking the param into the iframe URL).
- **LCP/CLS** (homepage `/en`, synthetic swiftshader rig, early-observer
  method): LCP env0 **140ms** vs env **72ms** (both ≪ 2.5s; no regression —
  the LCP element is the identical SSR headline); CLS **0** both (< 0.05).
  The first measurement attempt read LCP as -1 (late observation); the
  early-observer rerun produced the numbers above.
- **Errors**: zero console/page errors in all 15 matrix shots and both parity
  runs.
- **Unit/type/build**: 12/12 unit (9 existing + 3 new), typecheck clean,
  build clean.
- **E2e Orbit contracts**: 24/24 pass — hero-composition (2),
  repair-contracts (4), landing-contract (1), refinement (7, incl. the
  stationary dark-lamp and phone-Arabic tests), experience (7, incl. dark
  readability), accessibility (3).

## Visual observations (looked at every capture)

- Desktop 1440 light: the ring stands ON the dais at first glance — near-book
  bases land on stone with contact darkening, far arc recedes against
  sky/treeline, featured cover crisp, headline and caption legible on calm
  zones. The R1 "sticker on a photo" reading is gone.
- Desktop 1024 light: same grounding at the tighter fit; featured base tucks
  behind the parapet strip (depth, not clipping).
- Night (desktop + genuine mobile night): lamp-lit near books on the lit dais,
  far arc falls into silhouette per the existing gallery-night contract;
  headline over stars, caption legible. No muddy dim anywhere.
- Mobile 390/360 day: separately authored portrait plate, ring and copy
  recomposed for it; grounded, legible.
- Arabic RTL: scene unmirrored, live Arabic headline, caption bottom-right —
  identical composition to LTR otherwise.
- Reduced motion (standalone) + homepage fallback: static, readable, no
  autoplay; fallback transfers zero env bytes and renders the static shelf.
- Homepage default (`/en`): nav + SSR headline + inhabited Orbit as one calm
  world; `/en?env=0` restores the mineral-void baseline byte-identical in
  layout.
- Known pre-existing (NOT R2, identical in env0 — verified with a paired
  `/en?env=0` mobile capture): on the short mobile homepage hero the caption
  crowds the featured book's imprint zone. Geometry is untouched (drift 0),
  so this is out of R2 scope and intentionally not repaired here.
- Standalone wordmark over dark foliage (top-left) is lower-contrast than on
  the void; standalone-only chrome, documented, not repaired (homepage hides
  it; DESIGN forbids shadow treatments as a back door).

## Implementation repairs used: 0 of 1

No visual-integration repair was needed. Disclosed separately: one
tooling-damage repair before any capture — the file-edit tool reported a
false-negative write that truncated `site/public/orbit/index.html` mid-script
(boot hung with no error); the tail was restored byte-exact and every later
edit was verified by read-back. Nothing of that incident remains in the tree.

## Verdict: PROMOTE

Both R1 kill conditions are resolved and every R2 gate passes: the ring no
longer floats (support plane + contact + matched light + foreground depth),
copy contrast is preserved in all modes, added draw calls are 0 vs env0
(budget +1), cover readability/parity is gated and green, CLS is 0, LCP shows
no regression, and there are no new console errors. The homepage defaults to
the final authored environment with an explicit zero-byte env=0 diagnostic.
Ready for review on the experiment branch; do not merge or deploy from this result note.
