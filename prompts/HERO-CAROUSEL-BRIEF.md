# HERO-CAROUSEL-BRIEF.md — The Orbit (hero experience) · v3
<!-- v3, 2026-08-18: the hero concept changed from the alcove bookshelf (v2, see git
     history of prompts/BOOKSHELF-BRIEF.md) to a floating carousel of books. The owner
     locked the concept on rendered evidence. This brief supersedes v2 entirely.
     Scope also changed: v3 is a STANDALONE PROTOTYPE first; site integration happens
     in a later phase after owner approval. -->

You are an Opus-class engineering agent with a full sandbox: shell, filesystem, Python,
and vision (you can look at the screenshots you take). You are building **The Orbit**
— the hero experience for the Belief Changer library. A colossal, gently tilted ring
of photoreal hardcover books levitates in a pure white void. Nothing holds them.
Scrolling turns the ring; the front book hangs close to the camera, tack-sharp; the
far side of the ring is small and soft in the distance. Click a book and the ring
recedes into the white; the chosen book remains alone, floating, where the visitor can
turn it in their hands, crack it open, and drag through its pages while its story
appears quietly beside it.

These books help people escape traps like smoking, doomscrolling, and overthinking.
The scene must make a visitor feel, before reading a word: *this is a real library,
made with care, and it is here for me.* Calm, premium, honest. Never a tech demo.

## Your materials (all in this repository)

1. `design/hero-carousel-reference.jpg` — the owner's approved art-direction image.
   It is a MOOD AND COMPOSITION anchor, not a geometry spec (it was AI-generated and
   its perspective is imperfect). Take from it: the feeling of one enormous floating
   ring, covers forward, the front book near and crisp, the far arc dissolving into
   white. The owner's locked deltas from this image: the circle LARGER, the tilt a
   little SHALLOWER, MORE space between books, and no shadows anywhere — the books
   float free in the void.
2. `book-asset/` — the finished photoreal hardcover. **Sacred. Read
   `book-asset/SKILL.md` and `book-asset/references/runtime.md` first.** The gold
   products are `book-asset/products/00-template-reader.html` (openable, five
   deformable leaves, page turns) and `00-template-shelf.html` (closed). They are
   self-contained HTML runtimes with the engine inlined — your job is to EXTRACT from
   them, never to rebuild, re-model, or "improve" the hardcover.
3. `assets/covers/` — 10 production covers (textless, 2:3), with
   `covers-manifest.json` carrying exact ground hexes and overlay inks. Production
   covers are immutable: never crop, tint, re-light, or regenerate them.
4. `DESIGN.md` — the site's design contract ("Quiet Editorial"). Your HTML chrome
   (info panel, controls) obeys its tokens; the 3D scene obeys this brief.

## FIRST ACTION

Request sandbox network access for: `cdn.jsdelivr.net` (pinned Three.js ES modules),
`fonts.googleapis.com` + `fonts.gstatic.com` (DM Sans, DM Mono), `pypi.org` +
`files.pythonhosted.org` (playwright), `cdn.playwright.dev` +
`playwright.azureedge.net` (headless Chromium). Then work autonomously; only ask the
owner when truly blocked.

## Deliverable

A standalone prototype, no framework, no build step, in the complete-shelf spirit:

```
hero-carousel/index.html      ← the entire experience: markup, CSS, JS, import map
hero-carousel/screenshots/    ← milestone evidence
hero-carousel/README.md       ← how to run, the config contract, what got extracted
```

Runs from `python3 -m http.server`. Pinned Three.js ES modules via import map — use
the same version the book asset pins. Dummy scrollable content below the stage (real
length, several viewports) from day one, so the hero-to-page scroll handoff is
testable long before site integration. No analytics, no backend, no network beyond
the pinned CDNs and repo assets.

## The law of the book (strict — this is where projects die)

The hardcover's craft lives in configuration you must lift **verbatim** from the gold
reader product: renderer setup (color space, tone mapping, exposure), environment/
lighting rig, every material's full parameter set, cover mapping + case tinting, and
the troika/MSDF text setup. Extract these as opaque sub-assets. No cleanup, no
simplification, no "modernizing." Rebuild only what was coupled to the reader's own
page: scene graph, camera, interaction shell.

