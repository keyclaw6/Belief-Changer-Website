# Track C R1 — Enhanced Orbit spike result: KILL pure plate-only

Date: 2026-09-15. Worktree: `/tmp/bc-site-track-c` ONLY (isolated experimental
worktree). No commit, push, merge, deploy, or change to any other worktree was made.

## What was built

A reversible Strategy-A-first hybrid: the REAL existing WebGL Orbit/books are
untouched, with an authored image environment layer behind the transparent canvas,
plus a dev `?env=` A/B flag and a cover-pixel parity harness so a later
shadow-catcher can be measured against this baseline.

Layering: environment `<img>` z0 → existing transparent Orbit canvas z1 →
existing DOM labels/caption/panel above. No scroll parallax. No preloads added.
No book-engine lighting changes. All copy stays live DOM/SSR.

## Source-plate deviation (disclosed)

The brief named `/tmp/bc-site-track-a/site/public/lab/cinematic-life/room-plate-r4.png`.
That path **does not exist** — Track A has no `site/public/lab/` directory at all.
The current-generation Track A plate is `/tmp/bc-image-plates/a-r7-master.png`
(byte-identical to `a-r7-corrected.png`, md5 `fab9adcac647723f63a52549c2675dd8`).
I inspected it with vision: **textless, no books, no logos**, so it satisfies the
"already-generated textless no-book Track A room plate" criterion, and copied it
**verbatim** (`cp`, zero edits) to
`site/public/orbit/env/proof-room-day.png`
(sha256 `7ddd76f472c8db9029804b9cee344d7523820fe71f7ecac26ecd6fe6d8add21b`,
identical to source, 1672x941, 2,292,823 bytes). This file is explicitly a
TEMPORARY proof plate and is not permission to ship it.

## Exact files changed

Modified (3, +86/-1 total):

- `site/public/orbit/index.html` (+28): `#env-plate` img (first child of #stage,
  `width=1672 height=941` intrinsic reserve, `alt=""`, `aria-hidden="true"`,
  `draggable="false"`, `decoding="async"`, `fetchpriority="low"`, `hidden` by
  default, **no `src`** until enabled); CSS: absolute inset-0, z-index 0,
  object-fit cover, object-position 50% 62% (50% 42% on <=720px), no hit testing
  (`pointer-events: none`); canvas promoted to `position: relative; z-index: 1`
  (renders identically, still below boot z6 / heading z7 / nav z8 / caption z10 /
  panel z12 / reader-tools z15); dark rule is a CSS-only `filter` on the plate
  alone, so cover pixels cannot be altered by it.
- `site/public/orbit/orbit.js` (+52/-1): `?env=1` query parsing (default baseline;
  `?env=0` forces baseline); `orbit-env` postMessage handler next to the existing
  `orbit-theme` handler; `setEnv()`; env mode renders the SAME scene/lights/
  materials direct (`renderer.render`, clear alpha already 0) instead of the
  atmosphere background pass; `__orbitPerf.scene` records `{calls, triangles,
  envDirect: true}`; `__ORBIT.env` / `__ORBIT.setEnv` exposed for QA.
  One real bug was caught and fixed during bring-up: the initial `setEnv(true)`
  ran before `let sceneDirty` initialization (TDZ throw killed the module under
  `?env=1`); initial sync is now DOM-only.
- `site/src/components/ShelfStage.tsx` (+7): `postEnvironment()` additionally
  forwards the page URL's `?env=` (only literal `0`/`1`) as `orbit-env`. The
  `StaticShelf` fallback function itself is untouched.

Added (2 dev-only scripts + 1 plate + captures):

- `site/public/orbit/env/proof-room-day.png` (temporary proof plate, see above).
- `site/scripts/check-env-parity.mjs` (dev-only): freezes the same front slot in
  env=0/env=1, screenshots, projects the front-cover mesh to a screen bbox, and
  diffs the eroded cover interior in-browser. Writes `parity-env0/1.png` +
  `parity-report.json`. (Note: do NOT call `goToIndex(0)` to "freeze" — requesting
  the already-front book opens inspection; the script freezes the natural boot slot.)
- `site/scripts/capture-env-r1.mjs` (dev-only): the responsive capture matrix.
- `r1-captures/` (12 files, listed below).

To fully revert: `git checkout -- site/public/orbit/index.html
site/public/orbit/orbit.js site/src/components/ShelfStage.tsx` and delete
`site/public/orbit/env/`, the two scripts, and `r1-captures/`.

Cover assets (`assets/covers/`, `site/public/covers/`, responsive imagery) are
byte-identical — `git diff` shows zero changes there. An e2e run regenerated two
unrelated files under `docs/qa-final/`; both side effects were reverted
(`phone-arabic-portal.png` restored, `page11-portal.png` removed).

## Measured results (not claimed — measured)

