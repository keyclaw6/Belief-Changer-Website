# Orbit repair — 5 September 2026

Source branch: enhance/tactile-orbit. Preview remains the existing GitHub Pages artifact branch preview/atmospheric-hero-20260905. Main is not changed.

## Landing diagnosis and change

The owner's screenshots and complete successor handoff were reviewed before runtime edits. A detached c0525f7 worktree was supplied only with the current pinned vendor dependencies. The same reader, camera, third-leaf image samples and all five physical leaves were tested against the source checkpoint.

The two implementations produced identical vertex arrays at t = .65, .75, .85, .92, .97 and 1. The first resting frame differed from t=1 by 0.170–0.237 cm in BOTH implementations. The earlier checkpoint is therefore not a sufficient cure. The owner's subsequent authorization to rewrite the mechanism was used.

The turning wrapper now integrates a continuous tangent field between the actual right/left rest paths, with restrained grab-position-dependent curvature. It does not switch to a competing contact projection near landing. The exact endpoints use the same resting path. Leaf tessellation remains 132 × 52; the gold SDF page printing and two-sided paper shell remain. Programmatic turns return to 1550 ms and release settling to 300 + 760 × remaining distance.

Dense numerical checks cover 101 samples per direction, all five leaves, center/corner grabs. Exact endpoint/rest discontinuity is zero for all ten trajectories. At 0.99999/0.00001 the maximum difference from rest is below 0.000373 cm. Measured geometry-update median in this sandbox: approximately 1.9–2.7 ms, P95 4.2–12.3 ms. These are CPU geometry timings, NOT hardware FPS or end-to-end pointer latency.

Evidence: qa-repair/landing/checkpoint-comparison.json, continuous-comparison.json, checkpoint and continuous contact sheets; tests/landing-contract.spec.mjs. The filmstrip shows the approach rather than only a successful turned counter.

## Repairs by issue group

- Hover: each ring slot has an eased lift state. Leaving the canvas or crossing a slot changes the target, not the applied pose. Featured pointer tilt eases back. Pull-out captures the actual hovered transform.
- Input: cover and page drag axes are projected from physical book coordinates through the active camera. Page input is coalesced to one geometry update per animation frame. Pointer IDs, capture loss, cancellation and inertia ownership are explicit. Busy turns no longer redirect a page grab into a random book rotation. Back/spine/empty space rotate; the front board scrubs its cover.
- Landing: the continuous mechanism above replaces the old wrapper; five physical leaves remain ten printed sides, plus the exposed cap at page 11.
- Zoom: substantially closer dolly, conservative physical-geometry front-depth clearance of 10 cm, Shift-drag pan, two-touch pinch/pan, and Reset view resets zoom/pan as well as rotation.
- Paper: the stack's duplicate top triangles are excluded from the reader; page 11 is its one upper cap. Leaf/block paper compositing uses the same base formula. The cap SDF origin and deformation normal now agree with its actual mesh.
- Return: target transform is calculated in the final canonical ring frame. Cover closing and spin recovery happen along the return, not via a preliminary neutral snap. The final reader/slot world matrices are regression-tested.
- Composition: dense ring retained (80 desktop / 56 phone); inspection ring moves to a substantial upper-right secondary area with responsive scale and tilt. The atmospheric finishing pass remains active during reading; browse focus no longer jumps to a deep arriving slot.
- Lighting: broad key/fill/hemisphere plus restrained camera-side fill illuminate visible paper in both themes. The dark spotlight is broader and weaker, not the sole source. Paper is still lit PBR, not an emissive/unlit substitute.
- Printing: repeated ring volumes share cached cover-art-plus-print textures. The artwork image itself is preserved. Ring fronts, backs and spines are printed before selection. The selected reader keeps high-resolution SDF front/page type. Spine titles read on the left, small Belief Changer imprint on the right when the spine is viewed horizontally; the full title is fitted to its region.
- Content: a generator draws only from the site's existing source excerpts (Sugar, Scrolling) and catalog outline. Other books honestly say their manuscripts are unfinished. Interface front matter and ending are localized; English sample prose is explicitly identified as English in Danish/Arabic. No publisher, rights statement, edition or EPUB file is invented.
- Final CTA: the rendered page-11 cap has a raycast link area; a separate focusable HTML anchor appears at the same endpoint. Both navigate to the real localized book page. The Pages base is preserved by the existing export pipeline.

## Verification performed

- npm ci; check (unit tests, generated-route TypeScript, client/SSR build); npm audit --audit-level=high.
- Eight deterministic unit tests, including the exact 11-side contract, real excerpt availability and preserved gold tessellation.
- Real pointer cover drag and each of the five leaves forward/backward. Bounded runs include oblique rotation and zoom. Results are in qa-repair/gesture-results-*.json.
- Dedicated browser contracts: per-slot hover exit continuity; return from rotated/zoomed page five and clean reopen; actual cap click to the Sugar route; accessible CTA; native touch cancellation/pinch, physical near-surface clearance and reset.
- Dense reversible landing tests, not just endpoint counters.
- Existing RTL/reduced-motion/SSR test passed.
- Light/dark/open/end/oblique/close-zoom, desktop and phone captures in qa-repair. Readability is judged at reading zoom, not by enlarging tiny default-framing screenshots.

## Verification limits and remaining acceptance

The local browser is SwiftShader software GL. Full-resolution screenshot readback and the broad legacy reader test exceeded the 120-second command ceiling; those runs are NOT counted as passes. Bounded tests were used instead. This environment does not establish real-device FPS, GPU frame pacing, long-session memory plateaus or exhaustive physical touch-device coverage. Owner/device acceptance of the new page motion and lighting is still required; passing geometry numbers alone is not a substitute.

Some site catalog publication states, feedback endpoints and manuscript availability remain fixtures. This is an interactive frontend preview, not a new production backend. No EPUB download is published.

## Reproduce

Run npm ci and npm run check in site. Browser contracts are independently runnable with npm run test:e2e -- --grep 'repair: …' or --grep 'landing:'. The standalone verify-page-gestures script supports START, COUNT, DIRECTION and POSE to keep software-GL runs bounded; run directions 1 and -1 and POSE=rotated as well as neutral. capture-orbit.mjs captures one state per process. generate-orbit-preview.mjs refreshes content from the existing catalog source. landing-proof.mjs expects the detached baseline worktree at /agent/workspace/orbit-baseline; it does not copy current runtime logic into that baseline.