**One code path.** The book on the ring and the book in inspection are the same
object lineage — never an iframe, never a second renderer, never a hand-off between
two book implementations.

**Acceptance gate:** screenshot your extracted book at inspection scale in a pose
matched to one of the gold reader's camera presets, same lighting, full resolution,
side by side with the gold product. If a careful eye can tell yours is cheaper — the
extraction failed. Fix it before building anything else. Re-verify this gate in your
final pass.

## The ring

- **Population:** the 10 real covers from the manifest, repeated with a constrained
  shuffle — every full set of 10 appears in a fresh order, and no cover ever repeats
  within a front-arc screenful. Seed the count at **48**. Give each instance a small
  honest variation in thickness (±15%) and height (±8%) — a library, not a clone
  stamp. Cover artwork itself is never varied.
- **Geometry:** one great circle, tilted gently back (seed ~22°), rotating about its
  own tilted axis — the ellipse spins flat, it never wobbles. Camera is FIXED,
  slightly above book height; the ring does all the moving. The front slot is the
  hero position: nearest the camera, largest, sharpest.
- **Orientation:** books stand upright, covers biased outward. Implement orientation
  as one parameter blending pure-radial (0) to pure-billboard (1); seed at **0.2** —
  mostly physical, a gentle camera-ward lean near the front so the hero cover reads
  clean while side books show their true spines and page blocks.
- **Depth treatment:** no post-processing DoF. Distance does the work: far books are
  small, slightly faded toward the void's white, softly indistinct. The white void
  IS the fade — use it.
- **No floor, no shadows, no props, no horizon.** Pure white (`#FFFFFF`), matching
  the site canvas. The books are the only things that exist.
- **Performance shape:** near arc = full extracted geometry, with runtime troika
  spine/title text ONLY there; everything farther = instanced impostor boxes (shallow
  boxes, never flat cards — side books are seen near edge-on) textured from a 10-cover
  atlas. Windowed ring buffer recycles full instances as the ring turns. Budget by
  `renderer.info` draw calls and frame time, asserted in QA — not vibes. 60fps
  desktop; the architecture must not collapse at count=200 (the owner will drag the
  slider there).

## Browsing

- **Wheel turns the ring** — this is the hero's primary interaction, complete-shelf
  style. One notch advances one book with a damped settle and snap-to-front; trackpad
  inertia must not send the ring flying. Capture the wheel ONLY while the stage
  fills the viewport (IntersectionObserver at ~0.99, not scrollY math); one pixel
  past, the page owns scrolling again until the stage fully returns.
- **The door out:** a quiet arrow, bottom center. Hovering it releases the wheel to
  page scrolling; clicking it smooth-scrolls to the content below.
- **Touch:** vertical swipe ALWAYS scrolls the page — never captured. Horizontal
  swipe browses the ring; tap selects.
- **Keyboard:** arrows browse when the stage has focus, Enter inspects the front
  book, Escape leaves inspection, Tab always escapes to the HTML controls. Every
  control is a real, named, focusable HTML element over the canvas.
- **Click any visible book** (raycast the near arc): it rotates to the front slot
  and settles; the front book, clicked, begins inspection. One deterministic launch
  pose for every inspection.
- **Reduced motion:** no continuous rotation, no wheel capture, no drift — a
  composed still of the ring with discrete stepping via the arrows, transitions as
  simple fades. Still alive, never dead.

## Inspection — the levitating book

On inspect: the ring recedes — scales down, drifts back, and dissolves INTO THE WHITE
(scale-and-drift, no alpha soup, no muddy translucency) — while the chosen book
travels to a fixed center-stage endpoint near the camera. Time-based deterministic
easing; the first and final pose of every transition match resting geometry exactly;
reversing the transition lands exactly back on the ring. Never a last-frame jump.

Alone in the void, the book levitates:

- **Orbit** freely — OrbitControls, full 360° horizontal, vertical clamped sensibly.
  There is nothing in the void to break the illusion at any angle. Keep it that way.
- **Hover** the cover: it cracks open a few degrees, inviting.
- **Click or drag** the cover: it opens. **Drag pages** in both directions with the
  extracted page-turn system — committed pages never spring back; the cover can be
  dragged closed again from the first page.
