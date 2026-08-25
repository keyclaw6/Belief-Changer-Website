# Continuation brief — The Orbit (hero ring) pass 3

> Pass 3 added the gold page-printing pipeline (SDF ink geometry on the
> deforming leaves + page-11 cap print). Pass 2 content preserved below.

You are continuing work on the Belief Changer hero 3D scene ("The Orbit").
A previous session implemented pass 1 (front-on camera, denser ring, page-turn
fix, dark-mode lamp on the selected book). The owner reviewed on rendered
evidence and rejected several decisions. This brief is the complete handoff:
workspace map, current state, the owner's open complaints, hypotheses with
file:line pointers, and the verification loop. Read AGENTS.md first per repo
convention; DESIGN.md > AGENTS.md > skills.

## Workspace map

- `site/public/orbit/index.html` + `book-engine.js` — PRODUCTION copy, served
  by the site at `/orbit/index.html` (hero embeds it via
  `site/src/components/ShelfStage.tsx` iframe).
- `hero-orbit/` — dev mirror of the same scene (path diffs only: fonts
  `../site/public/fonts/`, importmap uses CDN three, `MAT_BASE =
  '../site/public/orbit-materials/'`). Keep both copies in sync for every
  behavioral change.
- `site/public/orbit/_extract/03-pageturn.js` — verbatim gold page physics
  (`PG.Leaf`, `PG.turnState`). Gold reference runtime:
  `book-asset/products/00-template-reader.html` (self-contained; serve repo
  root and open it to compare interaction feel).
- `site/public/orbit/_extract/04-text.js` — the gold `BK.text` printed-page
  pipeline (extracted verbatim: SDF/MSDF ink as real geometry riding the
  leaf surface + page-11 cap print, shell-based facing culling). Loaded as a
  classic `<script>` before the module; exposes `window.BK.text`. Mirrored in
  `hero-orbit/_extract/04-text.js`.

## Pass 3 — gold-quality page turning (DONE, verified)

Owner complaint (from gold gap): orbit reader showed (1) doubled/stretched
text on turning leaves (back-shell ink bled through the atlas) and (2) a
blank page-11 cap. Root cause: the orbit drew text into the atlas canvas on
both shells; the gold moved to `BK.text` (SDF ink geometry + facing culling)
and prints page 11 on the cap. Changes (both `book-engine.js` + `index.html`,
mirrored in `hero-orbit/`):

- `makePageAtlas(..., paperOnly)` skips canvas text when the ink pipeline is
  live (atlas carries paper only; no see-through doubling). `buildPageInk`
  rebuilds the SDF ink; `setContent`/`rebind` pass `paperOnly` and rebuild ink.
- `createReaderBook` builds `textLayer = BK.text.create(...)` once troika is
  ready; fonts map to self-hosted DM Sans (body/bodyMedium) + Newsreader
  (display/displayItalic) via `FONT_BASE` (auto-switched by `MAT_BASE`).
- `page11` mesh + `updatePage11` rides the stack relax deform; `capSurface`
  `flatSurface` prints page 11 (Colophon) on the cap.
- `pinDynamicBounds` (gold `pinLeaf`) pins bounding spheres on the dynamic
  leaf + cap geometry so frustum culling never drops them.
- `updatePageFacing(i)` / `refreshLeafText(i)` mirror gold; the frame loop
  calls `reader.updateFacing(camera)` and forces render while inspecting/
  reading so facing stays correct as the book rotates. Exposed as
  `updateFacing` on the reader API.
- Fallback: if troika/`BK.text` is unavailable, `textLayer` stays null and the
  atlas (paper + text) is used as before — no error.

Verified (CDP, no console errors): both `site/public/orbit` and
`hero-orbit` build 71 ink meshes + 74 synced troika text objects (page 11
included); full turn cycle 0→5→0 and open/close run clean.
- `Inspection/` — an earlier agent's experimental copy + FINDINGS.md +
  evidence shots. Reference only; production never serves it.
- Uncommitted in the site copy: OX-ALPHA's analytic camera-fit
  (`measureBookLocalBox` / `analyticOrbitBounds` / rewritten `fitOrbitCamera`)
  and a cover-texture cache in `book-engine.js`. Keep them; your framing
  changes must work through `fitOrbitCamera`.

## Current tuning (site/public/orbit/index.html, after pass 2)

