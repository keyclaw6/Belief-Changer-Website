# R14 result — Track A final ("Cinematic Life Outside")

**Verdict: PASS (narrowly, same rank as R13).** The homepage actually opens
with the authored physical scene, the tuck is honest and measured, every
kill gate holds as a number. R14 does not beat R13's corner-nesting on raw
local occlusion; it wins the axis that matters for a final homepage hero:
calm, clarity, an authored copy field, its own mobile composition, and zero
client JS. One defect fix (mobile seat) plus one implementation repair
(light-direction contact shadow) were consumed; nothing else was touched.

## The question (from the brief)

Can the final Track A homepage open with an authored physical scene — one
place, live DOM copy, exact Sugar Trap cover pixels as the book face —
without looking pasted/product-shot and without regressing R8/R13?

## Grounding (what the plates actually contain)

Forensic read of the masters (smoothed-column profiles + 2x trace crops):

- Both plates are EMPTY receiving architecture: a continuous honed limestone
  sill with a genuinely rounded foreground nosing, limewashed bone plaster
  with a calm copy field (desktop x10-46%/y7-26%, mobile x5-69%/y5-25%),
  deep-green joinery, glass onto a quiet tree-lined street. No foreground
  object overlaps any plausible book seat; the ONLY scene element nearer
  than a standing book is the sill nosing.
- Desktop crown traced across the reserved span: `y_cut(x) ≈ 0.032·x + 743`
  (1536x1024 px; book base 768). Tuck ≈ 12px at the near (left) corner,
  tapering to a kiss at the far side.
- Mobile crown: `y_cut(x) ≈ 0.031·x + 1227` (941x1672 px; book base 1254).
  Tuck ≈ 9-11 display px at 390px wide, tapering to a kiss.
- Light: soft sun arrives from the upper right with the street glass; the
  wall's shadow band sits left. The contact shadow is thrown left,
  inheriting that direction.
- Defect found during implementation: the delivered mobile canvas is 9:16,
  not the prompted 2:3, so the reserved 27% seat runs the 2:3 face
  (52% of canvas width) into the dark jamb. The book stands at left 8%
  instead (top/height unchanged, back against clear plaster); the band
  follows to the new span. This is a defect fix, not a design change: the
  seat geometry (top 31%, height 44%, base 75%) is untouched.

## Mechanism (files)

- `site/src/components/home/CinematicWindowR14.tsx` — plate `<picture>`
  (desktop avif/webp 768/1280/1536 + mobile avif/webp 480/768/941 via
  `media="(max-width: 900px)"`, LCP eager/high) + live DOM copy + unchanged
  `BookCover` shell (fore-edge, one owned contact shadow; no sill-lip line,
  the real nosing is the lip) + ONE nosing band per plate
  (`fetchPriority="low"`, never LCP). Zero hooks, zero animation: SSR HTML
  is the final experience.
- `site/src/components/home/cinematic-window-r14.css` — r14 namespace.
  Stage aspects lock to the masters (3/2 desktop, 941/1672 mobile) so plate
  fractions map 1:1. Dark keeps the daylight plate (fixed plaster ink);
  stage pinned ltr; copy alignment only follows RTL.
- `site/src/routes/$locale/cinematic-window-r14.tsx` — isolated QA route.
- `site/src/routes/$locale/index.tsx` — R14 replaces `Hero` as the homepage
  hero; TrustStrip and everything downstream unchanged. (Deliberate: the
  finder band and orbit shelf leave the homepage with this version; the
  routes and components remain intact for other tracks/experiments.)
- `site/scripts/generate-r14-assets.py` — reproducible derivatives.
- `site/scripts/capture-r14.mjs`, `site/scripts/measure-r14.mjs` — evidence.
- `site/tests/cinematic-window-r14.test.mjs` — 12 contract tests. The four
  older slice tests keep their homepage assertions, narrowed to forbid lab
  slices `r(7|8|9|13)` while permitting the R14 hero.

## Checks (prod bundle on :3107, Chromium headless)

