# R8 note — Track A, material-belonging spike (local, uncommitted)

## What was built

ONE falsifiable spike on the isolated `/$locale/cinematic-window-r8` route
(R7 `/$locale/cinematic-window` preserved byte-identical; `git diff` shows
zero tracked-file modifications). Same approved plate, same full-bleed
figure, same immutable Sugar Trap cover via the unmodified `BookCover`
component. Added ONLY deterministic, textless CSS support layers:

- `.r8-shell`: fore-edge on the physical right of the face — 2px board lip
  + page block (repeating-linear-gradient striations + groove/edge shading).
  Starts 1px UNDER the face (overlap, never a gap), parallel to the cover
  edge. Fixed daylight tones, both themes.
- `.r8-contact`: the single owned contact shadow (tight blur only). The
  `BookCover` component's own drop shadow is neutralized in R8 scope
  (`box-shadow: none !important` on `.r8-face img`), so there is exactly one
  shadow owner and no duplicate book-shaped shadow.
- `.r8-sill`: 2px foreground sill lip overlapping the base by 1px (tones
  sampled from the plate at the book base: `#b1aaa4` mid, `#c1bcb8` lit).
- Copy fix: live copy (H1 + factual) moved to `left: clamp(150px, 15vw,
  300px)`, tracking right of the plate's left corner shadow band (dark until
  ~plate-x 230, verified by pixel scan). No scrim, no card.
- Reading action: ONE ordinary link below the stage on the canvas ground.
  No `<details>` gate, no button, no JS. (First iteration put the link
  on-plate; capture review caught it sliding behind the book at 1024px, so it
  moved below — same pattern as R7's below-stage action, minus the gate.)

No scroll camera, parallax, WebGL, Three.js, GSAP, Lenis, video, progress UI,
pills, cards, or chrome. No new dependency, no new asset.

## Measured (prod bundle on :3100, Chromium headless)

Commands: `npm run test` / `npm run typecheck` / `npm run build` /
`node scripts/capture-r8.mjs` / `node scripts/measure-r8.mjs`.

- Unit: 29/29 pass (19 existing incl. 10 R7, 10 new R8). Typecheck clean.
  Prod build clean. New-file payload 14,454 B (< 40 KB gate).
- Console: zero errors on the slice. (One `favicon.ico` 404 on first
  navigation is pre-existing site-wide: no favicon exists in `public/`.)
- Geometry (DOM rects, `measure-r8.mjs`):

  | viewport | face aspect | shell | overlap (gap 0) | visible edge | copy clears book |
  |---|---|---|---|---|---|
  | 1440 | 0.6667 | 8.63px | 1.00px | **7.63px** (gate 6-10) | 35.9px above |
  | 1024 | 0.6666 | 6.14px | 1.00px | **5.14px** | 14.1px above |
  | 390 | 0.6667 | 4.00px | 1.00px | **3.00px** (gate 3-6) | 122px above |

- Cover exactness: computed `filter=none transform=none box-shadow=none`
  on `.r8-face img` at all widths; face aspect true 2:3; same component and
  asset as R7; pixel scan across the junction (1440, y=400) shows face ->
  board -> pages -> plate with no seam band (registration gap 0px, gate <=1).
- Contact: pixel column through the base (1440, x=500) shows face -> sill
  lip -> shadow -> sill with no bright air-gap line.
- CLS = 0.0000 over load incl. fonts/images (gate <= 0.05). LCP was NOT
  measured — no claim made.
- Reduced-motion capture is pixel-identical to the default capture across
  the whole slice (full-image diff isolates to the header pull-cord's settle
  position — pre-existing chrome, not the slice).
- 200%-zoom reflow: captured at a 720px viewport (what real 200% browser
  zoom produces at 1440) — portrait composition, copy and link readable, no
  overlap. Dark: plate/copy/cover/shell/shadow/lip fixed, only chrome
  themed. Arabic RTL: stage unmirrored, shell on physical right, text rtl.

## Captures (`r8-captures/`, viewport PNGs)

desktop-1440, desktop-1024, mobile-390, dark-1440, arabic-rtl,
reduced-motion, zoom-contact (2x clip around the book base), zoom-200
(720px-viewport reflow proof), console-errors.json.

## Candid weakness (the honest part)

The fore-edge is orthographic: straight vertical outer edge, uniform width,
while the sill beneath it recedes in perspective — and a strictly frontal
face would show no flank at all. At 2x you can see the thickness does not
converge with the scene; it is a small, legible fiction, not shared
camera truth. A larger or thicker treatment would break the illusion; this
width is close to the most the plate's geometry honestly supports.

## Verdict: PASS (narrowly, and only at this thickness)

Close inspection makes the volume materially more believable than R7's
zero-thickness plane — page block, board groove, seated base, one shadow —
while the full-frame atmosphere is not weakened (same plate, same seat;
copy now clears the shadow band at every captured width). All kill gates
held as numbers, not impressions. Recommendation: accept the pattern for
thin fore-edges only; do not scale the thickness up without plate-aware
perspective geometry.