- Cover-pixel parity, desktop 1440x900, front slot 0 both modes, bbox drift
  exactly 0: cover interior 118x175 (20,650 px) — **meanAbs 0.308/255, maxAbs 2,
  zero pixels differ by more than 2**. The environment does not visually affect
  the rendered cover beyond sub-LSB compositing tolerance.
- WebGL cost: env=0 **61 calls / 450,404 tris** vs env=1 **60 calls /
  450,402 tris**. The plate adds **zero WebGL draw calls** (DOM layer; -1 call
  and -2 tris is the skipped atmosphere fullscreen quad). Mobile env=1 (56
  instances): 60 calls / 315,282 tris. Dark env=1: 58 calls / 450,240 tris.
- Transferred bytes: plate **2,292,823 bytes** on env=1 (single response,
  measured). Baseline env=0 makes **zero** requests to `/orbit/env/` (img has no
  `src` until enabled; no `<link rel=preload>` anywhere).
- `?env=` plumbing verified end-to-end: `/en?env=1` → iframe
  `__ORBIT.env === true`; default `/en` → `false`.
- Gates: unit `npm run test` 9/9 pass; `npm run typecheck` clean; `npm run build`
  clean; e2e hero-composition (2) + refinement (7) + repair-contracts (4): **13/13
  pass**. Baseline behavior preserved.

## Visual observations (looked at every capture, not just numbers)

- `r1-desktop-light-env0.png` (baseline): calm mineral void; the ring reads as one
  grounded object via the procedural contact pool; headline crisp; caption
  ("The Sugar Trap / Explore this book") fully legible. This is the bar.
- `r1-desktop-light-env1.png`: the mechanism works (plate fills the stage, books
  composite over it, front cover identical per measurement) but the composition
  fails honestly: the far arc slices **mid-air across the dark window mullion**;
  books overlap plaster, tree, and neighboring houses with no surface under them;
  the ring reads as a sticker on a photo, not an object in a room. Headline
  second-span ("A different life.") washes out over the bright window. The
  caption sinks into the dark sill corner and loses contrast. Busy foliage/rooflines
  compete with the small far books.
- `r1-mobile-env1-light.png` (390x844): worse. Headline collides with the dark
  mullion; far books are lost against the window; the front cover crowds the
  caption. The plate fragment has no calm region at phone aspect.
- `r1-desktop-env1-dark.png`: the CSS-only plate dim provably leaves book pixels
  alone (single-source lamp renders correctly), but a dimmed day-photo under a
  near-black ring is muddy, and headline wash persists. **Dark env stays PENDING**:
  it needs an authored night plate, not a brightness filter.
- `r1-desktop-env1-ar.png`: RTL correct (mirrored caption bottom-right, live Arabic
  DOM, `dir=rtl`); identical composition failures as light desktop.
- `r1-desktop-env1-reducedmotion.png` (standalone): environment is static, as
  required; orbit otherwise interactive.
- `r1-homepage-fallback-reducedmotion.png` (`/en?env=1`, reduced motion): the
  StaticShelf fallback is intact (SSR headline, four covers, no iframe) and
  `?env=1` is harmlessly ignored — fallback remains byte/behavior compatible.
- `r1-homepage-env1-light.png` vs `r1-homepage-env0-light.png`: identical layout
  and books; only the stage background changes — confirming reversibility.

## Verdict: KILL pure plate-only

Both kill conditions from the brief are met: **the ring still floats over
wallpaper, and copy contrast/composition degrades** (headline wash, caption sunk,
mobile collision, busy-background competition). Shipping this would trade the
current calm mineral void for a noisier, less legible hero with zero grounding
payoff. Do not iterate by hiding it with more CSS (scrims/vignettes over the
canvas would dim book pixels and violate the cover-pixel law by the back door).

What to keep: the layering mechanism itself PASSES and should stay as the test
rig — transparent canvas + DOM plate + `?env=` A/B + the parity harness with its
measured tolerances (meanAbs 0.308 / maxAbs 2).

Recommended next strategy, not more plate-only attempts:

1. **Shadow-catcher first**: an invisible ground plane under the ring that catches
   a soft contact response from the real books, so the ring sits IN the plate
   instead of ON it. Re-run parity + this capture matrix; promote only if the
   "sticker" reading disappears.
2. **Paired lighting**: drive the ring's key/fill direction and temperature from
   the plate's actual light (this plate: cool window light from the right), rather
   than compositing noon-studio books over it.
3. **Authored plate with a real support surface**: a horizon/sill/table whose
   plane is aligned to the ring's ground ellipse at both desktop and phone aspects,
   with calm negative space reserved top (headline) and bottom-left/right
   (caption, both LTR and RTL). The current window-sill fragment cannot do this.
4. **Authored night variant** for dark (the CSS dim is a stand-in, recorded pending).
