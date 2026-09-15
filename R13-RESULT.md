# R13 result — Track A, plate-aware physical belonging ("one leaf")

**Verdict: PASS (narrowly, and only at this overlap).** The book beats the
banked R8 still on sill belonging with one honest plate-derived foreground
leaf, and every kill gate holds as a number, not an impression.

## The question (from the brief)

R9's cheap rigid shared-camera drift is banked as a visual KILL. R8's static
composition is banked as the best still. The sole question: can one tiny,
genuine plate-aware occlusion/depth leaf make the Sugar Trap book belong to
the windowsill enough to beat that still?

## Grounding (what the plate actually contains)

Forensic read of the served plate (`a-r7-plate-1672.webp` vs master PNG:
mean abs diff 2.2 — the served file is the master plus lossy compression):

- The plate is an EMPTY sill. No foreground object overlaps any plausible
  book seat. The green backstop trim and the dark window stile are both
  BEHIND the book plane (book occludes them, never vice versa) — any cutout
  from them placed over the book would invert depth and be fake.
- The ONLY scene element nearer than a standing book is the sill's rounded
  nosing. Roll-top contour traced from the served pixels:
  `y_cut(x) ≈ 0.18·x + 614` (plate px; verified ±2px against all three
  served renditions).
- R8's seat (base plate y 630) hovers 65–115px above that roll over open
  surface, grounded only by shadow + a CSS lip. It reads well but the book
  stands ~10–20cm behind the edge: belonging by suggestion.

So an honest occluder EXISTS, but it demands re-seating: the book moves DOWN
to base plate y 704 (same left 27%, same height 44%), standing a few cm
behind the edge — near corner kissing the roll, far side over the surface.
That diagonal crossing (flat base vs receding roll, ~55px across the seat)
is the TRUE projection of a level book at this camera, the same class of
small legible fiction as R8's orthographic fore-edge. Kept R8's route/files/
captures byte-identical (zero tracked-file modifications).

## Mechanism (files)

Isolated `/$locale/cinematic-window-r13` route (R7/R8/R9 preserved):

- `site/src/components/home/CinematicWindowR13.tsx` — plate + live DOM copy
  + unchanged `BookCover` shell (fore-edge, one contact shadow, sill lip)
  + ONE foreground leaf (verbatim nosing pixels, `fetchPriority="low"` so it
  never contends with the plate LCP) + leaf-only parallax hook.
- `site/src/components/home/cinematic-window-r13.css` — r13 namespace.
- `site/src/routes/$locale/cinematic-window-r13.tsx` — isolated route.
- Cutout (one occluder, three responsive renditions, full-canvas so it
  registers against the plate by construction — same box, same
  `object-fit: cover`, same `object-position` at every breakpoint):
  `site/public/responsive/site/a-r13-fore-768.webp` (5 KiB),
  `a-r13-fore-1280.webp` (12 KiB), `a-r13-fore-1672.webp` (19 KiB).
  RGB = verbatim served-plate pixels (no filter/tint/relight — asserted in
  tests); alpha cut along the roll contour, hard only where it crosses the
  book, feathered everywhere else.
- Drift moves ONLY the leaf (±6px X, ±3px Y, eased rAF, fine-pointer +
  `hover` + no-preference, pointer-gated, scroll-independent). Plate, book,
  and copy stay pinned: no shared-camera gimmick, no zoom. Touch, coarse,
  no-hover, reduced-motion, and SSR render the registered still.

## Checks (prod bundle :3100, Chromium headless)

Geometry (`measure-r13.mjs`): face aspect 0.6667 at 1440/1024/390; shell
overlap 1.00 (0 gap), protrusion 7.63 / 5.14 / 3.00px; cover img
`filter=none transform=none box-shadow=none`; strip idle transform none;
plate box == strip box at all three widths; leaf @corner settles
(+5.97, +2.97)px with plate pinned and shell overlap still 1.00.

- Registration: rest diff strip-over-plate mean 0.06, p99 2 (recompression
  of identical pixels, not misregistration); on/off toggle diff confined to
  the nosing band + book base (large deltas elsewhere only the header
  pull-cord, pre-existing chrome). Mobile seat lands exactly on design
  (book left plate-x 451, base plate-y 703–704 in-crop).
- Seam/halo: 2x contact crops show stone-over-cover following the plate's
  own roll texture, no step, no fringe; series mark clear (max tuck ~11px
  plate, mark starts ~20px up); feather zones still-vs-mid identical.
- Motion: still-vs-mid corner tuck grows 9→12px (crisp, localized),
  feather surround invisible — textbook parallax, coherent everywhere.
- Console: one favicon 404 on first navigation only — identical pattern to
  R8's captures, pre-existing site-wide (no favicon in `public/`).
- Budgets: scene JS gzip 3415 B (≤4 KiB); images 5 KiB mobile / 19 KiB
  desktop (≤180/320 KiB); CLS 0.0000 (≤0.05); LCP medians R8 64ms vs R13
  64ms, regression 0ms (lab-localhost; gate ≤2.5s / ≤200ms).
- Contract: SSR HTML contains `/books/sugar/read/1` (one activation,
  JS/assets-blocked safe); reduced-motion slice pixel-identical to still
  (diff isolates to the pull-cord); dark pins daylight geometry; RTL stage
  unmirrored, shell physical-right; mobile is a composed still (no drift);
  200%-zoom reflow clean (copy/link readable, no overlap).

Visual reviews (0 of 3 say pasted): (1) 1440 still — seated at the edge,
contact more legible than R8, one photo; (2) 2x contact — genuine overlap,
no seam/halo, mark intact; (3) still-vs-mid — visible localized occlusion
change, no doubling. Unit 54/54 (13 new R13), typecheck clean, build clean.

## Captures (`r13-captures/`)

desktop-1440 (AFTER), desktop-1024, mobile-390, dark-1440, arabic-rtl,
reduced-motion, mid-drift (leaf +6/+3, real motion), zoom-contact (2x book
clip), zoom-200 (720px reflow), console-errors.json, diag-strip-on/off
(registration pair). BEFORE = `r8-captures/desktop-1440.png` + R9 captures.

## Candid weakness (the honest part)

The tuck is small by design (~9px at the near corner, tapering to a kiss):
at a glance the win over R8 is "contact you believe" rather than "effect
you notice" — the depth proof lives in the inspection drift. The flat-base/
receding-roll wedge (~55px across the seat) is disclosed fiction of the
same rank as R8's orthographic shell; a wider or deeper tuck would break
the illusion. Do not scale the overlap up without re-tracing the contour.

## Recommendation

Accept the pattern for ONE registered plate-derived leaf only: re-seat to a
tracer-verified near contour, overlap ≤ ~11px, leaf-only parallax ≤6/3px,
everything else pinned. Do not stack leaves, do not move the plate.
