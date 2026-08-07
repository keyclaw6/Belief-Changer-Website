# STATUS — Belief Changer Website

Last updated: 2026-08-07

## Done and locked

**Design contract — `DESIGN.md` ("Quiet Editorial")**
White canvas / warm bone band alternation, hairline structure, ink-only interaction,
crisp radii (pills for small tags only), four pastel status semantics, split hero
with the shelf as the hero asset, DM Sans + DM Mono + Newsreader (reader only), full
light/dark theming, i18n + RTL from day one. Rendered ground truth:
`design/reference-homepage.html` (both themes via the toggle).

**Craft baseline — `skills/`**
taste-skill v2 and minimalist-skill adopted; `AGENTS.md` fixes precedence
(DESIGN.md > AGENTS.md > skills > defaults), pins the design read and dials, and
carries the mechanical bans and quality gates.

**Cover system — `prompts/COVER-SYSTEM.md` ("The Specimen Series")**
One grammar for every book: full-bleed museum-restraint still life, one specimen
object, muted seamless ground, textless (titles overlaid at runtime per language).
Reproducible via anchor + edit-endpoint consistency protocol.

**Production assets — `assets/covers/`**
10 covers generated and QA'd (sugar · smoking · scrolling · porn · alcohol · gaming ·
junk food · vaping · overthinking · complaining), all textless, series-anchored.
Spine + back textures derived for all 10 (`derived/`), exact ground hexes and
contrast-correct overlay inks in `covers-manifest.json`. With-text typography proofs
in `proofs/`.

## In production (separate agent, running now)

**The 3D book asset** — a dedicated agent is building the photoreal hardcover:
Blender (headless bpy) authors the static master geometry -> GLB; Three.js animates
(procedural page deformation, page-block thickness trick, deterministic state
machine); runtime canvas text baking for any language; `spineColor: "auto"` sampled
from any cover. Its standing brief: `prompts/BOOK-ASSET-BRIEF.md`. Deliverable: a
zipped `book-asset/` package (models/book.glb + src/Book.js + src/textbake.js +
harness + README + ACCEPTANCE.md). Architecture rationale:
`docs/book-asset-pipeline-proposal.md`.

## Next (in order)

1. **QA + integrate the book asset** when its package lands (check against its
   ACCEPTANCE.md; wire `assets/covers/covers-manifest.json` into its Book API).
2. **Author `prompts/BOOKSHELF-BRIEF.md`** — the Three.js shelf experience where the
   books are browsed (continuous shelf, wheel/keys/markers navigation, click into a
   deterministic detail view, page-turn preview), consuming the book package's API
   and the covers manifest. Progressive enhancement: static cover row fallback
   (reduced-motion / no-WebGL).
3. **Full-site plan** — information architecture and page briefs for the whole site
   (home, finder, library, book page, reader, audio, request board, about/changelog),
   multilingual + RTL + SEO (every chapter server-rendered and indexable; no signup,
   no tracking), plus the image-generation plan: which photographic assets each page
   needs, produced with gpt-image-2 following `prompts/COVER-SYSTEM.md` patterns.
4. **Build.**

## Fixed laws (from VISION.md — the site serves these)

- Free forever, every language, every format; no signup, no tracking, no paywall.
- Warm to the person, harsh to the trap. Never shaming. First-person subject names.
- Books are living: versioned, publicly changelogged, improved by reader feedback.
- The library self-evolves: feedback loop, request loop, splitting loop.
- Must feel complete at 3 books and scale to 3,000.
