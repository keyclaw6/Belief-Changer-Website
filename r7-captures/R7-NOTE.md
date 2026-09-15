# R7 note — Track A, photographic still (local, uncommitted)

## What was built
ONE falsifiable slice on the isolated `/$locale/cinematic-window` route:
the approved plate (`/tmp/bc-image-plates/a-r7-corrected.png`, 1672x941,
empty scene) as the dominant full-bleed world directly below the header,
live DOM copy on the quiet plaster, the unaltered Sugar Trap cover standing
on the sill at the green backstop, plus the unchanged native "Examine a
passage" toggle below the stage. Static approval first: no drift, parallax,
sticky rail, transition, or animation; no new dependency.

## Image provenance
- Source PNG stays outside the repo. Derivatives (sharp) in
  `site/public/responsive/site/`: 768 / 1280 / 1672 widths, AVIF (q55) +
  WebP (q80). Bytes: 768: 19941 avif / 28946 webp; 1280: 51614 / 75510;
  1672: 82472 / 119744. Delivered: desktop 1672 (<=120KB), mobile 768
  (<=29KB). `<picture>` AVIF-first, decorative (`alt=""`, aria-hidden,
  scene note as sr-only). DOM owns all copy/links; nothing baked in.
- Cover source: `/covers/01-sugar.png` via `BookCover` (with responsive
  webp srcSet), zero alteration — no crop, tint, filter, re-light, or
  transform; single owned contact matte outside the cover face.

## Geometry (tuned from captures, then frozen)
- Desktop: stage keeps plate ratio 1672:941 full-bleed; copy top-left on
  plaster (fixed ink #26241e/#4c483d, both themes); book left 27%,
  bottom 33%, height 44%, true 2:3.
- Mobile <=900px: dedicated 3:4 portrait crop, object-position 30% 55%
  (plaster + backstop + joinery edge + sill retained); copy top-left;
  book left 14%, bottom 30%, height 40%.
- RTL: stage pinned ltr (photo/cover never mirror); text re-asserts rtl.
  Dark: plate, on-plate ink, and cover fixed; only surrounding UI tokens
  change. Reduced motion: identical still.

## Measured
- Focused tests 10/10, full unit suite 19/19, typecheck clean, prod build
  clean. Zero client JS in the slice (no useState/effect; native details).
- No tracked-file modifications (`git status`: only untracked R7 files;
  source PNG never entered the repo).

## Captures (`r7-captures/`, prod bundle on :3100)
desktop-1440, mobile-390, dark-1440, arabic-rtl, reduced-motion,
zoom-contact (sill registration clip).

## Candid weaknesses
- The flat frontal cover against the perspectival sill carries a faint
  paste risk at close inspection; the contact matte grounds it at full
  composition distance, but a true spine-thickness 3D treatment would sell
  it further — deliberately out of scope for this static slice.
- On very wide viewports (>1672px) the cover-fit crop trims plaster/sill
  symmetrically; placement was tuned at 1440 and not re-verified wider.
- The plate's left plaster shadow band passes behind the copy at some
  widths; contrast stays high, but copy was kept short to avoid it.
