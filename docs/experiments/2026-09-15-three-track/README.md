# Website experiment checkpoint — Track A: Cinematic Life Outside

Archived mid-experiment on 2026-09-15 so the work can be resumed later without reconstructing context.

- Branch: `experiment/cinematic-lived-world`
- Base: `55b1ab5` (`origin/main` at experiment start)
- Status: experimental, not production-ready, not merged/deployed
- Primary idea: one photoreal authored place with an immutable real Belief Changer book physically integrated into the scene.

## What is preserved

The branch contains the full sequence of implemented Track A prototypes and their capture evidence: R4, R5, R6, R7, R8, R9 and R13. Later reasoning-only rounds did not introduce additional source revisions.

Important implementation files:

- `site/src/components/home/CinematicWindow*.tsx`
- `site/src/components/home/cinematic-window*.css`
- `site/src/routes/$locale/cinematic-window*.tsx`
- `site/scripts/capture-r8.mjs`, `capture-r9.mjs`, `capture-r13.mjs`
- `site/scripts/measure-r8.mjs`, `measure-r9.mjs`, `measure-r13.mjs`
- responsive authored plate assets under `site/public/responsive/site/`
- `R13-RESULT.md` for the latest measured result

## Current verdict
R8 is the banked strongest static composition. R9's cheap shared-camera/CSS drift was a visual kill. R13 narrowly passed by using a genuine foreground leaf derived from the generated plate's own sill pixels, re-seating the book so the foreground nosing can honestly overlap it.

The result improves physical belonging but is still closer to premium product photography than to the singular authored ambition of the KEEL/MotionSites reference. The next serious move should not be more CSS motion. Re-author the environment around the fixed book rectangle and camera so support geometry, contact, light direction and negative space are designed specifically for the book.

## Key screenshots

- [R13 desktop](../../../r13-captures/desktop-1440.png)
- [R13 mobile 390](../../../r13-captures/mobile-390.png)
- [R13 dark](../../../r13-captures/dark-1440.png)
- [R13 Arabic / RTL](../../../r13-captures/arabic-rtl.png)
- [R13 contact close-up](../../../r13-captures/zoom-contact.png)
- [R8 banked desktop still](../../../r8-captures/desktop-1440.png)
- [R9 killed drift state](../../../r9-captures/mid-drift.png)

All raw captures remain in the top-level `r*-captures/` directories on this branch.

## Last known validation

R13 records 54/54 unit tests passing, clean typecheck and clean build. Cover pixels remain unfiltered/untransformed; reduced-motion, mobile, RTL and dark captures are preserved.

## Resume from here
1. Re-read `R13-RESULT.md` and this checkpoint.
2. Review R8 vs R13 at ordinary size before changing anything.
3. Use image generation as an active design step: purpose → canvas → contents → relationships → appearance → checks.
4. Generate a receiving architecture around the exact fixed book/camera geometry, not a decorative background.
5. Keep the accepted cover pixel-true and all copy live DOM.
6. Re-run desktop/mobile/dark/RTL/reduced-motion captures and the same kill criteria before promoting a new revision.