- `N = 48`, `RING_R = 62`, `RING_TILT = 10°`, `PRESENT_OUT = 11`,
  `PRESENT_LIFT = 4`, `BOOK_SCALE = 1.0` (~L379-384)
- `CAM_ELEV = 7°`, `CAM_FILL = 0.86`, `BOUND_FAR_COS = 0.15` — the camera fit
  bounds only the FAR arc + presented book, using real per-slot corners
  (`orbitFitCorners`; an AABB invents phantom corners and over-retreats), and
  aims at `lerp(min.y, max.y, 0.35)`. The near arc overflows the frame on
  purpose; nothing clips.
- `CAM_INSPECT.look = (0, 18, 100)`; `INSPECT_BOOK_X = 0` (held book centered);
  `INSPECT_OPEN_SHIFT = 12` glides the book right as the cover opens so the
  open spread is centered too; held scale `BOOK_SCALE * 1.55`.
- Inspect input zones: cover open → `reader.pickLeaf(raycaster)` decides page
  drag (pages/leaf meshes/open block) vs rotate (boards/spine/empty); cover
  closed → drag scrubs the cover, a quick tap (<8px, <400ms) toggles it;
  rotation is direct 1:1 while dragging with smoothed release inertia;
  double-tap (<500ms, <14px; native dblclick is suppressed by pointerdown
  preventDefault, so it is detected manually in `endPointer`) glides the pose
  home via `spinReset`; grab/grabbing cursors.
- Dark mode: `lamp` SpotLight (angle 0.3, penumbra 0.62, decay 2, intensity
  26000 — candela, real distance falloff) is the only key; studio rig sun
  0.02 / fill 0 / rim 0.025 / hemi 0.012 / env 0.02 (faint silhouettes);
  `updateLamp()` hides `glowPool` while a book is held.
- Pull-cord (`site/src/components/PullCord.tsx`): grab area is now a 64×168
  strip over the rope around the bead (was a 46px square), so pulls register
  anywhere near the knob, over the hero iframe included.
- Pass-1 fixes you must NOT regress: `book-engine.js` `turning()` sets
  `q.rootX/q.rootY/q.rippleP` (without them the turning leaf is NaN → pages
  "teleport"); reader troika title gets board transform + `ph/2 - yCanvas*s`
  y-mapping + `depthTest:true`/`depthOffset:-6`; reader meshes are
  shadow-map-excluded.

## Owner complaints (priority order) — what to fix

### 1. Inspect interaction is awful (THE priority)
Symptoms: book "doesn't respond to my mouse"; sometimes opens, sometimes not;
gets stuck in a weird rotation that cannot be rotated back; page turns not
smooth. Root causes already identified in
`site/public/orbit/index.html` pointer handlers (~L1480-1620):
- When the cover is open (`st.cover >= 0.99`) EVERY pointerdown becomes
  `pagePending` → the book can never be rotated while open. When closed, any
  hit on the book starts a cover drag → rotation only works by dragging on
  empty space. Hence "dead" cursor.
- `detailSpin` has inertia + damping but no way home: once rotated, the book
  stays rotated (rotation.x clamped ±0.85 at ~L2010, y unbounded, no reset
  gesture, no settle-back).
- Cover open/close commits at `st.cover > 0.55` on pointerup; page drag needs
  >8px horizontal before a leaf synthesizes; diagonal/vertical drags feel
  dead; no cursor feedback in inspect state (canvas cursor is only set in
  orbit state, `updateHover`).
Direction: redesign inspect input into predictable zones/affordances — e.g.
drag on the page block/cover flap turns pages or opens/closes, drag anywhere
else on the book rotates, drag on background rotates too; double-click (or a
small reset control) returns the book to its neutral orientation; add
grab/grabbing cursors; make rotate-back always possible while open (e.g.
drag on the book's board edges/spine, or vertical drag = rotate, horizontal
on pages = turn). Compare feel against the gold reader
(`book-asset/products/00-template-reader.html`), whose drag-to-turn is the
quality bar. Verify with real CDP mouse drags (see loop below), mid-drag
screenshots, and `reader.getState()`.