Geometry (`measure-r14.mjs`): face aspect 0.6666-0.6667 at 1440/1024/390;
seat left/top/h/base = 0.27/0.31/0.44/0.75 desktop+tablet, 0.08/0.31/0.44/
0.75 mobile; band boxes exact to plate fractions; shell overlap 1.00 (0
gap), protrusion 7.63 / 5.14 / 3.00px; cover img
`filter=none transform=none box-shadow=none`; fore idle transform none;
plate box == stage box at all three widths.

- Registration: band on/off decoded-pixel diff = 13,574 differing px, ALL
  inside the true band box (x356-712, y675-750 at 1440w); 1,005 in the
  pre-existing pull-cord animation zone; **0 elsewhere**. 2x contact crops
  show stone-over-cover following the plate's own roll, no step, no halo;
  series mark clear (tuck ≤ ~12px, mark starts ~30px up).
- Still contract: desktop == reduced-motion pixel-identical; no
  `@keyframes`, no `transition`/`animation` outside the reduced-motion pin;
  component contains no hooks/listeners/rAF.
- SSR: single `<Link>` to `/books/sugar/read/1`, renders with JS/assets
  blocked; hydration changes nothing (no client effects exist).
- Dark pins daylight geometry and plate; RTL stage unmirrored, shell
  physical-right, Arabic copy right-aligned; mobile is its own photograph
  (platem sources, 941/1672 stage); 200%-zoom reflow clean (copy/link
  readable, no overlap).
- Console: one favicon 404 on first navigation only — identical pattern to
  R8/R13 captures, pre-existing site-wide (no favicon in `public/`), not
  attributable to R14. Otherwise zero errors.
- Budgets: added route JS 335 B raw (289 B gzip) + component chunk 3.5 KiB
  raw (1.5 KiB gzip) + CSS 2.6 KiB (1.2 KiB gzip); zero runtime JS.
  Images transferred: plate AVIF 43-46 KiB, band 4-10 KiB, cover 3 KiB —
  all ≤180/320 KiB gates. CLS 0.0000-0.0001. FCP 56-72 ms lab-localhost,
  plate resource 22-37 ms (LCP entries are not emitted by this headless
  Chromium at all — `largest-contentful-paint` count 0 on every route
  including pre-existing ones — so FCP + resource timing stand in as
  approximants; gate reasoning only, not a field claim).
- Unit: 12/12 R14 tests pass; full suite 65/66 with the single failure the
  pre-existing environmental `instance-ring` (missing `three` package,
  `node_modules` was never installed on this checkout — untouched by R14).
  Typecheck clean, production build clean.

Visual reviews (0 of 4 say pasted): (1) 1440 still — seated on the sill,
contact legible, one photo; (2) 2x contact — genuine overlap, no seam,
mark intact, repaired shadow reads as shading not a gap; (3) mobile 390 —
own composition, clear of the jamb, street visible; (4) R8/R13 side-by-side
— R13 keeps the strongest local nesting, R14 the calmest whole.

## Captures (`r14-captures/`)

desktop-1440, desktop-1024, mobile-390, mobile-360, dark-1440, arabic-rtl,
reduced-motion, zoom-contact (2x book clip), zoom-200 (720px reflow),
home-desktop-1440, home-mobile-390, console-errors.json, diag-band-on/off
(registration pair). BEFORE = `r8-captures/` + `r13-captures/`.

## Candid weakness (the honest part)

At ordinary size the frontal white cover on an open sill still leans
product-shot: R14 buys calm at the price of R13's corner adjacency, and no
honest move recovers that nesting at the reserved seat (the green joinery
is behind the book plane by design). The tuck is "contact you believe"
(~10px), same rank as R13's leaf. The homepage also loses the Hero finder
band and orbit shelf in this version — a deliberate scope trade for opening
with the scene, flagged for the track merge decision, not hidden. Do not
scale the overlap up without re-tracing the contour; do not re-add motion.

## Recommendation

Ship R14 as the Track A homepage hero. Keep R8/R13 routes and evidence
banked. If a later round wants stronger belonging, re-author the plate (new
imagery), not the CSS.
