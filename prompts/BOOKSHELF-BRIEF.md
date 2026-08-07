# BOOKSHELF-BRIEF.md — The Shelf Experience (Phase 3) · DRAFT for owner review

You are an Opus 5 engineering agent with a full sandbox: shell, filesystem, Python, and
vision (you can read the screenshots you take). You are building **the shelf experience
for the Belief Changer library** — a Three.js module where visitors browse the entire
collection of photoreal hardcovers, pull one into inspection, turn it in their hands,
and open it. Everything you make will be judged by one question: **does this feel like
standing in front of a beautiful, calm library of real books, or like operating a
website widget?**

These books help people escape traps like smoking, doomscrolling, and overthinking.
Visitors should feel, before reading a word, that these books deserve respect. Your
shelf is where that feeling is born.

This brief is self-contained. You also receive four materials in your workspace:

1. `book-asset/` — the finished photoreal book package (GLB + `src/Book.js` +
   `src/textbake.js` + its README and ACCEPTANCE.md). **Its README is the API contract;
   where this brief's API sketches differ from that README, the README wins.**
2. `covers/` — 10 production cover textures, `derived/` spine and back textures, and
   `covers-manifest.json` (slug, groundHex, overlayInk per book). The manifest is your
   catalog: the shelf renders exactly the books it lists, in order.
3. `comp-reference.png` — the owner's art-direction comp. Take from it ONLY the niche:
   the softly rounded inner corners, the warm inset wall, the quality of its shadows.
   Its fonts, pill buttons, and engraved covers are explicitly NOT law.
4. `strings-sample/` — sample UI strings and localized book titles (English, Arabic,
   Chinese) so nothing English is hardcoded.

Work autonomously through the milestones. Only ask the owner a question when you are
truly blocked; he approves your first action and walks away.

---

## FIRST ACTION — before anything else

Request sandbox network access (RequestNetworkAccess) for ALL of these domains in your
very first turn, so the owner can approve once and leave:

| Domain | Why |
|---|---|
| `cdn.jsdelivr.net` | pinned Three.js ES modules |
| `fonts.googleapis.com` | DM Sans + DM Mono (panel UI), Newsreader (book text baking) |
| `fonts.gstatic.com` | font file host |
| `pypi.org` | pip package index (playwright) |
| `files.pythonhosted.org` | pip wheel downloads |
| `cdn.playwright.dev` | headless Chromium download |
| `playwright.azureedge.net` | Playwright browser CDN mirror |

Do not proceed to installs until access is granted.

---

## What you are building

A **manifest-driven shelf module**: the entire library standing face-out in a warm
alcove, browsable as a continuous loop whether the manifest lists 3 books or 300.
Selecting a book pulls it — with a deterministic, seamless transition — into an
inspection stage where it can be orbited a full 360°, cracked open, and paged through,
beside a quiet editorial panel. A clear button in that panel is the ONLY way the module
ever asks the site to navigate somewhere.

The books themselves are not yours to build. `book-asset/` renders them; the covers
are finished photography; the manifest binds them together. You build the room, the
choreography, and the browsing.

**The deliverable is a package consumable without reading your code history:**

```
shelf-asset/                     ← git-initialized repo
  src/Shelf.js                   ← ES-module runtime component (Three.js)
  src/environment.js             ← niche + inspection studio environments
  harness/index.html             ← dev/QA page (plain HTML, pinned Three.js, page content BELOW the shelf so escape-to-page is testable)
  strings/                       ← sample locale strings used by the harness (en, ar, zh)
  screenshots/                   ← milestone evidence, named by layer
  README.md                      ← API docs, events, params, integration guide
  ACCEPTANCE.md                  ← the checklist below, each item marked with evidence
```

## Architecture — locked decisions (do not relitigate)

**1 · Consume, never rebuild.** Books come from the Book package (shared geometry,
per-instance covers, `spineColor: "auto"`, runtime title baking in any language via its
textbake). You never model a book, never generate cover art, never tint, re-light, or
crop the cover textures. The scene's light does the modeling. If the covers look wrong,
fix the light, not the texture.

