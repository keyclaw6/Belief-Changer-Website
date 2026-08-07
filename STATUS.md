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

**Cover system — `skills/cover-generation/SKILL.md` ("The Specimen Series")**
One grammar for every book: full-bleed museum-restraint still life, one specimen
object, muted seamless ground, textless (titles overlaid at runtime per language).
Reproducible via anchor + edit-endpoint consistency protocol.

**Site imagery system — `skills/site-imagery/SKILL.md` ("The Life Outside")**
Owner-locked 2026-08-07 after three exploration rounds. Two voices under one law —
"photography states the facts; painting shows the life": The Painted Life (lead,
fine-line classical oil per the owner's anchor painting, modern scenes, freedom
legible) and The Quiet Fact (the cover grammar in real hopeful places, no people).
Feeling contract, templates, slot rules, rejected directions, and QA in the skill;
anchors + 4 canon references with exact prompts in its `references/gallery.md`.
DESIGN.md Imagery section updated to match. Production site images will live in
`assets/site/`.

**Production assets — `assets/covers/`**
10 covers generated and QA'd (sugar · smoking · scrolling · porn · alcohol · gaming ·
junk food · vaping · overthinking · complaining), all textless, series-anchored.
Spine + back textures derived for all 10 (`derived/`), exact ground hexes and
contrast-correct overlay inks in `covers-manifest.json`. With-text typography proofs
in `proofs/`.

**Website v1 front end — `site/` (Phase 4, built 2026-08-07)**
TanStack Start + TS + Tailwind v4 (restyled shadcn), SSR everywhere, en/da/ar with
full RTL, every SITE-PLAN route: home (locked beat order, static ShelfStage), library
with finder, book page with changelog tab + anonymous improve form, reader with
comfort modes, request and experience boards, blog, how-it-works, about, privacy,
flicker 404 (misprinted-park painting). Self-hosted fonts, DESIGN.md tokens,
production imagery via `skills/site-imagery/`, measurement stub + `docs/MEASUREMENT.md`.
Gates: taste-skill §14, both themes, RTL, reduced motion, zero console errors,
build + typecheck clean. Name locked: **Belief Changer**.

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

1. **QA the book asset** when its package lands (check against its ACCEPTANCE.md).
2. **Fire the shelf agent**: hand a fresh Opus agent the book package + this repo +
   `prompts/BOOKSHELF-BRIEF.md` (v2, integration-ready). It builds the shelf module
   and integrates it into the homepage hero by upgrading `<ShelfStage />` in place.
3. **Owner review + iteration** of the v1 site on rendered evidence, one decision at
   a time. Open items: final hero composition (with the 3D shelf), logo decision,
   privacy-page data controller entity + public contact channel, domain acquisition
   (beliefchanger.com is registered to a third party, GoDaddy, expires 2028-06;
   beliefchanger.net is unregistered).
4. **Backend phase** (deliberately later): implement `docs/MEASUREMENT.md` and the
   POST contracts in `docs/SITE-PLAN.md` (feedback, requests, votes, experiences).

## Fixed laws (from VISION.md — the site serves these)

- Free forever, every language, every format; no signup, no tracking, no paywall.
- Warm to the person, harsh to the trap. Never shaming. First-person subject names.
- Books are living: versioned, publicly changelogged, improved by reader feedback.
- The library self-evolves: feedback loop, request loop, splitting loop.
- Must feel complete at 3 books and scale to 3,000.
