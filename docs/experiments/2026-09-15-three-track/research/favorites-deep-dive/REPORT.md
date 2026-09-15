# Favorites deep-dive — KEEL × Av1d Image 2.5 course (2026-09-15)

Scope: only the two user favorites. Read-only; both repos untouched. Isolated browser used
(agent-browser session `keel-audit`, no user tabs); X via authenticated `twitter` CLI.
Only verified claims below; speculation is labeled as such.

## A. KEEL — https://motionsites.ai/?prompt=keel

### A1. What KEEL actually is (verified)
- KEEL is a **card in the MotionSites prompt gallery/marketplace**, not a live website. The
  `?prompt=keel` URL opens the gallery with the Keel detail modal: video preview left,
  "Keel / Creative / 25 likes / Go Unlimited" right. No demo, preview, or live-site link
  exists anywhere in the page DOM (verified: zero links matching keel/demo/preview/live).
- The "original KEEL prompt" is **paywalled** ("Unlock prompt" / "Go Unlimited"). No published
  prompt found: X search for keel+motionsites returns only stock-ticker noise and one
  promoter (@viktoroddy). **No verifiable original prompt exists in public.**
- Gallery stack (DevTools-visible, no guessing): Vite-bundled SPA (`/assets/index-*.js`),
  Google Fonts, GTM + Meta pixel + paritydeals promo scripts, 40 muted autoplay loop
  `<video>` elements, **0 `<canvas>` / 0 iframes** — the gallery itself is DOM + video.

### A2. The KEEL preview asset (verified bytes)
- `https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/keel-landing.mp4` —
  HTTP 200, `video/mp4`, **4,864,099 bytes, 7.0 s, 1920×1418, H.264 40 fps + AAC**,
  Last-Modified 2026-09-11 (curl headers). Posters via `images.higgs.ai` (Higgsfield).
- Local copy: `keel/keel-landing-full.mp4`. Frames: `keel/keel-frame-start.png`,
  `keel-frame-mid.png`, `keel-frame-end.png`. Page shots: `keel/01-gallery-desktop.png`
  (modal open, 1440×900), `keel/02-gallery-mobile.png` (390×844, stacks cleanly).

### A3. Visual analysis (from extracted frames, all three viewed)
- **Subject**: liquid-chrome classical statues (heroine with orb + light rings; robed
  crowd; youth holding chrome pear) on saturated blue sky. Serif headline
  "Keel helps you emerge.", subline, black pill CTAs, hairline survey grid with
  crosshair markers, eyebrow labels ("ON CALL FOR YOU", "THE SHARE").
- **Why it feels premium**: single hero material (chrome = one coherent reflection story),
  strong key light with star-burst speculars, shallow depth staging (statue rows recede),
  slow push-in camera (the 7 s loop drifts/scales, no cuts), DOM-style overlay grid that
  reads as "designed", generous negative sky.