**2 · The whole library, windowed.** The shelf is a continuous loop of ALL manifest
entries at any N ≥ 3, with the wraparound seam never visible. Render it as a ring
buffer: only the ~20–24 instances nearest the current position exist at any moment;
instances are recycled as the visitor browses; cover textures stream in at reduced
resolution away from center and full resolution near it. The experience must hold
60fps and sane memory with a 300-book manifest (test by cycling the 10 real books).

**3 · Two embedding modes.**
- `mode: "hero"` — the module fills the viewport at the top of a longer page. The
  wheel browses the shelf (like the complete-shelf reference feel: damped positions,
  snap to nearest, center book favored). A quiet arrow at the bottom center is the
  door to the rest of the page: **hovering it releases the wheel to normal page
  scrolling; clicking it smooth-scrolls to the content below.** Wheel capture is
  active ONLY while the stage effectively fills the viewport; once the visitor is
  past it, the module never touches scrolling again until the stage fully returns.
- `mode: "inline"` — embedded partway down any page. The wheel is NEVER captured;
  browsing is drag, buttons, markers, and keys only.

**4 · Touch and keyboard are not afterthoughts.** On touch, vertical swipes always
scroll the page; horizontal swipes browse the shelf; taps select. On keyboard, arrow
keys browse when the module has focus, Tab always escapes, Escape leaves inspection.
Every control is a real, named, focusable HTML element layered over the canvas.

**5 · Interaction never navigates.** Clicking a book selects and centers it; a second
click (or the Open button) begins inspection. Inside inspection, hovering the cover
cracks it open a few degrees, click or drag opens it, pages drag both directions
through the Book API's preview pages, drag closes it. None of this — no click, no
rotate, no open — ever leaves the page. The editorial panel carries ONE clear primary
button ("Open the book's page" in the harness strings); pressing it emits
`onNavigate(slug)` to the host site. The module itself performs no navigation. Ever.

**6 · Two environments, both flawless.**
- **Shelf view: the alcove.** A shallow niche with softly rounded inner corners set
  into a warm bone wall, lit like a museum vitrine: soft directional light, real
  contact shadows under every book, gentle occlusion in the corners. Match the
  corner softness and shadow quality of `comp-reference.png`. No wood, no dark room,
  no props. The covers are the only saturated color in the scene.
- **Inspection view: the seamless studio.** The same world the covers were
  photographed in: a studio infinity cove — floor curving into backdrop with no edge,
  no seam, no horizon line, no corners. **A full 360° horizontal orbit at every
  permitted pitch must reveal zero environment boundaries or artifacts.** Clamp
  vertical orbit to keep the camera out of the floor, but the horizontal orbit is
  unrestricted. Ground the book with a soft real shadow; keep the background quietly
  responsive to the book's ground color if that helps the cover read, but never
  saturate it.
