# Inspection/ — Orbit Optimization Session

**Scope:** front-page 3D book orbit (`site/public/orbit/` working copy). All changes
live only in this directory (`Inspection/orbit/` is the modified working copy;
`Inspection/frames/`, screenshots in `/tmp/opencode/` are evidence). Nothing was
committed to git; nothing outside `Inspection/` was modified.

**Baseline:** `site/public/orbit/` at commit `3ecdc20` (newer than `hero-orbit/`:
self-hosted three.module.js, analytic-bounds camera fit, boot instrumentation).

---

## Verified-broken at baseline (with screenshot evidence)

1. **Reader title was a floating smear.** `createReaderBook` never applied the
   title group's board transform (`rotation.x = π/2`, `position.set(boardW/2,
   -0.028, 0)`) — unlike `createClosedBook`. The SDF text sat unrotated at the
   hinge, smeared across the scene, drawn over everything (`depthTest=false`).
2. **Cover titles sat in the bottom half, mirrored order.** The y mapping was
   `yCanvas·s − ph/2` (canvas grows downward) — inverted. Gold parity is
   `Y(fy) = ph/2 − fy·ph` (`book-asset/products/00-template-reader.html`).
3. **"BELIEF CHANGER" appeared twice** on every cover (author line = series mark).
4. **Titles bled through the closed book** — `t.material.depthTest = false` +
   renderOrder 6 drew cover text through boards from behind.
5. **Open spread clipped the viewport** ("not in frame") — the inspect framing
   fit the closed book; the opened cover reached ~25 world units further left.
6. **Mobile was unusable** — whole-ring fit at aspect 0.44 miniaturized the ring
   (books ~15 px); inspect mode clipped the book on three sides.
7. **Browsing showed no book information** — the editorial panel only exists in
   inspect mode; turning the ring gave no title/promise.
8. **Pages showed repeated filler** ("Chapter 1 / The craving wears the mask of
   need…" ×7) and page 0 (title page) content was wasted by the leaf mapping.
9. **Open/return hitches of 380–560 ms** — reader `rebind` disposed the SHARED
   cached cover texture (forcing full GPU re-upload on next use), and every
   open rebuilt the 11-page atlas + re-typeset troika strings even for the
   same book.
10. **Truncated promises** rendered as mid-word ellipses ("…feel like reli…").

## Fixes applied (all in `Inspection/orbit/`)

### book-engine.js
- Reader title group now receives the closed-book board transform.
- Title y mapping flipped to gold parity (`ph/2 − yCanvas·s`).
- Author line skipped when it duplicates the series mark (builder + rebind +
  canvas fallback).
- Troika text: `depthTest=true` + gold's `depthOffset=-6` (no more bleed-through).
- Cover title switched to site canon: **Newsreader 400 at 15.5 cqw**, lineHeight
  1.06, tracking −0.005 em, series mark DM Sans 3.4 cqw tracked 0.34 em at 0.85
  opacity (`site/src/components/BookCover.tsx` parity). New serif font:
  `vendor/fonts/newsreader-400-normal-latin.ttf` (converted from the site's
  woff2 — troika's Typr parser cannot read WOFF2).
- `disposeCoverTexture()` guard — cached cover textures are never disposed by
  reader rebind/dispose (kills GPU re-upload churn).
- Page atlas: body 26 px, darker inks (#221e19 title, #1e1a15 body), anisotropy
  16, DPR cap 2.
- Page-turn duration 1550→950 ms; drag-commit ease 300+760→260+520 ms.

### index.html
- **Reading camera bias:** new `CAM_READ` pose; `readBias` eases the inspect
  camera toward the open-spread framing as the cover opens (driven per frame
  from `reader.getState().cover`). Spread always fully in frame.
- **Presented-book pitch:** `PRESENT_PITCH = −0.34` — the front book leans back
  toward the elevated camera (euler order YXZ everywhere incl. analytic bounds
  and `slotWorldPose`), so cover art + title face the viewer.
- **Portrait fit:** `fitOrbitCamera` rewritten — geometric scan + bisection
  (the old multiplicative march oscillated when the fit box sat near the
  camera path). Narrow aspects (aspect < 0.95) blend to a "standing at the
  shelf" window: presented book + near arc, fov 32→44, elevation 22°→13°, far
  rim and side books crop. Books are large and square to the viewer on phones.
- **Inspect on narrow:** book scale 1.9→1.28 (aspect-lerped), camera dollied
  out and re-aimed so book + panel share the portrait frame.
- **Browsing caption** (`#caption`): title + one-line promise, bottom-left on
  desktop, top-center with a soft scrim on mobile, RTL-flipped for ar/he/fa/ur,
  dark-mode colors, updated per flip frame. Turning now always tells you which
  book is front.
