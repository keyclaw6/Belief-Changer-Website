# BOOK-ASSET-BRIEF.md — The Photoreal Book (Phase 2)

> **HISTORICAL.** The hardcover landed as a compiled HTML runtime in
> `book-asset/`, not the GLB + `Book.js` package this brief specified. Do not
> restart this pipeline. New titles: `book-asset/SKILL.md`.

You are an Opus 5 engineering agent with a full sandbox: shell, filesystem, Python, and
vision (you can read the screenshots you take). You are building **one reusable, deeply
realistic 3D book asset for the web** — a hardcover that opens, closes, and turns pages
so convincingly that everything you make will be judged by one question:
**does this look and move like a real book, or like a website pretending?**

This brief is complete and self-contained. You receive no other materials — by design:
your entire attention belongs to this one object. Later agents will integrate your asset
into a larger site; your only customer is the next agent, and your only deliverable is
the package described below. Work autonomously through the milestones. Only ask the
owner a question when you are truly blocked; he approves your first action and walks away.

---

## FIRST ACTION — before anything else

Request sandbox network access (RequestNetworkAccess) for ALL of these domains in your
very first turn, so the owner can approve once and leave:

| Domain | Why |
|---|---|
| `pypi.org` | pip package index |
| `files.pythonhosted.org` | pip wheel downloads (bpy, playwright) |
| `download.blender.org` | fallback Blender binary if the bpy wheel fails |
| `cdn.jsdelivr.net` | pinned Three.js ES modules for the harness |
| `cdn.playwright.dev` | headless Chromium download |
| `playwright.azureedge.net` | Playwright browser CDN mirror |
| `fonts.googleapis.com` | serif font for runtime text baking |
| `fonts.gstatic.com` | font file host |

Do not proceed to installs until access is granted.

---

## What you are building

A **hardcover trade book**: matte printed paper-over-board, straight spine, sharp
silhouette, cream page block. Think of the physical presence of a book from a prestige
contemporary publisher — an object a careful publisher spent years on: calm, exact,
physical. It opens, closes, and turns one page at a time with convincing physical
movement. One master asset serves an entire future library — covers, spine, back, page
count, thickness, and dimensions are per-instance parameters, and titles are composited
onto the textures at runtime in any language.

You may browse real photography of hardcover books (three-quarter product shots, open
books, spines, page blocks) for visual reference whenever it helps — you are your own
art department.

**Cover art:** you receive none, deliberately. Generate your own placeholder covers with
a small script: seamless muted studio-backdrop grounds (e.g., dove gray, sage, slate
blue, terracotta), textless, 2:3 portrait, with a very subtle vignette and fine grain.
The real cover artwork arrives in a later phase and will be exactly this kind of image:
a full-bleed textless photograph on a muted seamless ground. Your job is that ANY such
2:3 image drops in as a front-cover texture with zero code changes.

**The deliverable is a package consumable without reading your code history:**

```
book-asset/                     ← git-initialized repo
  models/book.glb               ← master asset
  src/Book.js                   ← ES-module runtime component (Three.js)
  src/textbake.js               ← canvas text-baking (cover/spine/back, any language)
  scripts/book_generator.py     ← bpy script that builds and exports book.glb
  harness/index.html            ← dev/QA page (plain HTML + pinned Three.js from CDN)
  assets/placeholder-covers/    ← your generated test covers
  screenshots/                  ← milestone evidence, named by layer
  README.md                     ← API docs, GLB node-name contract, params, usage
  ACCEPTANCE.md                 ← the checklist below, each item marked with evidence
```

## Architecture — locked decisions (do not relitigate)

**1 · Blender models. Three.js animates.**
Headless Blender (`pip install bpy`; fallback: Blender tarball from download.blender.org
run as `blender --background --python …`) builds the **static master geometry only** and
exports GLB: front/back boards with beveled edges and hardcover overhang, straight spine,
hinge grooves, left/right page blocks, page-edge geometry, headbands, endpaper surfaces,
one subdivided active-page plane (32+ segments across, enough rows to twist), clean UVs,
named nodes, material slots. **Blender never renders and never rigs bones.**
The **active page's deformation lives in Three.js**: procedural vertex/shader deformation
driven by high-level parameters — turn progress, curl, curl radius, stiffness, spine
resistance, gravity sag, upper/lower corner lag, twist, landing softness. Deterministic:
the same inputs always produce the same pose; progress 0 and 1 match the resting
geometry exactly.

