# SITE-BUILD-BRIEF.md — The Website (Phase 4, front end)

You are an Opus 5 engineering agent with a full sandbox building **the complete
front end of the Belief Changer website** — a free, multilingual library of
belief-change books. People arrive carrying something heavy; the site must feel like
a calm, beautiful, well-run reading room that celebrates the way out. You are being
judged on one question: **does this feel like a quietly world-class editorial product,
or like a template?**

The repository at `~/workspace/Belief-Changer-Website` is your world. It already
contains everything: the design contract, the structural plan, the craft skills, the
finished cover art, and the finished site imagery. You generate no images and invent
no structure — you build what the plan says, with excellence in every detail the plan
leaves to you.

## Read first, in this exact order

1. `AGENTS.md` — precedence and laws (DESIGN.md > AGENTS.md > skills > defaults)
2. `VISION.md` — why this exists (read once, carry it)
3. `DESIGN.md` — the design contract: tokens, components, voice. Your visual law.
4. `docs/SITE-PLAN.md` — the structural authority: sitemap, flows, copy deck,
   fixtures, measurement contract, imagery manifest, shelf slot contract
5. `skills/taste-skill/SKILL.md` — craft law; §14 is your final gate, every box
6. `skills/minimalist-skill/SKILL.md` — craft law where DESIGN.md is silent
7. `image-generation/site-imagery/SKILL.md` — context for the imagery you are placing
8. `assets/covers/covers-manifest.json` — the book catalog (10 books)
9. `design/reference-homepage.html` — rendered ground truth for the homepage feel
   (open it, study both themes; your homepage supersedes it only where SITE-PLAN says)

## Hard boundaries

- Work ONLY inside a new `site/` directory (plus generating `docs/MEASUREMENT.md`).
  Never modify `assets/`, `skills/`, `prompts/`, `design/`, or any root `.md`.
- NEVER run `git commit` or `git push` — the reviewer owns version control.
- NO 3D, NO Three.js, NO bookshelf animation — the shelf arrives in a later phase.
  Build the `<ShelfStage />` static cover row exactly per SITE-PLAN's contract.
- NO backend: mock per SITE-PLAN's contracts, document, move on.
- NO new images, NO placeholder image services: `assets/site/` and `assets/covers/`
  are the complete image set. Copy them into `site/public/` as needed. Never crop,
  tint, re-light, or overlay gradients onto the covers or the site imagery.
- Respect every DESIGN.md ban: no em-dashes in visible copy, no emojis, no pill
  primary buttons, no brand accent color, pastels only for status semantics, one
  hairline weight, no pure black, no heavy shadows.

## Stack (locked)

- **TanStack Start + TypeScript + Tailwind v4** (Vite-based; SSR on every content
  route — chapters, book pages, boards must render complete HTML server-side).
- **shadcn/ui** components as mechanical base where they genuinely help (dialogs,
  tabs, accordions, form primitives) — **fully restyled by the DESIGN.md tokens; not
  one default shadcn pixel may survive.** Radix primitives directly are equally fine.
- **motion/react** for UI motion (barely-there, per DESIGN.md Motion; full
  reduced-motion fallbacks).
- Fonts self-hosted: download DM Sans (400/500/600), DM Mono (400/500), Newsreader
  (400 + italic) as woff2 from the Google Fonts hosts into `site/public/fonts/`,
  serve via `@font-face` with `font-display: swap`. No font `<link>` tags.
- Tokens: every color/size/radius from DESIGN.md front-matter becomes a CSS variable
  set once at the root; light + dark under `[data-theme]` with `prefers-color-scheme`
  default and a quiet manual toggle. Newsreader appears ONLY in the reader surface.
- Icons: Phosphor, one strokeWidth globally.
- `site/.gitignore` for node_modules, build output, caches.

## First action — network check

Run `curl -s -o /dev/null -w '%{http_code}' https://registry.npmjs.org/react`.
If it returns 403, network approval is still pending: print a clear notice, wait 120
seconds, retry (up to 30 minutes) before starting installs. Font hosts
(fonts.googleapis.com / fonts.gstatic.com) are already reachable.

## What to build (SITE-PLAN.md is the authority; summary only)

All routes under `/{locale}/`: Home (hero + trust strip + reframe + three method
beats + living books + next-book votes + experiences + footer, in that exact order),
Library with client-side finder filtering (title/subject match; no-match state offers
the request board and fires `finder_no_match`), Book page (actions, version block,
changelog TAB, improve-this-book guided form, experiences excerpt), Reader (SSR
chapters, 65–70ch Newsreader, light/sepia/dark comfort modes restyling the reading
surface only, chapter nav, reading position in localStorage), How-it-works, Request
board (ranked, one-tap vote, submit flow), Experience board (filterable, submit),
Blog (index + 3 posts you write in register), About (mission, laws, the honesty note
about aggregate counting), 404. Language switcher (native names), `en` complete +
`da`/`ar` core strings, `ar` proves full RTL mirroring. Measurement module and
`docs/MEASUREMENT.md` per the plan.

Use the copy deck verbatim for canonical strings. Everything else you write yourself
in register: warm to the person, harsh to the trap, sentence case, no exclamation
marks, zero em-dashes, no AI clichés, nothing shaming. The two books with sample
chapters (scrolling ×3, sugar ×1) deserve real craft: second person, plain and kind,
the belief taken apart calmly — 500–800 words each, marked as sample content in code
comments only (never in the UI).

## Craft expectations (this is where you earn the run)

- Declare your taste-skill design read + dials at the top of `site/README.md`.
- Section rhythm per taste-skill: ≥4 layout families per page, eyebrow rationing,
  exact cell counts, no zigzag runs, quotes ≤3 lines.
- Empty states are content: `Being written`, `Gathering voices`, `No experiences for
  this book yet — yours could be the first.` Design them properly.
- Hairline-and-whitespace discipline on the boards (request board, changelog tab,
  library grid) — these data surfaces are where Quiet Editorial proves itself.
- Both themes checked on every page; the covers glow against the dark canvas.
- WCAG AA everywhere; labels above inputs; ink focus rings; keyboard navigation;
  aria-live on form success; forms fully usable without JavaScript where feasible
  (SSR-friendly progressive enhancement).
- Zero console errors or warnings.

## Build order

M1 scaffold + tokens + fonts + layout shell (nav, footer, theme toggle, locale
machinery) → M2 Home → M3 Library + Book page + Reader → M4 Requests + Experiences +
Blog + About + 404 → M5 i18n/RTL completion + measurement + polish + gates. Breadth
before polish: get every page standing before gold-plating any single one.

## Definition of done

- `npm run build` (production) passes clean; typecheck passes; dev server serves all
  routes SSR (curl each route and confirm real content in the HTML).
- taste-skill §14: every box honestly ticked (list any exception with justification
  in README — there should be none).
- DESIGN.md Do's and Don'ts audited; both themes; RTL pass on `ar`; reduced-motion
  pass; zero console errors.
- `site/README.md`: design read + dials, how to run, structure map, decisions taken
  where the plan left room, deferred items, gate report.
- Final message: what you built, the gate report in five lines, and the three
  decisions you are proudest of.