- The page/text machinery is heavy: build ONE reader rig lazily on first inspection
  and rebind it per book thereafter. Ring instances never carry page systems.
- **Escape or the panel's back affordance** returns to the ring, deterministically.

**The info panel** is real semantic HTML beside the book (anchored to the fixed
inspection endpoint, not to a moving object), fading in once the book settles:
title, a one-line promise, one DM Mono metadata line ("Version 1 · English · free
forever" pattern), a short description, a primary button to the book's page, and a
quiet "Back to the orbit." In the prototype the button logs the slug — the canvas
NEVER navigates; the panel button is the only navigation source, ever. Panel content
comes from `covers-manifest.json` plus placeholder editorial copy; the inspected
book's interior uses the gold template content for now (real titles arrive with the
catalog). Panel chrome obeys DESIGN.md tokens: DM Sans, sentence case, ink buttons,
hairline borders, no pills, no gradients, no glows.

## The owner's tuning session (build this in)

A small debug panel (hidden behind `?tune=1`) with live controls:
ring count (24–200), fill fraction, tilt (0–45°), orientation blend (0–1), radius,
rotation/snap feel, plus a **"copy config as JSON"** button. Seed values are the
numbers above. The owner will dial in the final taste live in the browser; whatever
he copies becomes the locked config for site integration — no transcription drift.

## The QA loop (you have no GPU — design for it)

```bash
pip install playwright && playwright install chromium
python3 -m http.server 4173 &
# chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader"])
```

Write a screenshot script early: load with pose parameters (ring rest, mid-browse,
count extremes, inspect closed, inspect open mid-page-turn, orbit sweep at several
azimuths, reduced motion, tune panel), wait for a render-ready flag, capture. After
every meaningful change: shoot → **look at the images with your own eyes** → fix what
a museum photographer would flag. For transitions, capture first/mid/penultimate/
final frames both directions and check for pops. Zero console errors or warnings,
ever. Sample the wheel handoff manually in a headed run if possible; it also goes on
the owner's manual checklist below.

## Hard bans

- No rebuilding, re-modeling, or restyling the hardcover; no touching production
  covers; no titles baked into cover textures.
- No iframes of the book products inside the experience; no second book
  implementation; no GLB pipeline resurrection.
- No post-processing DoF on the ring; no real-time cloth physics; no physics engine.
- No floor, shadows, furniture, wood, or environment geometry of any kind.
- No opacity-fade of the whole ring (recede-to-white instead).
- No wheel capture on touch vertical swipes, under reduced motion, or when the stage
  does not fill the viewport.
- No navigation from canvas interactions — the panel button only.
- No frameworks, bundlers, trackers, analytics, or backends.
- Never fake a screenshot or skip the look-at-it step.

## Definition of done

- [ ] Extraction gate: side-by-side vs the gold reader at a matched preset — indistinguishable craft
- [ ] Ring at 48 reads as one calm floating orbit; constrained shuffle shows no duplicate covers in any front-arc screenful; thickness/height variation reads as a real library
- [ ] Count slider to 200 without architectural collapse; draw calls + frame time within the asserted budget at both
- [ ] Wheel: one notch = one book, damped snap, no trackpad flywheel; capture only while stage fills viewport; arrow hover releases, click scrolls to dummy content
- [ ] Touch + keyboard semantics as specified; all controls real, named, focusable
- [ ] Click-any-book → front slot → inspect: deterministic both directions, endpoint frames exact, no last-frame jump
- [ ] Inspection: 360° orbit clean at every permitted angle; hover-crack; drag-open; page drags commit both ways; cover drags closed
- [ ] One lazy reader rig, rebound across books; ring instances carry no page systems
- [ ] Info panel: semantic HTML, DESIGN.md tokens, only navigation source, back affordance works
- [ ] Reduced motion: composed still, discrete stepping, no capture
- [ ] `?tune=1` panel with all sliders + copy-config JSON
- [ ] Zero console errors; README documents run steps, config contract, extraction notes
- [ ] Work committed on a branch with clean history. NEVER push; the owner reviews first.

## Final report

What you built, what you extracted (and verbatim-lifted) from the gold product, the
seed config JSON, known limitations, and the three screenshots you are proudest of —
including the extraction-gate side-by-side.
