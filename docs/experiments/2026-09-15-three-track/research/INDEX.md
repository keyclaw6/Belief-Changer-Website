# Belief Changer — X research evidence package (2026-09-14)

Source: X/Twitter as primary (authenticated via agent-reach `twitter` CLI, user @KristianBi25423),
linked demos/GitHub only to verify claims. No website changes made.
Raw search dumps: `raw-*.json` (twitter CLI YAML output). Screenshots: `screenshots/`.

Belief Changer context (from AGENTS.md/VISION.md/DESIGN.md/STATUS.md): Quiet Editorial,
white/bone + hairline, ink-only interaction, photoreal books = emotional core, owner-locked
stillness (no side-entry animation), TanStack Start SSR + isolated Three.js leaves, no signup /
no tracking, RTL + reduced-motion from day one. So: every technique below must be judged on
whether it can live in an isolated, SSR-safe, still-by-default leaf with static fallbacks.

## Technique taxonomy (recurring patterns)

- T1 Single-image 2.5D parallax (RGB + depth map → mesh/plane displacement, pointer/gyro)
- T2 Layered AI-scene cutouts (foreground/mid/background planes, scroll-driven camera)
- T3 Scroll-driven camera + baked lighting (scroll scrubs a pre-lit 3D scene)
- T4 Shader-textured surfaces (displacement / glass / particle / heat-map on imagery)
- T5 Sprite-frame interactivity (AI expression sheet → 360 video → frames → pointer sprite)
- T6 Isolated WebGL leaf + DOM chrome (3D canvas is one component; copy/nav stay DOM/SSR)
- T7 Motion stack: GSAP ScrollTrigger + Lenis synced to GSAP ticker (+ Framer Motion micro)
- T8 AI art-direction loop (GPT Image for mood-board → hero → texture; human taste = bottleneck)

## Key findings (12, ranked by Belief Changer relevance)

### F1 — Single-image depth-map parallax with live demo (T1) — VERIFIED
- Creator: Tanmay M (@mtanmaym)
- Post: https://x.com/mtanmaym/status/2099339727946256735 (2026-09-14; +gyro follow-up with link)
- What: 3D parallax from one image via depth map; pointer + mobile gyro; thumbnail strip of scenes.
- Stack said: depth-image viewer (demo page title "Tanmay M - Depth Image").
- Source/demo: YES — https://tanmaym.com/depth-image (HTTP 200, screenshot verified).
- Why BC: cheapest cinematic upgrade path — one immutable cover/site image + depth map in an
  isolated leaf, static image fallback = SSR/RTL/reduced-motion safe. No 3D team needed.
- Evidence: `screenshots/demo-tanmay-depth-image.png`, `raw-01-parallax.json`

### F2 — Image → depth-model → animated-scene tutorial, names the model (T1) — VERIFIED
- Creator: Kabarza (@kabarza_, verified)
- Post: https://x.com/kabarza_/status/2098474722681892974 (2026-09-11, 231 likes, 224 bookmarks)
- What: portrait/matcha scene animated from a still; promises tutorial: prompts, edit app,
  depth-map model, animation of several examples.
- Stack said: depth model = **Apple Depth Pro** (author reply to @vish_dev09 in thread).
- Source/demo: video in post; tutorial pending (not yet shipped — speculation flag).
- Why BC: gives the concrete depth estimator to test (Depth Pro) against cover/site imagery;
  bookmark ratio signals practitioner demand.
- Evidence: `raw-01-parallax.json` (full thread incl. Depth Pro reply)

### F3 — AI-generated interactive desk room; lamp changes evening→night (T2/T6) — VERIFIED
- Creator: Sanndy (@SanndyCreationz, verified)
- Post: https://x.com/SanndyCreationz/status/2099474448692977851 (2026-09-14)
- What: whole room feels interactive — lamp switches mood evening/night, poster opens About
  pop-up, screen shows artworks, camera works like a camera.
- Stack said: **ChatGPT Images + Claude** (explicit in post).
- Source/demo: YES — https://lamp-interaction-site.vercel.app (HTTP 200, screenshot verified).
- Why BC: closest emotional reference found — warm lamplit calm ≈ comp-6b warmth; proves
  baked-mood-switching (not real-time relighting) can carry "first morning of a freer life".
  Caution: demo has baked-in English poster text ("Focus Create Inspire") — violates BC
  textless-imagery law; treat as interaction reference, not art direction.