- **Detail-book ground shadow:** world-fixed soft ellipse under the pulled-out
  book; follows the book, eases with pull/inspect/return, survives drag-rotate.
- **Pre-bind:** after each ring settle the reader rebinds for the front book
  during idle (`schedulePrebind`, 900 ms). Click→open is now **7 ms** (was
  300–500 ms of atlas bake + typeset on the click path).
- **`cleanPromise()`** — truncated source promises fall back to the last
  complete sentence in panel and caption.
- Light rig rebalanced (sun 2.3→1.7, hemi 0.88→0.55, env 0.68→0.55, exposure
  1.12→1.06): covers carry their own color instead of washing toward white;
  the void stays pure white. A/B'd via live renderer tweaks before locking.
- Boot phase timestamps (`fonts/shared/catalog/reveal/allMounted`).

### _extract/pages.js (new)
Real reader content, in VISION.md register (second person, no exclamation
marks, hyphens not em-dashes):
- **Sugar** — the site's real sample chapter prose (stones-in-shoes arc) plus
  written chapters; **scrolling** — the three real sample chapters condensed +
  written closing chapter.
- **Other eight books** — a per-book standard arc (mechanism / costs / belief
  underneath / walking out / willpower / slipping / colophon) written fresh,
  with the trap name woven in. Visible sequence is Title, Copyright|Contents,
  then six chapter pages, colophon last — matching the leaf mapping (front =
  cell 2i, back = 2i+1; verified by UV probe).

## Round 2 (same session, after the first report draft)

- **Arrow keys turn pages while reading** — with the cover open, ←/→ call
  `reader.turnTo(±1)` instead of browsing the ring (verified 0→1→2→1).
- **Spin/flip overlap** — the two-phase advance used to fold the departing
  book instantly and leave the front slot empty for ~520 ms (spin + flip).
  The departing book now folds through the spin's first third and the
  arriving book presents through the tail; the separate bookFlip phase was
  removed from the advance path (kept for the boot fallback). Verified
  frame-by-frame from a screen recording — one continuous motion.
- **Pinch zoom on mobile** — two pointers in inspect/reading dolly the
  inspection framing (same CAM_INSPECT→CLOSE lerp as the desktop wheel);
  a second finger cancels any single-finger drag cleanly. Verified with
  synthetic pointer events (camera z 219 → 209 as fingers spread).
- **Reduced-motion cover snap** — `openCover` snaps instead of its 900 ms
  sweep (the pull/return/ring paths already snapped).
- **Prebind guard** — the idle atlas bake never lands within 2.5 s of real
  interaction.
- **Hover verified** — front book lifts 2.2 units with `cursor: pointer`;
  side books get the pointer without the lift.
- **Scene budget** — 270 k triangles, 677 draw calls, 28 textures, 174
  geometries for the full ring: geometry-light, fill-bound at high DPR only.
- **Real hero footprint verified** — embed at the site's actual stage size
  (full width × 100dvh − nav, aspect 1.72): ring fills the width, caption
  and presented book sit correctly.

## Measured results (SwiftShader software GL, 1440×900)

| Metric | Baseline | Now |
|---|---|---|
| Boot to ring visible (10 books) | ~0.5 s | 0.48 s |
| All 48 books mounted | ~1.7 s | 1.74 s |
| Animation frame time (median/p90) | 16.7/16.7 ms | 16.7/16.7 ms (60 fps) |
| Renders while idle (5 s) | 0 (render-on-demand) | **0** |
| Click→open (same book) | ~300–500 ms stall | **7 ms** |
| Open/return hitches | 380–560 ms ×5 | eliminated (cache guard + prebind) |
| Draw calls (full ring, orbit) | 677 | 677 (unchanged — see notes) |
| Console errors | 0 | 0 |

## Interaction drive-through (all verified with real input events)