**2 · The page-block trick.** Non-moving pages are two solid blocks whose thicknesses
re-apportion as pages turn (120|80 → 119|81). Hundreds of pages, three animated meshes:
active page + two blocks. Page-edge texture gives the blocks their stacked-paper look.

**3 · Binding behavior.** The book must not be two rigid slabs on a piano hinge: covers
rotate around the binding with slight spine flex, compression at the hinge, page blocks
fanning subtly with opening angle, inner pages constrained near the spine, natural gaps
between board and block, and it need not lie perfectly flat when open. Parameterize
opening angle; expose it in the API.

**4 · Materials — locked scope.** Matte printed paper-over-board (very low sheen,
subtle roughness variation, micro paper-grain normal), cream page block with fine
page-edge lines, cream endpapers. **No cloth, no leather, no gloss.** Cover textures are
photographic prints: treat them as albedo — never re-light them in the texture, never
tint them; the scene's light does the modeling. sRGB in, correct output color
management, neutral studio-style environment lighting with soft shadows.

**5 · Multilingual text baking (a core requirement).**
Cover textures are always textless. `src/textbake.js` composites, at runtime, onto
canvas copies of the textures before GPU upload:
- **Front**: title in an elegant classical serif (load "Newsreader" from Google Fonts as
  default; font-family a parameter), centered in the upper negative space; ink parameter
  `dark` (warm charcoal `#2F3437`) or `light` (warm bone `#F5F1E8`); a small letterspaced
  serif-capitals series line at the foot (test string: "BELIEF CHANGER").
- **Spine**: title running vertically top-to-bottom, same serif; small series caps near
  the spine foot.
- **Back**: a short placeholder blurb block in the same ink.
Any string, any script: test Latin + one RTL sample (Arabic) + one CJK sample and show
all three baked correctly in screenshots.

**6 · The Book API** (ES module, no framework, no bundler; pinned Three.js via CDN
import map in the harness):

```js
const book = new Book({
  scene, model: "models/book.glb",
  cover: "assets/placeholder-covers/sage.png",   // any textless 2:3 image
  spineColor: "auto",                            // sampled from cover ground, or explicit
  ink: "dark",                                   // overlay ink: dark | light
  title: "The Example Trap",                     // any language
  pageCount: 250,
  previewPages: [tex1, tex2],                    // title page + first spread ONLY
});
book.open(); book.close();
book.nextPage(); book.previousPage(); book.goToPage(n);
book.setOpeningAngle(a); book.setTitle(str, lang);
```

`spineColor: "auto"` samples the cover's ground color from a clean edge region so spine
and back always match the front. Multiple instances share geometry/materials where
possible; each instance has independent state (open/closed, angle, current page,
in-flight turn, transform).

**7 · Scope boundary.** The 3D book shows **preview pages only** (a title page + first
spread; simple placeholder page textures you generate). No shelf, no site, no reader,
no scrollable content. One book, perfected.

## Build order — mechanics before beauty (hard rule)

Work in layers; do not start a layer before the previous one demonstrably works in the
harness. Save a screenshot set at the end of every layer to `screenshots/` AND publish it
with SaveFile so the owner can peek at milestones asynchronously.

1. **L1 Mechanical book** — boards, spine, blocks, GLB export, harness loads it, opens/
   closes, one active page turns with basic curl. Prove the page transfers between blocks
   with thickness re-apportioning.
2. **L2 Page deformation** — full parameter set (curl radius, sag, corner lag, twist,
   landing softness); drag-driven turning (pointer controls progress; release settles
   forward or back deterministically); committed pages never spring back.
3. **L3 Binding behavior** — spine flex, hinge compression, block fanning, non-flat
   opening; hover-crack-open (cover lifts a few degrees on hover).
