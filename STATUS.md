# STATUS — Belief Changer Website

Last updated: 2026-09-05

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

**Cover system — `image-generation/covers/SKILL.md` ("The Specimen Series")**
One grammar for every book: full-bleed museum-restraint still life, one specimen
object, muted seamless ground, textless (titles overlaid at runtime per language).
Reproducible via anchor + edit-endpoint consistency protocol.

**Site imagery system — `image-generation/site-imagery/SKILL.md` ("The Life Outside")**
Owner-locked 2026-08-07 after three exploration rounds. Two voices under one law —
"photography states the facts; painting shows the life": The Painted Life (lead,
fine-line classical oil per the owner's anchor painting, modern scenes, freedom
legible) and The Quiet Fact (the cover grammar in real hopeful places, no people).
Feeling contract, templates, slot rules, rejected directions, and QA in the skill;
the anchor + 12 canon images have exact prompts in `references/gallery.md`. A
2026-08-08 expansion adds 14 owner-review candidates (six unpeopled) with exact prompts,
hashes, and QA in `references/candidates-2026-08-08.md`. Production and candidate site
assets live in `assets/site/`.

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
production imagery via `image-generation/site-imagery/`, measurement stub + `docs/MEASUREMENT.md`.
Gates: taste-skill §14, both themes, RTL, reduced motion, zero console errors,
build + typecheck clean. Name locked: **Belief Changer**.

**3D book runtime — `book-asset/` (landed 2026-08-14)**
The photoreal hardcover is a self-contained HTML runtime (procedural geometry,
troika/MSDF type, reader + shelf variants), not the GLB + `Book.js` package the
Phase 2 brief originally specified. Gold source: `book-asset/books/00-template`
(`The Craft of Attention`). Operating loop for new titles: `book-asset/SKILL.md`.
Compile with `book-asset/scripts/build_book.py`. Do not restart the Blender pipeline.

## Current Orbit release

The homepage uses the dense procedural Orbit in site/public/orbit, with five physical preview leaves, live SDF type, a reliable theme cord, a cozy single-source dark reading lamp, and a preloaded destination view at page eleven. The SSR library and locale/RTL/reduced-motion fallbacks remain. See docs/ORBIT-CLOSEOUT-2026-09-05.md for verification and measured performance changes.

## Remaining product work

1. Continue manuscript production; current chapter availability is not a promise of complete books or EPUB downloads.
2. Resolve the privacy-page data-controller entity/contact details and production-domain choice with the owner. Earlier domain-availability notes are historical, not current checks.
3. Backend contracts for feedback, requests, votes and experiences remain fixtures until explicitly implemented.
4. Future visual changes should preserve the accepted cover assets and be reviewed on real target devices. The source is site/, not the historical experiments.

## Fixed laws (from VISION.md — the site serves these)

- Free forever, every language, every format; no signup, no tracking, no paywall.
- Warm to the person, harsh to the trap. Never shaming. First-person subject names.
- Books are living: versioned, publicly changelogged, improved by reader feedback.
- The library self-evolves: feedback loop, request loop, splitting loop.
- Must feel complete at 3 books and scale to 3,000.