- Both environments ship in a **light and a dark variant** (set via parameter,
  matching the site's `[data-theme]`): light = warm bone; dark = deep warm charcoal,
  never blue-black. The books themselves are identical in both; against the dark
  variant they glow.

**7 · The editorial panel** is real HTML beside/over the canvas (not baked into WebGL),
styled with the design tokens below: book title, a one-line promise, one small
metadata line in DM Mono ("Version 2 · 9 languages" pattern), the primary button, and
a quiet "Back to the shelf" affordance. Sentence case. No pill buttons (pill radius is
reserved for tiny status tags, which the panel does not currently need).

**8 · Deterministic state machine.**
`shelf → selecting → opening → inspecting → reading → closing → shelf`, time-based
interpolation, exact endpoints (first and final pose of every transition match resting
geometry exactly — prove it with first/mid/penultimate/final frame screenshots).
Reparenting the selected book between shelf and inspection stages must never produce a
last-frame jump. No state exists from which the module cannot cleanly return to the
shelf.

**9 · Progressive enhancement.** The module boots from a static fallback: a plain row
of real cover `<img>` elements (from the manifest) that is ALSO the reduced-motion and
no-WebGL experience. WebGL upgrades it in place when ready; if the context is lost, it
degrades back without an error screen. `prefers-reduced-motion`: static row, no wheel
capture, transitions become instant swaps or simple fades.

## The Shelf API (ES module, no framework, no bundler)

```js
const shelf = new Shelf({
  container,                       // host element
  manifest: "covers/covers-manifest.json",
  bookAsset: { model: "book-asset/models/book.glb" },   // per book-asset README
  mode: "hero",                    // "hero" | "inline"
  theme: "light",                  // "light" | "dark"
  locale: "en", dir: "ltr",        // "rtl" mirrors layout, controls, and browse direction
  strings: {...},                  // ALL visible text injected; nothing hardcoded
  titles: {...},                   // localized title per slug (baked via textbake)
  onNavigate: (slug) => {},        // fired ONLY by the panel's primary button
  onSelect: (slug) => {},          // selection changed (for the host's own UI)
});
shelf.next(); shelf.previous(); shelf.goTo(slug);
shelf.inspect(slug); shelf.closeInspection();
shelf.setTheme(t); shelf.setLocale(locale, dir, strings, titles);
shelf.destroy();
```

Selection affordances scale with the library: position markers up to ~12 books; above
that, a counter ("127 / 300" in DM Mono) with a thin progress line.

## Design tokens (the law for every HTML element you render)

- Canvas `#FFFFFF` · warm band `#EBE7DF` · surface `#F7F6F3` · hairline `#EAEAEA` (1px,
  the only border weight) · ink `#111111` · ink-secondary `#787774`.
- Dark: canvas `#161615` · band `#1D1C19` · hairline `rgba(255,255,255,0.08)` · ink
  `#F2F0EC` · ink-secondary `#8F8B85`. Primary button inverts (bone with ink text).
- Type: DM Sans for everything UI (weights 400/500/600, sentence case); DM Mono 12.5px
  for machine facts only. Newsreader appears ONLY inside the book via textbake.
- Buttons: solid ink, white text, 6px radius, no shadow, hover `#333333`, active
  scale(0.98). Radii: 4/6/8/12px only. No pills except tiny status tags. No gradients,
  no glassmorphism, no glows, no emojis, no em-dashes in any visible string.
- Motion: 150–200ms interactions, `cubic-bezier(0.16,1,0.3,1)`, transform/opacity only.
  The 3D choreography follows its own deterministic timelines.

## Build order — mechanics before beauty (hard rule)

Work in layers; do not start a layer before the previous one demonstrably works in the
harness. Save a screenshot set at the end of every layer to `screenshots/` AND publish
it with SaveFile so the owner can peek at milestones asynchronously.

1. **L1 The loop** — manifest → windowed ring of Book instances (closed books, real
   covers), continuous browse via buttons/keys, hidden wraparound, snap-to-center.
   Prove N=3 and N=300 (cycled manifest) both loop seamlessly at 60fps.
2. **L2 Hero input model** — wheel browsing with damped snap; the bottom arrow
   (hover releases wheel, click scrolls the harness page below); capture only while
   the stage fills the viewport; touch semantics; inline mode with no capture.
3. **L3 The alcove** — niche geometry, rounded inner corners, lighting, contact
   shadows, light + dark variants. Compare against `comp-reference.png` by eye.
4. **L4 Inspection** — deterministic shelf→inspection transition, 360° orbit on the
   infinity cove (sweep screenshots at 12 azimuths × 2 pitches: zero visible edges),
   hover-crack, open, page drag via the Book API, the editorial panel + onNavigate.
5. **L5 Scale + streaming** — distance-based texture resolution, memory sanity,
   marker/counter switchover, instance recycling under fast browsing.
6. **L6 i18n + fallback** — RTL mirror (browse direction, controls, panel), Arabic +
   CJK title bakes on shelf and in inspection, static fallback row, reduced motion,
   context-loss recovery.
7. **L7 Optimization + packaging** — frame budget via `renderer.info` (not vibes),
   then the FINAL ACTION below.

## The QA loop (you have no GPU — design for it)

Visual verification runs through the harness in headless Chromium via Playwright with
software WebGL, exactly like the book package was built:

```bash
pip install playwright && playwright install chromium
python3 -m http.server 4173 &
# screenshot script: chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader"])
```

Write `scripts/shoot.py` once: loads the harness with pose parameters
(`?pose=shelf|browse|n3|n300|inspect|open|orbit{az}-{pitch}|rtl|dark|fallback`), waits
for a render-ready flag, screenshots each pose. After every meaningful change: shoot
the set → **look at the images with your own vision** → fix what a museum
photographer would flag. Zero console errors or warnings in the harness, ever.

## Hard bans

- No wheel capture outside hero mode with the stage filling the viewport. No capture
  ever on touch vertical swipes, in inline mode, in fallback, or under reduced motion.
- No navigation from any book interaction; `onNavigate` fires from the panel button only.
- No procedural cover art, no modification of the production covers, no cloth, no
  foil, no gloss, no gold, no wood, no dark blue-black.
- No visible environment boundary in inspection at any permitted camera angle.
- No realtime cloth simulation, no physics engines, no bones for pages (the Book
  package already solved pages; use its API).
- No npm build toolchain: plain ES modules + import map, same pinned Three.js version
  as the book package.
- No analytics, no network calls beyond loading the provided assets and pinned CDNs.
- Never fake a screenshot or skip the look-at-it step; the loop is the method.

## FINAL ACTION — packaging

1. Run the full acceptance checklist; record each item in `ACCEPTANCE.md` with the
   screenshot filename that proves it.
2. `git init`, commit everything with a clean history.
3. Zip `shelf-asset/` and publish it with SaveFile so the owner can download it and
   hand it to the site-integration agent.
4. Post a final report: what was built, the API in five lines, known limitations, and
   the three screenshots you are proudest of.

## Acceptance checklist (definition of done)

- [ ] Harness loads with zero console errors; static fallback row renders before WebGL
- [ ] Continuous loop seamless at N=3 and N=300 (cycled manifest), wraparound invisible
- [ ] All 10 real covers render pixel-true; `spineColor: "auto"` matches every spine/back
- [ ] Hero mode: wheel browses with damped snap; bottom arrow hover releases the wheel
      (page below scrolls); arrow click smooth-scrolls the harness page; scrolled past
      the stage, the module never intercepts until fully back in view
- [ ] Inline mode: wheel never captured; drag/buttons/keys browse
- [ ] Touch: vertical swipe scrolls page, horizontal browses, tap selects (documented,
      emulated where possible)
- [ ] Keyboard: arrows browse on focus, Tab escapes, Escape exits inspection; all
      controls named and focusable; aria-live announces selection
- [ ] Shelf→inspection transition deterministic: first/mid/penultimate/final frames
      show exact endpoints, no last-frame jump either direction
- [ ] 360° orbit sweep (12 azimuths × 2 pitches) shows ZERO environment edges, seams,
      horizon lines, or artifacts
- [ ] Hover-crack, click/drag open, page drag both directions; committed pages never
      spring back; drag the cover closed from the first page
- [ ] Panel button is the only source of `onNavigate` (harness logs prove no other
      interaction fires it)
- [ ] Light and dark environment variants both pass; books identical between them
- [ ] RTL: layout, controls, and browse direction mirror; Arabic and CJK titles baked
      correctly on shelf and in inspection
- [ ] `prefers-reduced-motion`: static row, no capture, instant transitions
- [ ] WebGL context loss degrades to the static row without an error screen
- [ ] 60fps browsing with streaming active at N=300 (verified via `renderer.info`
      draw calls + frame timing, not vibes)
- [ ] README documents API, events, params, strings/titles contract, and a
      step-by-step integration guide for the site agent
- [ ] Package zipped and delivered via SaveFile