4. **L4 Geometry details** — bevels, board overhang, rounded page corners, page-edge
   lines, headbands, endpapers, board thickness reading clearly at silhouette.
5. **L5 Materials & light** — matte board response, paper grain normals, page-edge
   texture, neutral environment + soft shadow treatment, color management verified
   side-by-side against real hardcover product photography.
6. **L6 Text baking + instances** — textbake.js on all three surfaces (Latin/RTL/CJK
   proofs); harness scene showing **three instances** with different covers, thicknesses,
   and page counts simultaneously at 60fps.
7. **L7 Optimization + packaging** — poly budget sanity, texture sizes, lazy preview-page
   textures, then the FINAL ACTION below.

## The QA loop (you have no GPU — design for it)

Blender only models, so rendering never happens in Blender. Visual verification runs
through the harness in **headless Chromium via Playwright** with software WebGL:

```bash
pip install playwright && playwright install chromium
python3 -m http.server 4173 &   # serve repo root
# screenshot script: chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader"])
```

Write `scripts/shoot.py` once: loads the harness with a pose parameter
(`?pose=closed|threequarter|spine|open|turn25|turn50|turn75`), waits for a render-ready
flag, screenshots each pose. After every meaningful change: export GLB → shoot the pose
set → **look at the images with your own vision** → fix what a book photographer would
flag. SwiftShader is slow; that is fine for stills. If SwiftShader fails, reduce the
viewport; if Playwright cannot run at all, report it and continue — do not silently stall.

**Determinism bar (non-negotiable):**
- Explicit state machine: closed → opening → open → turning → closing; no state reachable
  from which the book cannot cleanly return.
- Time-based deterministic interpolation; the first and final pose of every transition
  match their resting geometry exactly — sample first/mid/penultimate/final frames of
  each transition in screenshots to prove no last-frame jump.
- `prefers-reduced-motion`: turns become instant page swaps; opening becomes a fade.
- Zero console errors or warnings in the harness, ever.

## Hard bans

- No realtime cloth simulation in the browser. No physics engine dependencies.
- No bones/skinning for the page (procedural deformation only).
- No npm build toolchain: plain ES modules + import map, pinned Three.js version.
- No text baked into the GLB or into saved texture files (runtime canvas only).
- No cloth/leather materials, no gold, no gloss, no decorative ornament.
- Never fake a screenshot or skip the look-at-it step; the loop is the method.

## FINAL ACTION — packaging

1. Run the full acceptance checklist; record each item in `ACCEPTANCE.md` with the
   screenshot filename that proves it.
2. `git init`, commit everything with a clean history (a few meaningful commits are fine).
3. Zip the `book-asset/` folder and publish it with SaveFile so the owner can download
   it and hand it to the next agent.
4. Post a final report: what was built, the API in five lines, known limitations, and
   the three screenshots you are proudest of.

## Acceptance checklist (definition of done)

- [ ] `book_generator.py` runs headlessly start-to-finish and exports `book.glb`
- [ ] Harness loads the GLB with zero console errors
- [ ] Open/close is smooth, deterministic, and never clips or jumps at endpoints
- [ ] Drag a page forward and backward through multiple pages; committed pages never
      spring back; blocks re-apportion thickness correctly
- [ ] Mid-turn pose (progress ≈ 0.5) looks like a real page: curled, slightly sagging,
      corners lagging, near-vertical — verified by eye in screenshots
- [ ] Spine/hinge visibly react to opening; the book does not lie unnaturally flat
- [ ] Silhouette test: a closed book at a three-quarter angle reads as a real hardcover
      product photograph — compared by eye against real reference photos
- [ ] Cover swap test: at least 4 different placeholder covers + thicknesses load with
      zero code changes; `spineColor: "auto"` matches spine/back to each front
- [ ] Titles bake correctly on front, spine, back — Latin, RTL sample, CJK sample
- [ ] Three simultaneous book instances at 60fps in the harness (verify frame budget via
      `renderer.info` draw calls + timing, not vibes)
- [ ] `prefers-reduced-motion` path works
- [ ] README documents API, GLB node-name contract, and every tunable parameter
- [ ] Package zipped and delivered via SaveFile
