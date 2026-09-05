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
- `atmosphere.js`: warm background, camera-depth blur and distance haze; direct reading path.
- `shadows.js`: moving soft contact footprints (analytical approximation, not ray-traced shadows).
- `surface-textures.js`: deterministic, shared cloth roughness and paper relief.
- `locale.js`: English, Danish, and Arabic interface labels.
- `_extract/`: preserved high-resolution geometry, page solver, embedded text fonts, and catalog.
- `vendor/`: generated dependencies with license notices; do not edit or commit by hand.

## Interaction

Arrow buttons/keys or a horizontal drag browse the ring. Click/tap a book or choose **Explore this book** to inspect. Dedicated controls open the cover, turn pages, and reset rotation; drag still works. Escape returns the book. Autoplay is opt-in and pauses during focused interaction. Embedded vertical wheel scrolling belongs to the page; Shift+wheel or horizontal trackpad movement browses the ring. Browser pinch zoom is not intercepted.

An 80-slot desktop ring or 56-slot phone ring repeats the ten-title catalog. Text, cover art, and source book content are unchanged. The 3D pages remain a presentation preview; the **Read the book** link opens the accessible SSR reader.

## Rendering and ownership

- Closed opaque surfaces are instanced by geometry/material equivalence. Print remains separate. Geometry is not simplified or remeshed.
- The reader keeps the existing 132 × 52 leaf tessellation. Only exposed leaves render.
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

`window.__ORBIT` and `window.__orbitPerf` expose QA state, memory/draw counters, and readiness. They are not analytics and send nothing. See `docs/OVERHAUL-2026-09-04.md` at the repository root for measured results and release caveats.

## Atmospheric direction

The current hero follows the owner’s 2026-09-05 reference: a larger, denser ring, a clear front opening, a warm mineral backdrop, and a server-rendered headline above it. See `docs/ATMOSPHERIC-HERO-2026-09-05.md` at the repository root. The white-void composition is no longer the hero target.
