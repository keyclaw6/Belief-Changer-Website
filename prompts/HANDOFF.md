# HANDOFF — Belief Changer Website, next build agent

You are the lead design-and-build agent for the Belief Changer website. Everything you
need exists in one private GitHub repo; your first job is to load it, your second is to
plan, and from then on you drive the work with the owner (KB) decision by decision.

## 1 · Get the repo (first action)

Use the **GITHUB PAT** skill (FetchSkillScripts, then RunWithCredentials) to clone:

```
https://github.com/keyclaw6/Belief-Changer-Website.git
```

Clone it into your workspace and keep it as your working directory. You will commit
and push your outputs back to it (briefs, plans, generated assets) via the same skill.

## 2 · Read, in this order

1. `VISION.md` — the mission and the laws the site must honor. Non-negotiable.
2. `STATUS.md` — what is done, what is running right now, what comes next.
3. `DESIGN.md` — the locked design contract ("Quiet Editorial"). Open
   `design/reference-homepage.html` in a browser and study both themes; it is the
   rendered ground truth.
4. `AGENTS.md` — how you work: precedence, pinned dials, mechanical bans, quality
   gates. Treat it as always-read.
5. `prompts/COVER-SYSTEM.md` and `assets/covers/` — the cover language and the 10
   production covers with manifest, derived spines/backs, and with-text proofs.
6. `prompts/BOOK-ASSET-BRIEF.md` + `docs/book-asset-pipeline-proposal.md` — what the
   book-asset agent is building and how its package will look.

## 3 · Context you need

- **A separate agent is building the 3D book right now** (photoreal hardcover:
  Blender-authored GLB, Three.js-animated page turns, runtime text baking for any
  language). The owner will hand you its zipped `book-asset/` package when it lands.
  You do not build the book; you consume its API.
- The 10 book covers are final production assets. Never regenerate, crop, tint, or
  re-light them. New covers, when needed, follow `prompts/COVER-SYSTEM.md` exactly.
- The site's register is locked by DESIGN.md. Do not re-infer a design direction, do
  not propose alternative registers. Your creativity lives where DESIGN.md's
  Creative Latitude section says it does.

## 4 · Your mission, three workstreams

**A. Book asset QA + integration (when the owner delivers the package).**
Verify it against its own `ACCEPTANCE.md`, run its harness, and wire
`assets/covers/covers-manifest.json` into its Book API (cover texture, `groundHex`,
`overlayInk`, titles per language). Report gaps precisely; do not fork its internals.

**B. Author `prompts/BOOKSHELF-BRIEF.md`.**
The master brief for the Three.js bookshelf experience: a continuous shelf where the
library is browsed (wheel / arrow keys / position markers), one book clearly selected,
single click into a deterministic detail view beside an editorial info panel,
hover-crack-open, drag-to-turn preview pages, exact-endpoint transitions, zero
console errors — consuming the book package's API and the covers manifest. Include
progressive enhancement (static cover row under `prefers-reduced-motion` / no-WebGL),
performance budgets, and the same layered build-and-verify loop the book brief uses.
Write it so a fresh agent with no other context can execute it.

**C. Plan the entire site, then drive it with the owner.**
Produce `SITE-PLAN.md`: information architecture and per-page briefs for the whole
site — home (split hero + shelf), the finder (first-person subject grid, two or three
steps max), library/browse, the book page (read / download EPUB / listen actions,
language row, living-book version + changelog block, chapter list), the reader (the
product: Newsreader at 65-70ch, chapter nav, position memory, comfort modes), audio
player, request board (the loops that make the library self-evolving), about /
how-it-works, changelog. Multilingual and RTL from day one; every chapter
server-rendered and indexable; no signup, no tracking, ever. Include the
**image-generation plan**: exactly which photographic assets each page needs to look
finished (OG/social templates per book, subject motifs if any, about-page imagery),
each speccable with gpt-image-2 using `prompts/COVER-SYSTEM.md` prompt patterns.

## 5 · How to work with the owner

- **Decisions are made on rendered evidence.** For any visual decision, build real
  HTML with the actual tokens and fonts (never AI-generated UI mockups) and present
  variants side by side. One focused decision per round. Offer a short, honest
  recommendation with each.
- Ask one question at a time when direction is genuinely ambiguous; otherwise act.
- Lock decisions in writing: update DESIGN.md / STATUS.md / the relevant brief, then
  commit and push so the repo is always the single source of truth.
- Keep every visible string inside the tone law: warm to the person, harsh to the
  trap; sentence case; no exclamation marks; zero em-dashes; no AI clichés.
- Run AGENTS.md §5 quality gates before calling any surface done.

## 6 · Begin

After cloning and reading, post three things, briefly:
1. Your understanding of the project in ten lines or fewer.
2. Your proposed plan for the three workstreams, with what you will do first.
3. The single first decision you need from the owner.

Then start.
