# Website experiment checkpoint — Track B: Living Reading Room

Archived mid-experiment on 2026-09-15 so the work can be resumed later without reconstructing context.

- Branch: `experiment/living-editorial-atlas`
- Base: `55b1ab5` (`origin/main` at experiment start)
- Status: experimental, not production-ready, not merged/deployed
- Primary idea: a believable reading place where selecting a shelf title moves the same physical book to the reading surface.

## What is preserved

The branch contains implemented Track B iterations R4 through R11 plus R13, with raw desktop/mobile/dark/RTL/reduced-motion/selected/transfer captures.

Important implementation files:

- `site/src/components/home/ReadingRoom*.tsx`
- `site/src/components/home/reading-room*.css`
- `site/src/routes/$locale/reading-room*.tsx`
- `site/scripts/capture-r4.mjs` through `capture-r13.mjs` where implemented
- `site/tests/reading-room*.test.mjs`
- generated reading-room plate assets under `site/public/site/`
- `R13-RESULT.md` for the latest measured result

The branch also includes the homepage wiring used during the experiment and a locale-explicit vote-count formatting fix that prevents hydration differences between server and browser locale.

## Current verdict
The interaction architecture is the strongest part of this track. R11 established the shelf → lift/carry/settle → desk interaction with keyboard/focus/ARIA awareness and an instant reduced-motion path. R13 kept that machine and improved material continuity with subtle pose variation, page/spine thickness and room-consistent contact shadows.

The visual weakness remains that the room can still read as a tasteful retail/PDP presentation. The next meaningful experiment should re-author the actual room around a credible reader position, chair/table relationship and book orientation. Adding props or more interface chrome is explicitly not the answer.

## Key screenshots

- [R13 desktop](../../../r13-captures/r13-desktop-light.png)
- [R13 selected book](../../../r13-captures/r13-desktop-light-selected.png)
- [R13 mid-transfer](../../../r13-captures/r13-desktop-light-mid-transfer.png)
- [R13 mobile 390](../../../r13-captures/r13-mobile-390-light.png)
- [R13 dark](../../../r13-captures/r13-desktop-dark.png)
- [R13 Arabic / RTL](../../../r13-captures/r13-desktop-rtl-ar.png)
- [R11 selected baseline](../../../r11-captures/r11-desktop-light-selected.png)

All raw captures remain in the top-level `r*-captures/` directories on this branch.

## Last known validation

R13 records 73/73 unit tests passing, clean typecheck and clean build. The material pass adds no new behavior; same-node transfer, focus behavior, rapid-selection cleanup, reduced-motion, RTL and dark-mode evidence is preserved in the captures and report.

## Resume from here
1. Re-read `R13-RESULT.md` and inspect still + selected + mid-transfer together.
2. Preserve the useful same-object continuity; do not restart the interaction machine casually.
3. Re-author the room with image generation around one believable place to sit and read.
4. Make the desk book orientation/scale derive from that seat, not from product-display logic.
5. Keep the room unmirrored in RTL, provide a real portrait/mobile composition, and keep reduced-motion as an honest endpoint.
6. Kill the direction if the next room still reads as a store/PDP at a three-second glance.