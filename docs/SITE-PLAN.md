# SITE-PLAN.md — Belief Changer Website (v1 front end)

Owner-approved structure, 2026-08-07. This file is the structural authority for the
site build: pages, flows, copy, data, measurement. DESIGN.md remains the design
authority; AGENTS.md fixes precedence. Front end only — every backend touchpoint is
documented as a contract and mocked in v1.

## Purpose and register

The site is where the books meet the world. Visitors should feel, before reading a
word, that these books deserve respect — an elegant, calm, quietly beautiful library
that celebrates the way out. Warm to the person, harsh to the trap, in every word.
No signup, no tracking, no cookie banner, free forever, every language.

## Sitemap (every route lives under `/{locale}/`)

| Route | Page | Its one job |
|---|---|---|
| `/` | Home | Make people respect the books, then route them: read, vote, or share |
| `/books` | Library | Every book, browsable and searchable, honest about what's coming |
| `/books/{slug}` | Book page | The book's home: read, download, listen; version story; improve it |
| `/books/{slug}/read/{n}` | Reader | Book-quality reading, nothing else on screen |
| `/how-it-works` | Method | How belief change works, plainly and beautifully |
| `/requests` | Request board | Vote the next book into existence |
| `/experiences` | Experience board | What these books did for real people |
| `/blog` + `/blog/{slug}` | Blog | Updates and stories; the source for social posts |
| `/about` | About | Mission, the laws, the honesty note, open source |
| `*` | 404 | "This page isn't in the library." Calm redirect home |

The changelog is NOT a route: it is a tab/disclosure inside each book page
(version ID, date, what changed, why — no attribution of any kind, ever).

## Homepage flow (order locked by owner)

1. **Hero**: headline + subtext + ask input + primary button, with the shelf stage
   as the hero asset (v1: static cover row — see Shelf slot contract).
2. **Trust strip**: Free forever · No signup · No tracking · Every language.
3. **The reframe**: three plain sentences (copy deck below), quiet band section.
4. **How escape works**: three beats with Voice 1 paintings (see imagery manifest).
5. **Living books**: versions, public changelogs, "the newest version is always the
   one you get" — mono facts, hairline structure.
6. **The next book**: top three vote-leaders from the request board + vote CTA.
7. **Reader experiences**: two or three anonymous excerpts + link to the board.
8. **Footer**.

Respect first, understanding second, participation third.

## Canonical copy (en) — use verbatim

- Wordmark: `Belief Changer`
- Hero headline: `It's not willpower you're missing. It's the way out of a trap.`
- Hero subtext: `Free books that change the belief behind the behavior. In your language. No signup, no cost, no catch.`
- Ask input placeholder: `Tell us what you're going through...`
- Primary CTA: `Find your book`
- Trust strip: `Free forever` / `No signup` / `No tracking` / `Every language`
- Reframe (three sentences): `You always choose what you believe is your happiest option. A trap is a belief that lies about the math, it promises relief and delivers the opposite. These books correct the belief, and the behavior follows on its own.`
- Method beats: 1. `See the trap clearly` — `Every trap runs on a belief: that the thing is helping you. Each book takes that belief apart, calmly and completely.` 2. `The belief loses its grip` — `When you see what the trap actually gives and what it actually costs, the craving has nothing left to stand on.` 3. `Walking out feels like relief` — `No willpower, no counting days. When the belief changes, leaving stops being sacrifice and starts being escape.`
- Living books: `Living books` — `Readers improve every book. Versions are public. The newest version is always the one you get.`
- Request section heading: `Which trap should we take apart next?` · CTA: `Add your voice`
- Experiences heading: `What readers walked out of`
- Improve form title: `Help the next version` · prompts: `Where did it lose you?` / `What belief was still standing?` / `What happened for you?`
- Statuses (pastel tags): `Gathering voices` (yellow) / `Being written` (yellow) / `In translation` (blue) / `Published` (green)
- Footer mono: `Free forever · no accounts, no tracking`
- 404: `This page isn't in the library.`
- Register for all other copy: warm to the person, harsh to the trap; sentence case;
  no exclamation marks; ZERO em-dashes in visible copy (hyphens only); no AI clichés;
  no fake numbers presented as real; never the words "Easyway", "Allen Carr", or
  "Freedom Model" — the method is described, never name-dropped.

## Community mechanics (v1 = front end + documented contract)

- **Improve this book** (book page section): the three guided prompts above plus an
  optional free-text field; a small visual guide explains that specific, personal,
  belief-level feedback improves books most. Fully anonymous. One optional toggle:
  "You may publish this as an anonymous reader experience." Submit → success state
  explaining the pipeline (editors read everything; the best contributions shape the
  next version; the changelog records what changed). Contract: `POST /api/feedback
  { slug, lostAt?, beliefStanding?, whatHappened?, freeText?, mayPublish }` — v1
  mocks with a local success state.
