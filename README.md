# Belief Changer — Website

A free multilingual reading library, with a tactile, interactive 3D hardcover experience.

## Run the current application

```sh
cd site
npm ci
npm run dev
```

Open http://localhost:3000/en. The standalone book experience is at `/orbit/index.html` on the same server.

The production source is **`site/`**, including `site/public/orbit/`. Three.js, Troika, and fonts are automatically self-hosted during development/build; no CDN is required. `hero-orbit/`, `Inspection/`, and `experiments/` are historical explorations, not the current application.

## Quality gates

From `site/`:

```sh
npm run check       # unit tests, route generation, TypeScript, production build
npm run test:e2e    # Chromium interaction, fallback, accessibility and visual checks
npm run serve      # review the production build on port 3100
npm run images     # regenerate responsive variants, preserving originals
```

The latest visual direction is documented in [the atmospheric hero revision](docs/ATMOSPHERIC-HERO-2026-09-05.md).

See [the overhaul notes](docs/OVERHAUL-2026-09-04.md) for the implementation, measured results, and remaining release work. Backend submission endpoints and some book content are still prototype fixtures; this work does not claim a completed publishing backend.

Contributors: start with [`AGENTS.md`](AGENTS.md) and the [production orbit architecture](site/public/orbit/README.md).
