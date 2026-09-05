# Atmospheric hero revision — 2026-09-05

## Direction

The owner's supplied reference calls for scale, density, perspective and a clear focal book—not the earlier pure-white product turntable. This revision replaces the hero-only white void with a warm mineral-toned light field, packs the ring, isolates the featured volume, softens the distance, and adds a proper headline above it. Other site surfaces retain the editorial design system.

## Composition

- Desktop: **80 book instances**, up from 36. Phone: **56**, up from 24. These repeat the existing ten-title catalog; they do not imply new manuscripts.
- Radius **62 → 94**, so the world-space diameter is approximately **52% larger**.
- Featured book: radial offset **11 → 36**, scale **1 → 1.25**, with a restrained pitch and yaw that expose its physical edges.
- Neighbor angles ease away from the front opening and recover density around the side arcs. This opening remains at the front during browsing.
- Camera framing uses an asymmetric hero aperture rather than fitting every extent into a symmetrical box. The far rim stays below the headline, while the near arc is visually large.
- The new headline, **“A little clarity. A different life.”**, and supporting line are real server-rendered homepage content. Danish and Arabic versions are included. The headline fades when inspecting; the finder section below uses an h2 rather than a second h1.
- Mobile reserves distinct regions for heading, featured cover and caption. A projection-based regression test verifies the cover cannot touch the caption or headline.

## Atmosphere

`site/public/orbit/atmosphere.js` supplies a depth-aware finishing pass:

- A warm lower-left light pool transitions toward a cooler mineral horizon.
- A small edge-aware blur disk increases with camera-space distance behind the focused book. It is not a whole-canvas CSS blur. Foreground silhouettes and HTML type stay sharp.
- A modest distance haze lowers contrast at the far rim.
- Premultiplied-alpha compositing preserves the book colors; the background is not added to opaque cover pixels.
- Very low-amplitude stable grain prevents sterile gradient banding.
- Half-float color when supported; RGBA8 fallback otherwise. MSAA is bounded, and high-DPR devices avoid an additional multisample allocation.

The finishing pass is used for the hero. Inspection/reading use a direct render path over a matching CSS backdrop, prioritizing responsiveness and clear pages rather than spending a blur pass on a distant background ring.

## Performance and verification

Measured completed hero render on software-rendered Chromium:

| View | Instances | Total draw calls, including finish | Triangles |
|---|---:|---:|---:|
| Desktop/home | 80 | **45** | 445,302 |
| Phone | 56 | **45** | 311,766 |

The prior 36-book instanced hero used 44 draw calls. The denser geometry therefore adds triangles and the finishing pass adds pixel work, even though draw-call count remains low. This is not a claim that the heavier hero has identical GPU cost or a physical-device FPS guarantee.

- Unit tests, route generation, TypeScript and client/SSR production builds pass.
- Rechecked browsing, actual canvas picking, no external network, idle render scheduling, reader page turns and reopening, mobile orientation, dark mode and WebGL recovery.
- New checks confirm server-rendered headline presence, headline fade on inspection, mobile projected-cover spacing, and sufficient near/far depth separation.
- Visual iteration caught an initial opaque-color compositing mistake and mobile caption collision; both were corrected before final evidence.
- Software-GL screenshot readback intermittently exceeded 30 seconds even after interaction assertions completed. Screenshots are now an explicit capture step (or `CAPTURE_QA=1`) rather than slowing every functional test. Interrupted multi-test runs were rerun in bounded groups; they were not counted as completed suites.

Evidence: `docs/qa-v2/home.png`, `desktop.png`, `mobile.png` and matching measurement JSON. These are screenshots of the running code, not generated mockups.

## Commands

From `site/`:

```sh
npm ci
npm run check
npm run test:e2e
npm run serve
```

With the review server running, capture one view at a time:

```sh
node scripts/capture-hero.mjs home
node scripts/capture-hero.mjs mobile
node scripts/capture-hero.mjs dark
```

No remote push, merge or deployment was performed. Existing manuscript samples and mocked backend endpoints remain separate release work, as described in the prior engineering report.