- **Request board**: ranked list (votes desc), each row: first-person subject, status
  tag, vote count (mono), one-tap `Add your voice` (optimistic UI; localStorage flag
  prevents double-vote UX; flag is functional storage, no identity). Submit flow:
  subject (short) + optional experience. Published rows link to their book. Contract:
  `POST /api/votes { subjectId }`, `POST /api/requests { subject, experience? }`.
- **Experience board**: anonymous cards (book, text, coarse month), filterable by
  book, submit shares the improve-form consent path. Contract: `POST /api/experiences`.
- **Moderation note** (documented, not built): all public text passes review before
  publication.

## Versions and formats (book page)

- Current version prominent: `Version 3 · June 2026` in mono-meta, beside languages
  count. One plain line: `Only the newest version is available for download.`
- Actions: `Read online` (primary), `Download EPUB`, `Listen` (books without audio
  show a small `In production` yellow tag instead of a dead button).
- Changelog tab: rows of version ID · date · what changed · why. Old versions are
  history, never downloads. Aggregate line allowed: `Improved from reader
  contributions` (no counts unless real, no names ever).

## Measurement contract (no cookies, no banner — owner-verified approach)

- `src/lib/measure.ts`: `track(event, props)` → v1 logs to console in dev, no-ops in
  prod build; the module documents the future POST endpoint.
- Events: `page_view(routeClass, locale)`, `read_start(slug)`, `chapter_view(slug,
  n)`, `download(slug, format)`, `vote_cast(subjectId)`, `request_submitted`,
  `feedback_submitted(slug, kind)`, `experience_submitted(slug)`,
  `finder_no_match(queryNormalized, locale)`.
- Rules: no identifiers, no unique-visitor counting, nothing stored on or read from
  the device for measurement; queries sanitized client-side (cap 80 chars, strip
  emails and digit runs) before any future send. Device storage is functional only:
  theme, locale, reading position, voted flags.
- Builder generates `docs/MEASUREMENT.md` from this section.

## i18n and RTL

- Locales v1: `en` (complete), `da` and `ar` (nav + home + book-page core strings, to
  prove the machinery; `ar` proves `dir="rtl"` mirroring end to end).
- `/{locale}/` prefix on every route; hreflang alternates in head; `dir` set on
  `<html>`; logical CSS properties only; the language switcher shows native names.
- Book content resolves per locale with graceful fallback to `en` plus a quiet
  pastel-blue note: `Not yet in your language`.

## Fixtures (v1 data, all clearly marked MOCK in code comments)

- `books`: derived from `assets/covers/covers-manifest.json` (10 books). Each gets:
  localized title ("The Sugar Trap" pattern), one-line promise, status, version,
  languages, chapter list. Two books get real sample chapters written by the builder
  in register (scrolling: 3 chapters; sugar: 1); the rest list chapter titles with
  `Being written` states.
- `requests`: 8 rows across all statuses, plausible-but-mock vote counts.
- `experiences`: 6 anonymous samples in register (specific, humble, hopeful).
- `blog`: 3 posts (the launch note; how books improve; why it is free forever).

## Imagery manifest (all assets exist; builder generates nothing)

| File (assets/site/) | Voice | Surface |
|---|---|---|
| painted-morning-overlook.jpg | Painted | Home beat 1 (see clearly) |
| painted-harbor-flock.jpg | Painted | Home beat 2 (grip loosens) |
| painted-riverside-glide.jpg | Painted | Home beat 3 (walking out) + how-it-works hero |
| painted-together-after-rain.jpg | Painted | Experiences board + home experiences strip |
| painted-kite.jpg | Painted | Blog index |
| photo-open-window.jpg | Photo | About |
| photo-open-street.jpg | Photo | 404 |

Law: painting shows the life, photography states the facts; one voice per section;
covers are used wherever a book is present and are never modified.

## Shelf slot contract (Phase 3 upgrade point)

`<ShelfStage />` in the hero: v1 renders a static, server-rendered cover row from the
manifest (true corners, cover shadows per the rendered reference), each cover linking
to its book page. The component documents the Phase 3 mount contract in comments: the
3D shelf module will replace the row in place, same data source, wheel-and-arrow hero
behavior arriving with it. Nothing else on the site may assume 3D exists.

## Quality gates (from AGENTS.md, restated for the build)

taste-skill §14 Final Pre-Flight Check (every box) + DESIGN.md Do's and Don'ts +
both themes + RTL pass + reduced-motion pass + zero console errors + production
build passes. The builder works only inside `site/`, never commits, and reports
against every gate.