### 2. Ring geometry & framing
Owner wants the OPPOSITE density of pass 1: bigger circle, bigger gaps
between books, same N (do NOT add books), shallower viewing angle than 11°,
and the selected book more centered on screen.
- Raise `RING_R` (try 60-72) keeping `N = 48`; keep books from looking lost
  (the analytic fit rescales — check the front book still reads large; you
  may raise `BOOK_SCALE` or tune `CAM_FILL`).
- Lower `CAM_ELEV` further (try 6-9°).
- Center the presented/selected book: in inspect, `INSPECT_BOOK_X = -21`
  puts the held book left of center — owner wants it centered (reduce toward
  0 at wide aspects; keep the narrow-aspect guard in `applyInspectShift`).

### 3. Dark mode = lamp is the ONLY light, with distance falloff
- Books must get darker the farther they are from the lamp: give the lamp
  real falloff (`lamp.decay` ≈ 1.5-2 with compensating intensity, or keep
  decay 0 and fake falloff) and cut the dark studio rig toward zero
  (sun/fill/rim/hemi/env ≈ 0-0.03) so the spotlight is the sole source.
- While a book is held (inspect/reading), the glow pool behind must
  disappear (`glowPool.visible = false` in held states; `updateLamp`
  currently parks it under the ring slot) and the lamp highlights the held
  book. The ring should remain *very* faintly visible (rim of silhouettes),
  not invisible and not clearly lit.
- Keep light-mode untouched.

### 4. Pull-cord theme switch misbehaves over the hero
The site's pull-cord (`site/src/components/PullCord.tsx`, mounted in
`LocaleShell.tsx`/`Nav.tsx`, fixed top-right) "doesn't work well when it's
in front of the HTML file" — i.e. dangling over the orbit iframe. Debug:
hit-area/pointer-events/z-index vs the iframe (note `pointerEvents: 'none'`
at PullCord.tsx ~L314 and 'auto' at ~L387 — the grabbable area may be too
small or lost to the iframe), and confirm a pull flips `data-theme` and
`ShelfStage.tsx` (~L83-103) posts `orbit-theme` so the iframe follows. Test
on the full site (vite), both themes, cord pulled and clicked.

## Verification loop (proven)

- Orbit standalone: `python3 -m http.server 8765 --directory site/public`
  → `http://127.0.0.1:8765/orbit/index.html?cb=N` (cache-bust EVERY reload;
  ES modules cache aggressively).
- Full site: a vite dev server is running at `http://localhost:4100`
  (ports 3000-3002 belong to other sessions — don't kill them; if 4100 is
  dead: `cd site && setsid nohup npx vite dev --port 4100 --strictPort &`).
- Repo root (gold reader + hero-orbit dev copy):
  `python3 -m http.server 8766`.
- Browser: `agent-browser` CLI. `set viewport 1440 900`, `set media
  dark|light`, `screenshot /tmp/opencode/shots/NN-name.png`, real drags via
  `mouse move/down/up`, `eval` for `window.__ORBIT` (`openFront()`,
  `returnHome()`, `advance(1)`, `reader.getState()`, `scene`, `camera`).
  After mutating visibility/materials via eval, force a render with
  `window.dispatchEvent(new Event('resize'))`.
- Screenshot BOTH themes + a mid-drag page turn + inspect rotation + narrow
  viewport (420×800) before declaring done; also taste-skill §14 spirit:
  calm, no clipping, reduced-motion path untouched.

## Constraints

- Never regenerate/crop/tint production covers; assets immutable.
- No new dependencies; Three.js r180 via existing import maps.
- Keep render-on-demand (idle GPU cost zero) and boot batching.
- Do not commit unless the owner explicitly asks.
- Mirror every behavioral edit into `hero-orbit/` (adjusting only the known
  path diffs), and keep this file's "Current tuning" section truthful if you
  change constants.

## Definition of done

1. Inspect: open/turn/rotate/rotate-back/reset all work with plain mouse
   drags, smoothly, in both themes, verified by mid-drag screenshots.
2. Ring: larger diameter + visible gaps at N=48, elevation shallower than
   11°, selected book centered; nothing clips at 1440×900 and 420×800.
3. Dark: lamp-only lighting with distance falloff; held book highlighted,
   pool behind gone, ring faintly present.
4. Pull-cord toggles theme reliably over the hero and the iframe follows.
5. No regressions: page leaves still bend (no teleport), titles correct,
   light mode unchanged, zero console errors.
