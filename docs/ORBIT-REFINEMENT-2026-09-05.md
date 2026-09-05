# Orbit refinement — cover continuity, pull cord, lamp and destination portal

This pass implements the owner's follow-up to the first repair. Source remains enhance/tactile-orbit; the existing GitHub Pages artifact branch is the only deployment destination. Main is not changed.

## What changed

### Covers and type
- The back artwork plane now rotates its UVs 180 degrees, accounting for the fact that the front board has an additional flipped parent and the back does not. Both ring and reader backs are upright.
- Canvas printing and SDF type now share the same Newsreader font file, title size, explicit line breaks, position, line spacing and imprint layout.
- The fully featured shelf volume uses the same live SDF title builder as the reader. Its ordinary instanced copy is hidden while that featured volume is shown. This avoids a raster/SDF weight or font change at the actual open/return handoff. Distant volumes keep bounded cached print textures; the reusable live featured set is bounded by the ten-title catalog. Glyph readiness is awaited before revealing that volume.
- Existing production artwork files are untouched. See qa-refinement/featured-cover-parity.png: featured shelf on the left, reader on the right, identical camera and light. qa-refinement/back.png is the actual rotated-back proof.

### Pull cord
- Replaced implicit pan ownership with native pointer capture and explicit pointer IDs, cancel, capture-loss, blur and visibility cleanup.
- A fresh grab begins at the rope's current tip, not an assumed rest position. Physics uses bounded fixed-size substeps and clears stale release acceleration.
- One gesture toggles once; keyboard/native button activation remains available.
- The hit area follows the knob and no longer covers a large invisible strip overlapping Orbit controls. No per-frame React state updates were added.

### Light, edges and headline
- Dark mode has one broad warm overhead/front reading lamp. Sun, fill, rim, hemisphere, camera-fill and environment intensity are all zero in dark mode. Light-mode studio lighting is retained.
- While browsing, the lamp's world-space position/target stay at the front presentation station. Selecting a rear book moves the books into that light, not the light around the ring. Pull/return carry the same lamp toward/back from the reader continuously.
- The atmosphere render target now uses four-sample antialiasing on desktop and two on phones, including HiDPI where the previous path disabled multisampling. There is no blanket blur on the page type.
- Both the SSR homepage and standalone Orbit show only “A little clarity. A different life.” above the ring. The library eyebrow and supporting tagline are removed; the finder section below is preserved.

### Page eleven: real destination, not a fabricated screenshot
- The homepage Orbit lazily loads one same-origin preview of the actual destination book page when approaching the last leaf. It uses the current screen size and theme, so no screenshot service, screenshot collection or fake webpage image is required.
- A projective transform maps the destination viewport onto the physical cap. Aspect ratio is preserved on portrait screens. It fades in once ready and the fifth leaf has settled.
- Clicking the cap or its accessible HTML action expands that same view into the viewport, then navigates to the matching localized book route. The Pages project prefix survives the transition.
- The preview is noninteractive/hidden from assistive technology while on the paper; the existing focusable action remains the control. Events are checked against the specific Orbit iframe, same origin and allowed book-route shape.
- Failed loading retains the normal link. Reduced motion, unrelated navigation and route changes clean up the overlay. The standalone non-React Orbit page intentionally retains a direct-link/text fallback; the animated destination surface belongs to the actual homepage integration.

## Verification

Passed in bounded runs:
- npm run check: eight unit tests, route generation, TypeScript and client/SSR build.
- Six focused browser checks: headline/cord drag across iframe and keyboard toggle; stationary overhead-only lamp and MSAA configuration; exact live featured/reader typography; desktop destination surface and navigation; Arabic phone destination and cleanup; failed-preview normal-link fallback.
- Existing dense landing regression: all five leaves, both directions, 101 samples per path, unchanged zero final endpoint/rest jump.
- Pages-shaped smoke test: mounted homepage/runtime identity, projected destination transition to the correctly prefixed client route, real chapter/deep reload and Arabic RTL route.
- Visual review of upright back, like-for-like featured/reader cover printing, overhead-only dark reading and desktop/phone portal surfaces. Evidence is in docs/qa-refinement.

## Practical limits

The single-source dark look intentionally lets surfaces turned away from the lamp fall into shadow; it is not globally filled. The real destination preview adds one lazy iframe while needed, not a live page for every book. Distant printed copies are raster caches, while the featured/reader title stays SDF. Multisampling improves geometric edges but cannot guarantee identical appearance on every monitor. Local rendering uses software GL, so these checks are not a claim about real-device GPU FPS. The owner's visual/motion review remains the acceptance step.
