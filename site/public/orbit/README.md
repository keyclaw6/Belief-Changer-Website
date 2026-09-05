# The Orbit — production runtime

The canonical interactive book experience lives here. The older `hero-orbit/`, `Inspection/`, and HTML experiments are historical references, not production sources.

## Run

From `site/`:

```sh
npm ci
npm run dev
```

Open `/en` for the website or `/orbit/index.html` for the standalone scene. `predev` and `prebuild` vendor the pinned Three.js, Troika, and font dependencies. Do not open the HTML using `file://` or serve this folder before running the vendor task.

## Modules

- `index.html`: semantic controls, responsive layout, theme styles, import map, bootstrap fallback.
- `orbit.js`: scene, camera, input, lifecycle, and demand-based scheduling.
- `book-engine.js`: shared materials, closed books, articulated reader, SDF print.
- `instance-ring.js`: rigid shelf batching; original meshes remain picking proxies.
- `motion.js`: tested inertial integration, wheel normalization, and ring ordering.
- `atmosphere.js`: continuous background, depth blur, distance haze and multisample antialiasing through browsing and reading.
- `shadows.js`: moving soft contact footprints (analytical approximation, not ray-traced shadows).
- `surface-textures.js`: deterministic, shared cloth roughness and paper relief.
- `locale.js`: English, Danish, and Arabic interface labels.
- `_extract/`: preserved high-resolution geometry, page solver, embedded text fonts, and catalog.
- `vendor/`: generated dependencies with license notices; do not edit or commit by hand.

## Interaction

Arrow buttons/keys or a horizontal drag browse the ring. Click/tap a book or choose **Explore this book** to inspect. Dedicated controls open the cover, turn pages, and reset rotation, zoom and pan; drag still works. Wheel/pinch zoom and Shift-drag/two-finger pan frame the reading surface with a geometry-aware safety limit. Escape returns the book. Autoplay is opt-in and pauses during focused interaction. Embedded vertical wheel scrolling belongs to the page; Shift+wheel or horizontal trackpad movement browses the ring. Browser pinch zoom is not intercepted.

An 80-slot desktop ring or 56-slot phone ring repeats the ten-title catalog. Original cover artwork and manuscript sources are preserved. Five physical leaves carry ten printed sides; the page-11 cap ends the sample. On the homepage it projects the actual SSR destination, preloaded at inspection without executing another app. A click/tap cue and accessible link open the localized book page, where available chapters can be read. Standalone mode retains a direct-link fallback.

## Rendering and ownership

- Rigid surfaces and cached distant printing are instanced. The featured volume uses the same live SDF type as the reader. Each host is composed once per update; unchanged instance matrices are not rebuilt or uploaded.
- The reader keeps all five physical leaves at 132 × 52 tessellation; facing ink is culled, not the paper. One full-resolution paper texture is shared across all printed sides. Geometry is not simplified or remeshed.
- Cover image promises and spine textures are shared; a book never disposes a shared cached texture.
- Page deformation textures, old SDF print, and page-11 print are disposed on rebind.
- Only the inspected book uses the additional physical sheen/clearcoat shader. The ring uses cheaper standard PBR with the same cloth relief and roughness maps.
- No continuously scheduled scene frame when idle. Animation/input/font completion invalidates; optional autoplay uses one timer. Hidden embeds and lost contexts skip work.
- Shadows are inexpensive, book-following penumbra approximations. No frozen shadow map can leave stale streaks.

## Verify

```sh
npm run check
npm run test:e2e
```

`window.__ORBIT` and `window.__orbitPerf` expose QA state, memory/draw counters, and readiness. They are not analytics and send nothing. See `docs/ORBIT-CLOSEOUT-2026-09-05.md` at the repository root for measured results, current commands and release caveats.

## Atmospheric direction

The current hero follows the owner’s 2026-09-05 reference: a larger, denser ring, a clear front opening, a warm mineral backdrop, and a server-rendered headline above it. See `docs/ATMOSPHERIC-HERO-2026-09-05.md` at the repository root. The white-void composition is no longer the hero target.
