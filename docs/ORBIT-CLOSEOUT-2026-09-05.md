# Orbit closeout — cozy lighting, immediate final-page preview, measured cleanup

## Scope

This is the final pass requested by the owner, including authorization to merge the verified source into remote main. The production source is site/ and site/public/orbit/. The existing GitHub Pages preview continues to use its separate generated artifact branch; compiled artifacts are never merged into source.

## User-facing changes

- The single dark-mode reading lamp is brighter (23000 → 38000 intensity units) and less yellow (#ffe6c0 → #fff1df). The backdrop is a softer charcoal instead of near-black. No ambient/fill lights were reintroduced; the browse lamp stays at the front presentation station.
- Opening inspection now starts the final-page preload immediately, rather than waiting for the fourth leaf. The visible first viewport's images and fonts are prepared before revealing it.
- Page eleven has a readable localized click/tap cue with a small curved SVG arrow. The preview remains correctly projected onto the cap on desktop and mobile.
- The transition is 720 ms, and the destination's entry animations are suppressed for that arrival so the expanding preview does not hand off into another fade-up.
- The destination preview uses the real server-rendered document and original CSS/fonts/images, with its scripts stripped and a script-disabled iframe. It does not start a second React/router/Motion application. The actual route is preloaded separately for navigation. A failed preview still leaves a normal accessible link.

## Measured performance changes

Controlled local comparison: detached source checkpoint 914ce15 versus the optimized runtime, both at 900×600, DPR 1, desktop MSAA 4, the same book and sampling path. Renderer: SwiftShader software GL.

| Measurement | Before | After |
| --- | ---: | ---: |
| Paper texture allocation, RGBA bytes excluding mipmaps | 34,478,976 | 2,873,248 |
| Paper texture dimensions | 2828×3048 atlas | 707×1016 shared cell |
| Actual pixels available per page | 707×1016 | 707×1016 |
| Instance-buffer update requests over eight unchanged-ring reading frames | 424 | 0 |
| Median page-geometry update | 2.1 ms | 2.1 ms |
| Scene draw calls in the controlled sample | 111 | 111 |
| Scene triangles in the controlled sample | 600,834 | 600,834 |
| DPR / MSAA | 1 / 4 | 1 / 4 |

The shared paper cell removes 91.7% of that texture allocation without lowering per-page resolution. Unchanged ring instance matrices are not rewritten/uploaded; rigid picking proxies keep stable local matrices. Exact near-surface depth bounds are cached until the corresponding geometry or world transform changes.

Raw comparison reports: qa-final/profile-baseline-914ce15.json and qa-final/profile-optimized.json. These are allocation/CPU/upload measurements, not a claim about FPS on the owner's computer. No leaf tessellation, SDF quality, ring population, cover resolution, antialiasing or atmosphere pass was reduced.

A release test also found an external font fallback triggered by a redundant printed arrow. The page already has the new SVG cue, so that glyph was removed. Arabic fallback is now a pinned self-hosted Noto Sans Arabic font. English and Arabic browser checks assert no external network requests.

## Cleanup

- Consolidated the duplicate capture/smoke helpers into capture-orbit.mjs and pages-smoke.mjs.
- Renamed the reusable physical-gesture verifier to verify-page-gestures.mjs.
- Removed one superseded failed-run report; retained successful evidence, owner screenshots and historical experiments.
- Formatted the repair/runtime helpers, updated README/STATUS/architecture documentation and added current npm commands.
- Baseline comparison accepts ORBIT_BASELINE rather than requiring a particular sandbox path.
- Prebuild now regenerates preview content from the actual catalog source.
- CI retains all current evidence directories. Dependencies, build output, vendor output, browser reports and secrets remain ignored.

## Verification and reproduction

From site/:

```sh
npm ci
npm run check
npm audit --audit-level=high
npm run test:e2e
```

On software GL, interaction tests use a 900×600 default viewport; composition/mobile tests set their own viewports. This changes the test workload, not runtime rendering quality. TEST_PORT selects another local test port if needed. Slow tests can be run in bounded groups with --grep; a timed-out process is never recorded as a fully completed suite. Some full-resolution runs completed their assertions but exceeded sandbox teardown limits; their status is distinguished from cleanly completed runs.

Useful targeted commands:

```sh
npm run profile:orbit
COUNT=3 npm run test:gestures
START=3 COUNT=2 npm run test:gestures
DIRECTION=-1 COUNT=3 POSE=rotated npm run test:gestures
DIRECTION=-1 START=3 COUNT=2 npm run test:gestures
npm run capture:orbit -- dark-end
PAGES_OUTPUT=/absolute/path/to/export npm run test:pages
```

Coverage includes all five physical leaves forward/reverse; dense landing convergence; pointer cancellation and zoom safety; hover/return consistency; featured/reader type parity; theme cord; stationary single-source lighting; preload-before-last-page; visible cue; desktop/Arabic mobile navigation; failed-preview fallback; SSR/deep reload; no external font requests; and unit coverage proving unchanged instances cause no uploads.

## Remaining product limits

This remains a frontend preview with fixture-backed submissions/catalog metadata and incomplete manuscripts. No EPUB file or backend has been invented. The standalone Orbit has a direct-link fallback; the destination transition is owned by the homepage integration. Real-device GPU performance and future editorial content require their own review. Preserve original production assets, no-signup/no-tracking behavior, locale/RTL and reduced-motion fallbacks in later work.