- Evidence: `screenshots/demo-lamp-desk-interactive.png`, `raw-08-imgseq.json`

### F4 — Pointer-driven mascot sprite pipeline: sheet → 360 video → frames → sprite (T5) — VERIFIED
- Creator: jhey (@jh3yy, verified, 372 likes / 379 bookmarks)
- Post: https://x.com/jh3yy/status/2099480006686659031 (2026-09-14; quotes @nilbuild's
  `/page-mascot` skill: mascot follows cursor, reacts when poked)
- What: raise fidelity beyond 9 frames — gen expression sheet, gen 360-look video, LLM-extract
  frames, build sprite, hook to pointer with JS+CSS; upscale after extraction (replies).
  Notes Krea AI for creative work + a skills-repo "studio" for grading shots/prototypes.
- Stack said: AI video (Krea) + LLM frame extraction + plain JS/CSS sprite.
- Source/demo: linked skill demo in quoted post; video in post.
- Why BC: pointer-reactive painting or book detail without WebGL — cheap, reduced-motion
  collapsible (freeze to one frame), performance-safe vs shaders. Fits "single ambient"
  motion budget if ever used.
- Evidence: `raw-11-mascot.json`

### F5 — OpenShaders: open-source WebGL/WebGPU shader discovery+install layer (T4) — VERIFIED
- Creator: David Haz (@davidhaz, verified, 304 likes / 46k views)
- Post: https://x.com/davidhaz/status/2097609187526062436 (2026-09-09; 80 replies)
- What: "home shaders deserve" — discover/build/publish/install shaders made to ship;
  username-claim launch mechanic.
- Stack said: WebGL/WebGPU, open source.
- Source/demo: YES — https://openshaders.com (HTTP 200, screenshot) +
  https://github.com/openshaders/openshaders (linked in thread).
- Why BC: if BC ever shades imagery (paper grain, light drift), pull from a versioned
  shippable library instead of bespoke GLSL; still must pass the stillness/reduced-motion gate.
- Evidence: `screenshots/demo-openshaders.png`, `raw-06-displacement.json`, `raw-12-openshaders.json`

### F6 — Shaders.solaceui: 14 copy-paste interactive shader experiments (T4) — VERIFIED
- Creator: Harshit (@harshitlog, verified)
- Post: https://x.com/harshitlog/status/2099485977853231443 (2026-09-14)
- What: pixel heat-map graphs, words→particles, bend-images-through-glass, re-texture artwork;
  live-tune with your own images/videos/SVGs.
- Stack said: open source, shadcn installation, editable code.
- Source/demo: YES — https://shaders.solaceui.com (HTTP 200).
- Why BC: fastest way to prototype one restrained effect (e.g. glass-bend on a Quiet Fact
  photo) with readable code; risk is over-use — DESIGN.md bans decoration.
- Evidence: `raw-06-displacement.json`

### F7 — Rolling scroll gallery: paintings inside a cylinder (scroll curl, not slide) (T3/T4) — VERIFIED
- Creator: Mehdi / Motionary (@mehdi_made, verified, 164 likes)
- Post: https://x.com/mehdi_made/status/2098748928485130737 (2026-09-12; inspired by Interface Craft)
- What: gallery slides wrapped around inside of a cylinder; off-center works squeeze/curl away.
- Stack said: React Native + Skia triangle-mesh re-projection on UI thread + Reanimated
  (product page: Expo · React Native Skia · Shaders · Reanimated, 1.43 MB).
- Source/demo: YES — https://motionary.dev/animations/rolling-scroll-gallery (HTTP 200,
  screenshot; paid $8 drop, not OSS).
- Why BC: shelf-choreography reference — books could recede/curl rather than slide; but note
  stack is native (Skia), so web port = R3F/custom shader work, not drop-in.
- Evidence: `screenshots/demo-motionary-rolling-gallery.png`, `raw-02-gsap.json` + `raw-06/08`

### F8 — GPT Image as scaffolding/mood-board before manual detail (T8) — VERIFIED practitioner claim
- Creator: Tommy Geoco / designertom (@designertom, verified, 109 likes / 24 replies)
- Post: https://x.com/designertom/status/2097396081638457479 (2026-09-08; re Image 2.5 launch)
- What: Image 2/2.5 is a "slept-on advantage" not just for heroes but for refining thinking
  during scaffolding; "the new mood boarding" (reply to @ethan_kinnan); Flora/Krea node-flow
  discussion in replies.
