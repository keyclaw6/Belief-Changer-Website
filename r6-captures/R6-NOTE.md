# R6 note — Track A, "Cinematic Life Outside" (local, uncommitted)

## What was built
ONE falsifiable slice on the isolated `/$locale/cinematic-window` route:
an oversized material book in a precise architectural aperture/sill world,
plus one native "Examine a passage" toggle revealing genuine live-DOM
argument beside the object. Cover -> argument.

## Visual mechanism (no new imagery)
CSS/material prototype only. No plate/poster was authored in this run, so
there is no image provenance to record and no text-in-image risk: every
surface is CSS or live DOM.
- Wall/copy 0-40% (canvas token, gallery-label copy low on the wall)
- Blade 40-56% (limewash `#d8d2c2`->`#cfc8b4`, one 1px course joint at 62%,
  physical edge lines; horizontal course line <=900px)
- Stage 56-100% (overcast `linear-gradient` field, flat street band +
  far-light line, honed sill, 7px dark-metal stop)
- Book: `BookCover` (immutable `/covers/01-sugar.png` + responsive webp
  srcSet), flat 2:3, in-flow base on the sill, owned blur contact matte.
  Never mirrored in RTL (grid pinned `direction: ltr`; text re-asserts rtl).

## Motion
Cut entirely. The static endpoint IS the proof. The interaction is a native
`<details>` toggle: immediate state change, zero movement, works JS-off
(SSR renders it closed with the passage in-DOM) and under reduced motion.

## Passage (genuine, verbatim)
First two paragraphs of `site/src/data/sample-chapters.ts` `sugarChapter1`
via `book.chapters`, plus mono source line, one-line qualification
("An excerpt, not a promise..."), and the real `/books/sugar/read/1` link.
No efficacy claim anywhere. Sample reachable in 1 action.

## Measured (1440x900 book box 312x468; world 594 tall => book = 79% of
aperture; mobile book width = 72vw of 390px portrait)
- Desktop initial scene media: 640w webp ~12KB on disk + 3.6KB scoped CSS
  (guardrail <=300KB). Mobile: 320w webp ~4KB (guardrail <=150KB).
- No idle RAF (zero client JS in the slice). CLS: aperture min-height +
  fixed book aspect; no shift observed across captures.
- Covers untouched: `git status` shows zero modifications under
  `assets/` or `site/public/`.

## Captures (`r6-captures/`, prod bundle on :3100)
desktop-1440, desktop-inspection (full page), mobile-390,
mobile-inspection (full page), dark-1440, arabic-rtl, reduced-motion,
zoom-contact (2x clip of sill support).

## Candid weaknesses
- The CSS sky/street is honest flat material, not photography; at full
  height it can read slightly synthetic next to the photoreal cover. A
  credible authored overcast plate would be the next falsifiable step if
  tooling allows, but the current still was judged sufficient for the R6
  question (object scale + contact + argument beside it).
- The wall above the low label stays deliberately empty; on very tall
  viewports it risks reading as void rather than gallery calm.
- `dist/` build output is regenerated locally for review only (untracked?/
  ignored) and the review server was stopped; nothing committed, pushed,
  merged, published, or deployed.
