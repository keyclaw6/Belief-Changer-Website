# Website experiment checkpoint — Track C: Cinematic Orbit

Archived mid-experiment on 2026-09-15 so the work can be resumed later without reconstructing context.

- Branch: `experiment/orbit-cinematic-world`
- Base: `55b1ab5` (`origin/main` at experiment start)
- Status: experimental, not production-ready, not merged/deployed
- Primary idea: preserve the real production Orbit interaction, but place it inside an authored photoreal world with matched lighting, depth and physical grounding.

## What is preserved

R1 is a deliberately falsifiable environment-layer spike. It adds a reversible DOM image plate behind the transparent existing Orbit canvas plus `?env=0/1` A/B plumbing and a cover-pixel parity harness.

Important files:

- modified `site/public/orbit/index.html`
- modified `site/public/orbit/orbit.js`
- modified `site/src/components/ShelfStage.tsx`
- temporary proof plate under `site/public/orbit/env/`
- `site/scripts/check-env-parity.mjs`
- `site/scripts/capture-env-r1.mjs`
- `TRACK-C-R1-RESULT.md`
- `r1-captures/`

## Current verdict
The layering architecture passed, but the pure plate-only visual strategy was killed. The existing ring simply floated over a photograph: the far arc crossed window/wall content without a physical support plane, desktop copy contrast degraded, and mobile composition became worse.

Useful result: the environment can be added without changing cover pixels or adding WebGL draw calls, and the A/B/parity harness now exists. The next version should use an environment authored specifically around the Orbit geometry, a shadow-catching/receiving plane, and Three.js lighting matched to the generated scene. Dark should have an authored night state rather than a dimmed day image.

## Key screenshots

- [Current Orbit baseline](../../../r1-captures/r1-desktop-light-env0.png)
- [R1 photoreal environment experiment](../../../r1-captures/r1-desktop-light-env1.png)
- [Homepage with environment](../../../r1-captures/r1-homepage-env1-light.png)
- [Mobile environment](../../../r1-captures/r1-mobile-env1-light.png)
- [Dark environment](../../../r1-captures/r1-desktop-env1-dark.png)
- [Arabic / RTL](../../../r1-captures/r1-desktop-env1-ar.png)
- [Reduced-motion homepage fallback](../../../r1-captures/r1-homepage-fallback-reducedmotion.png)
- [Pixel-parity baseline](../../../r1-captures/parity-env0.png)
- [Pixel-parity environment](../../../r1-captures/parity-env1.png)

## Last known validation

R1 records 9/9 unit tests passing, clean typecheck/build, 13/13 relevant e2e checks, cover bbox drift 0, cover interior mean absolute pixel difference 0.308/255 with max difference 2, zero added WebGL draw calls, and zero environment bytes transferred in `env=0`.

## Resume from here
1. Read `TRACK-C-R1-RESULT.md` before changing the renderer.
2. Keep the existing Orbit interaction and cover system intact.
3. Generate/design a scene whose support surface and negative-space zones are constructed around the Orbit ellipse and selected-book camera.
4. Add physical grounding (shadow catcher / receiving plane) before adding more effects.
5. Match live Three.js key/fill direction and temperature to the authored environment.
6. Author a separate portrait/mobile composition and a real dark/night state.
7. Re-run the `?env=` A/B and pixel-parity harness; kill any version that again reads as books pasted over wallpaper.