- Stack said: GPT Image 2.5 (+ Flora/Krea flows).
- Why BC: validates BC's anchor+edit-endpoint cover protocol as current best practice, and
  suggests the same loop for hero/shelf scenes — with the cover-prompt lock untouched.
- Evidence: `raw-07-gpthero.json`

### F9 — GPT Image multi-view → Blender MCP (terminal Python) → Three.js viewer (T8/T3) — VERIFIED with caveats
- Creator: Givros (@givros, verified, 212 likes / 261 bookmarks)
- Post: https://x.com/givros/status/2079946571622326363 (2026-07-22; full prompt in thread)
- What: multi-view temple concept (GPT Image 2.0) → Codex + GPT-5.6 Ultra driving Blender
  headless (`--background --python`) for model/materials/cameras/exports → Three.js viewer
  (rotate, per-angle, layer hide). Author admits roofs/ornaments need refinement.
- Stack said: GPT Image 2.0 + Codex/GPT-5.6 + Blender MCP + Three.js.
- Why BC: proves the image→3D→web chain but also its honesty limit — fine for massing,
  not for BC's photoreal-truth bar; book-asset pipeline stays closed per AGENTS.md.
- Evidence: `raw-*.json` (first search dump in session transcript)

### F10 — GSAP reference stack: ScrollTrigger + SplitText + Lenis-on-ticker (T7) — VERIFIED
- Creator: GSAP official (@greensock, verified) — e.g. Lucas Aufrere portfolio SOTW
  (ScrollTrigger reveals + SplitText + Lenis synced to GSAP ticker); Touchless Škoda Vision
  (ScrollTrigger + ScrollSmoother + Three.js/WebGL + MediaPipe smoothing).
- Posts: greensock SOTW thread 2026-05-27 (Lucas Aufrere); 2026-04-29 (Škoda, credits @DoanBao50912).
- Why BC: the one motion-stack claim with vendor-grade provenance — IF scroll motion is ever
  added, this is the sanctioned sync pattern (Lenis on GSAP ticker), not ad-hoc rAF.
- Evidence: `raw-03-lenis.json`

### F11 — Gaussian splats go WebGPU + receive shadows (what splats can/can't do) — VERIFIED, mostly negative result for BC
- Creators: @playcanvas (SuperSplat Editor 3.0, 500 likes) / @DSkaale (Splatbox shadow-receive,
  231 likes) / @SpenserFX (splats-as-workflow-glue thread).
- Posts: 2026-09-08/10/12; e.g. https://x.com/playcanvas/status/2097307578690584721,
  https://x.com/DSkaale/status/2098800030635171890
- What: SuperSplat 3.0 rebuilt on WebGPU (tens of millions of Gaussians, heap 1557→105 MB);
  Splatbox makes splats receive shadows (near-plane+bias); SpenserFX uses splats to move
  dense concept assets between Blender/Cycles/COLMAP/GLB/PLY.
- Why BC: rules splats OUT for the site proper — heavy capture/edit pipeline, overkill vs
  baked books/covers; only revisit if a shelf scene ever needs captured 3D.
- Evidence: `raw-05-splats.json`

### F12 — One-file sub-1MB AI-built Three.js marketing site (taste-bottleneck thesis) — UNVERIFIED third-party claim
- Creator: Egor (@EgorJioo, verified) reporting "Claude Opus 5 reportedly built…"
- Post: https://x.com/EgorJioo/status/2099222353813135643 (2026-09-13; "reportedly" is doing
  heavy lifting; replies press for draft-vs-polish split)
- What: mouse parallax + cursor particles + wireframe intro + hover butterfly, single HTML <1MB.
- Why BC: useful only as a process signal (bottleneck → taste/direction), NOT as a technique
  citation; do not cite the 2-hour/1MB numbers without reproduction.
- Evidence: `raw-04-ai-scroll.json` / `raw-10-baked.json`

## Speculation quarantine (seen in searches, NOT verified)
- @himanshubuildss cluster (multiple "stop building flat…" posts, React/Next + Tailwind + GSAP +
  Framer stacks, prompt-library CTAs, 5–81 likes): recurring stack words match F10 but posts are
  marketing funnels for a prompts product; treat stack nouns as directional, conversion/price
  claims ($5–20k, "one afternoon") as unverified.