Wheel (1 book per gesture, coalesced bursts while busy) ✓ · ArrowLeft/Right ✓ ·
click side book → shortest path to front ✓ · click front book → pull out ✓ ·
drag cover → open ✓ · drag page → turn forward/back ✓ · API turnTo(5) all five
leaves ✓ · wheel zoom in inspect ✓ · drag-rotate detail book with momentum ✓ ·
Escape → return ✓ · dark mode ✓ · reduced motion (static, no idle advance) ✓ ·
embed=1 (no chrome, locale path) ✓ · RTL direction set for ar ✓ · mobile orbit,
inspect, cover, pages ✓.

## Round 3 (code-quality pass)

- **Duplicate resize registration removed** — the old copy registered the
  resize handler (and an initial `resize()`) twice, so every resize ran the
  camera fit scan twice.
- **Caption DOM-write guard** — `updateCaption` runs per frame during flips;
  it now writes text only when the visible book or visibility actually
  changed (keyed on slug + title + on-state).
- Regression chain re-run after both changes: resize → advance → caption
  updates (Overthinking → Junk Food) → open → cover → return home, zero
  console errors.

## Extreme viewports (round 2, verified)

- 2560×1440 (aspect 1.78): ring fills the frame edge to edge, caption and
  presented book correct.
- 1280×720 (aspect 1.78 small laptop): composition holds, cover title legible.
- Emulated device keeps DPR 1 in this headless environment, so the DPR-2/3
  texture paths (page-atlas scale cap, cover mip budget) are verified by code
  review only — both are hard-capped and cannot overflow.

## Round 4 (resilience + memory)

- **WebGL context-loss recovery** — mobile GPUs reclaim contexts under memory
  pressure; the hero used to die as a blank canvas. Now: `webglcontextlost`
  prevents default and gates the render loop; `webglcontextrestored` re-applies
  the theme, re-bakes the one-shot shadow map, and invalidates for a clean
  re-render.
- **Two-tier cover cache** — ring books display covers at ~100 px but each
  unique cover was decoded and uploaded at full 1024×1536 (~84 MB of GPU
  texture memory for the catalog). Ring slots now share a 512-wide decode
  (~21 MB) and the reader alone loads the full-resolution texture (verified:
  ring texture 512, reader texture 1024×1536, cover sharp in both). Net
  ~55 MB GPU memory freed on the hero — meaningful where browsers cap WebGL
  memory most aggressively (phones).
- Texture count 28 → 20; draw calls unchanged by design.

## Provenance note

`git status` shows `site/public/orbit/book-engine.js` and `index.html` as
modified — those edits (cover-texture cache, analytic camera fit, boot
instrumentation) predate this session and were inherited as the baseline.
They are NOT this session's work and were not touched by it. This session's
changes are fully contained in `Inspection/` (85 changed lines in
`orbit/book-engine.js`, ~200 in `orbit/index.html`, plus `_extract/pages.js`,
the converted Newsreader TTF, and this report).

## Notes / known limitations

- Draw calls were left at 677: SwiftShader sustains 60 fps and render-on-demand
  means zero idle cost; merging static book geometry (~300 fewer calls) is the
  next lever if a low-end device target demands it, but it risks the gold
  geometry for little visible gain tonight.
- Frame-gap measurements past ~5 s are contaminated by headless-tab rAF
  throttling (~1.2 fps cadence); all timings above were taken in foreground
  windows or via wall-clock deltas around the awaited calls.
- `pages.js` ships honest method-arc content for eight books and the site's
  real sample prose for sugar/scrolling; when `book-asset/books/<slug>` titles
  are minted, `pagesFor()` is the single hookup point.
- The idle-advance can move the front book between hover and click; the click
  always opens what is front at pointerdown (consistent, by design).

## Evidence index

Key evidence copies live in this directory (`evidence-*.png`); the full ~40-shot
set is in `/tmp/opencode/`.

- `evidence-shot-01` baseline orbit (blank presented cover) · `evidence-shot-02` baseline inspect
  (title smear) · `evidence-shot-04` title fix · `evidence-shot-10` reading bias + content
  (clipped spread, filler pages) · 
  `evidence-shot-13` caption ·  `evidence-shot-21` dark ·
  `evidence-shot-29` mobile fit · 
  `evidence-shot-34` mobile inspect · 
  `evidence-shot-40` inspect fidelity · `evidence-gal-*` final gallery (reading/dark/
  mobile/embed) · spin choreography verified via recording frame extraction.