- **What it is technically**: an AI-generated (Higgsfield-pipeline) video of a landing
  concept with baked-in copy — i.e. a **raster design concept in motion**, exactly the
  class the Av1d article warns about (article: "turning them into working apps or websites
  requires implementation and interaction checks"). There is no evidence any corresponding
  live site exists; treat KEEL as **art direction + camera reference, not implementation**.

### A4. Transferable vs incompatible (Belief Changer laws)
- STEAL: chrome-as-single-material discipline → BC equivalent is "covers are the only color";
  slow single-axis push-in as the maximum sanctioned camera move; hairline survey-grid
  overlay (already BC's structural element); baked copy zones composed as live-DOM regions.
- INCOMPATIBLE: saturated blue + chrome triumphalism (BC: relief/lightness, bone/ink,
  "never glamour"); baked-in headline text (BC textless law — any such plate needs an
  inpaint pass, keeping layout zones only); 4.9 MB/7 s autoplay video as hero (BC
  stillness + performance laws — a 1-frame poster with optional ≤4% drift is the ceiling).

## B. Av1d — "How to Master ChatGPT Images 2.5 (Full Course)"

- Source: https://x.com/Av1dlive/status/2098055179761525165 (2026-09-10; 1020 likes,
  2299 bookmarks, 39 replies). Body is a link to X Article 2098012383679819776; the
  `twitter article` API returns not_found, but the full article text (22,725 chars) is
  embedded in the tweet payload — recovered verbatim to `av1d/article-text.txt`
  (full thread in `av1d/thread-raw.txt`).
- Author cost basis (verbatim): "I spent along approximately 6 hours to test these new
  methods." Tooling note (verbatim): "Written using Typeless. Edited using Deepseek V4-Flash".
  Limits disclaimer (verbatim): "the tool didn't expose the executing model, variant, seed,
  or quality setting. these studies cannot compare GPT Image 2.5 with earlier versions."

### B1. Concrete workflow (author's words, then what it means)
1. **Brief order** (verbatim): "1. purpose… 2. canvas… 3. contents… 4. relationships…
   5. appearance… 6. checks" + rule "every sentence should make a visible decision or
   protect one." → BC use: brief every hero/shelf plate in this order; checks = textless,
   RTL-safe, theme-parity.
2. **Attribute binding** (verbatim): "a useful prompt names objects, gives the right
   attributes to each object, and explains their relationships." → BC use: bind palette
   words to specific objects ("bone wall", "sage cover"), never floating adjectives.
3. **What-survived audits**: every worked example lists "what survived / what missed"
   (e.g. rust sofa + circular window kept, left margin missed; perfume label kept, cap
   taller). → BC use: adopt as the QA ritual for every generated plate.
4. **Reconstruction JSON**: inventory canvas→groups→objects→parts→properties; separate
   visible facts / inferred / unknowns; change→preserve→allow edits; validated case kept
   "1122 × 1402" dimensions with redrawn textures ("visually close, without pixel
   identity"). Failure datapoint (verbatim): "our 82,283-character JSON exceeded a
   32,000-character limit" — keep inventories small. → BC use: the vehicle for iterating
   on hero/shelf scenes without touching locked covers.
5. **Reference roles**: identity / layout / finish tables; "say which reference controls
   each decision and what should be ignored"; "a front view cannot reveal the back of a
   package" (ask for the missing view or label additions as choices). → BC use: anchor
   painting = finish reference with explicit ignore-list.
6. **Comment / map / sketch**: change→preserve→allow ("change this cap to charcoal black.
   preserve its wood grain… keep the bottle, label, framing… allow the cap's highlights…
   to adjust"); "draw the placement. describe the finish"; "check placement before
   realism." → BC use: layout-first approvals before any finish spend.
7. **Small edits + best-source rule** (verbatim): "return to the best accepted source.
   don't carry accidental damage forward." → BC law-compatible versioning.
8. **Measurement caution**: infographic bars measured 87.1/49.8/39.2/20.9% vs 90/50/40/20%
   spec — "beautiful images can contain quiet errors"; production step = re-render data
   graphics in code. → BC use: never ship AI-rendered text/geometry as functional UI.
9. **Agent loop**: coordinator locks source/checks; generators log prompts+attachments;
   reviewer inspects under neutral filenames; fixed budget; acceptance vs prior best.
- Replies (verified, in `thread-raw.txt`): brand-color/logo fragility → author: "that's why
  the reconstruction json exists" (@adiix_official); skills interoperable with existing
  Nano-Banana/image skills — "yes it can" (@khauf0007); banner + article art both ChatGPT-made.
- NOT recoverable: the "full submitted text" prompt links are article embeds absent from the
  text extraction — **no verbatim full generation prompt could be recovered**; do not claim
  otherwise. Related "5 agent skills" post is a different tweet, out of scope.

## Ranked visual-reference dossier
1. **KEEL video frames** — best camera/material reference (slow push-in, single-material
   discipline). `keel/keel-landing-full.mp4`, `keel-frame-{start,mid,end}.png`.
2. **Av1d article text** — best process reference (brief order, survived-audits,
   reconstruction JSON). `av1d/article-text.txt` (verbatim, 413 lines when read).
3. **Motionsites gallery page** — best marketplace-pattern reference (video-card grid,
   paywalled prompt, R2 media). `keel/01-gallery-desktop.png`, `keel/02-gallery-mobile.png`.
4. **Veyra repo docs** (prior pass, still strongest implementation reference): authored-media
   site with reduced-motion timers-immediate rule — `visual-audit/new-finds/veyra-*.md`.

## 'Steal the mechanism, not the surface' playbook
1. Brief plates purpose→canvas→contents→relationships→appearance→checks; ban floating adjectives.
2. Compose layout zones first (sketch/rectangles), finish second; approve placement before realism.
3. Iterate via reconstruction inventory + change→preserve→allow; always return to best source.
4. Ship at most one slow single-axis camera move (poster-first, ≤4% drift, motion-killed);
   light stays baked, mood via swapped states.
5. Audit every plate with a what-survived list; re-render any data/text UI in code, never AI pixels.
6. Keep covers immutable; new scenery quotes their grounds; all copy live text (inpaint any
   baked words); verify RTL, both themes, and 390×844 before calling anything done.