- @thedzianis "copy-paste into Claude Code" cinematic-site lists; @zeuuss_01 / @Abobsterina /
  @awp_Akira "$35k-studio stack" threads (ClaudeDesignSkills, Higgsfield + Claude): pointer to
  real repos (freshtechbro skills for Three.js/GSAP/R3F/Motion/Babylon) but timeline/cost claims
  unverified; verify against the repos before citing.
- GPT Image 2.5 launch hype (character consistency, sprite sheets — @fMinZhou pixel-game thread):
  real feature direction, but game-asset numbers are anecdotal.

## Recurring implementation patterns (across verified posts)
1. One AI image + one depth map = the cinematic unit (F1/F2). Pointer/gyro drives 2–3% camera
   drift; edges inpainted or clamped; mobile falls back to gyro-off static frame.
2. Bake the light, animate the camera (F3/F7/F9). No real-time relighting on marketing surfaces;
   mood = swapped baked states (evening/night) or scroll-scrubbed camera on a pre-lit scene.
3. 3D lives in one leaf (F3/F5/F6/F7). DOM owns copy/nav/SEO; canvas owns atmosphere. Matches
   BC's isolated-leaves + SSR law.
4. Pointer sprites beat shaders for playfulness-per-kB (F4 vs F5/F6). Frame-strip + CSS is
   cheaper than GLSL and collapses cleanly under reduced-motion.
5. Motion sync = Lenis on the GSAP ticker (F10). Every serious scroll site converges here;
   ScrollSmoother appears on flagship GSAP builds.
6. Taste is the bottleneck (F8/F12). AI drafts in minutes; direction, restraint, and polish
   decide premium. Directly supports BC's quality-gate culture.

## Pitfalls / performance / accessibility concerns
- Performance: depth-displacement + shaders + Lenis + image sequences compete for GPU on
  mid-range phones; BC's Orbit closeout already tracks measured tradeoffs — any new leaf needs
  the same budget (texture MB, DPR caps, IntersectionObserver-gated rAF).
- Reduced motion: every pattern above must collapse to a static composed frame
  (BC law). Parallax/gyro/cylinder/shader-drift all need `prefers-reduced-motion` kills.
- SSR/SEO/i18n: canvas content is invisible to indexers and screen readers — BC's per-locale
  SSR chapter law means canvas can never carry copy; poster/static fallbacks required.
- Text in imagery: AI scenes love baking words into posters/screens (F3 demo does). BC law:
  all imagery textless, copy as live text — plan an inpaint/clean pass on any AI plate.
- RTL: pointer/camera direction metaphors must mirror or stay neutral under `dir="rtl"`.
- Theme parity: dark/light hierarchy must hold with the same 3D leaf (books "glow" on dark).
- Claims hygiene: engagement-funnel posts (hype cluster) routinely omit polish time, device
  testing, and fallback work — the exact things BC's gates charge for.

## 5 research gaps for follow-up
1. Depth-Pro quality on BC's actual assets: run Apple Depth Pro (+ one alternative) on 2 covers
   + 1 Quiet-Fact photo; score edge halos/occlusion fill; measure displacement-mesh cost vs a
   3-plane cutout. (F1/F2 protocol, BC imagery.)
2. Cutout-vs-mesh shootout: same hero scene as (a) RGB+depth mesh, (b) 3 hand-separated planes,
   (c) static; blind-rate warmth/calm per DESIGN.md + record MB/FPS on 2 target phones.
3. Scroll-camera grammar that respects stillness: define the maximum sanctioned move (e.g.
   ≤4% drift, fade-only sections) and prototype Lenis-on-ticker scrub of ONE shelf camera;
   verify against reduced-motion + RTL before any page adoption.
4. Sprite-frame mascot/book detail: cost a 12–24-frame pointer-reactive detail (F4 pipeline)
   for one book or painted-life element; check Krea/video rights + upscale provenance.
5. Shader-necessity test: can the "warm mineral atmosphere" hero revision be met with baked
   gradients + static imagery alone (DESIGN.md ceiling: radial ≤0.03–0.04, fixed layer)? Only
   if not, trial ONE OpenShaders/solaceui effect in a leaf with full fallback matrix.
