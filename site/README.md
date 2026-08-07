# Belief Changer: website front end

A free, multilingual library of belief-change books, rendered as a calm,
document-style editorial product. This is the front end. Every backend
touchpoint is a documented contract and mocked in v1.

Ground truth, in precedence order: `../DESIGN.md` (visual law) > `../AGENTS.md`
(precedence + platform laws) > `../docs/SITE-PLAN.md` (structure, copy, data) >
the adopted skills. Read those before changing anything here.

---

## taste-skill design read + dials

**Design read:** _Reading this as a multilingual editorial library for people
often arriving in distress, with a Quiet Editorial language (premium
utilitarian minimalism: white canvas, hairline structure, ink interaction,
pastel status semantics, photorealistic books as the only rich color), leaning
toward Tailwind v4 tokens wired from DESIGN.md + self-hosted DM Sans / DM Mono /
Newsreader + barely-there motion._

The aesthetic is fixed by `DESIGN.md`, not chosen by the agent; these dials are
the reading that follows from it.

- **`DESIGN_VARIANCE: 4`**: calm, structured, trust-first. Composition varies
  by layout family (per taste-skill §4.7), never by decoration. Not artsy;
  precise.
- **`MOTION_INTENSITY: 3`**: motion is barely there and always motivated
  (DESIGN.md Motion): scroll fade-ups, 150-200ms interaction transitions,
  optional single ambient drift. `prefers-reduced-motion` collapses everything.
- **`VISUAL_DENSITY: 3`**: generous whitespace, macro-quiet. Data surfaces
  (library, request board, changelog) get hairline-and-whitespace density, not
  cockpit density.

These override the taste-skill baseline (8 / 6 / 4) because the audience and
`DESIGN.md` demand a trust-first, low-motion, airy register.

---

## How to run

Requires Node 20+ (built and verified on Node 24). From this `site/` directory:

```bash
npm install         # install pinned dependencies
npm run dev         # dev server with SSR at http://localhost:3000
npm run build       # production build to dist/ (client + SSR server bundle)
npm run typecheck   # tsc --noEmit, strict
npm run fetch-fonts # re-download self-hosted woff2 + regenerate src/styles/fonts.css
```

Canonical URLs have no trailing slash: `/en`, `/da`, `/ar` (the router 307s
`/en/` → `/en`, and `/` → `/en`). The production build emits a Web-standard
`{ fetch }` handler at `dist/server/server.js` for deployment to a serverless /
edge platform; it does not self-listen (that is the platform's job).

---

## Structure map

```
site/
  vite.config.ts         TanStack Start + Tailwind v4 + React plugins; native tsconfig paths
  tsconfig.json          strict TS, "~/*" alias -> src/*
  components.json        shadcn/ui config (new-york, phosphor icons, cssVariables)
  scripts/fetch-fonts.mjs  one-shot self-hosting of the Google Fonts woff2 (not in build)
  public/
    fonts/*.woff2        self-hosted DM Sans / DM Mono / Newsreader (Latin + Latin-ext)
    covers/*.png         production cover art (copied from assets/covers; never modified)
    covers/derived/      spine + back textures (copied; never modified)
    site/*.jpg           painted + photo site imagery (copied; never modified)
  src/
    router.tsx           getRouter(): the app router (SSR defaults, not-found + error)
    server.ts            explicit SSR stream handler entry
    client.tsx           explicit hydration entry
    styles/
      globals.css        ALL DESIGN.md tokens as CSS vars + Tailwind v4 @theme wiring
      fonts.css          generated @font-face rules (font-display: swap)
    routes/
      __root.tsx         HTML document shell, <head>, <html lang/dir>, theme init script
      index.tsx          "/" -> redirect to /en
      $locale.tsx        locale layout: validates locale, hreflang, renders shell + Outlet
      $locale/index.tsx  Home (M2): hero + trust + reframe + method + living + next + experiences
      $locale/books/index.tsx      Library (M3): URL-driven finder, full grid, no-match state
      $locale/books/$slug.tsx      Book page (M3): masthead, tabs, improve form, experiences
      $locale/books/$slug_.read.$n.tsx  Reader (M3): SSR chapters, comfort modes, position
      $locale/requests.tsx         Request board (M4): ranked one-tap vote list + submit flow
      $locale/experiences.tsx      Experience board (M4): painting anchor, URL filter, submit
      $locale/blog/index.tsx       Blog index (M4): kite painting + editorial post list
      $locale/blog/$slug.tsx       Blog post (M4): 65ch editorial reader, back link
      $locale/how-it-works.tsx     Method page (M4): the method in plain words, riverside-glide
      $locale/about.tsx            About (M4): mission, laws, honesty note, open source, open-window
    components/
      Nav, Footer, LocaleShell     layout shell (nav 68px + hairline; footer + mono trust line)
      LanguageSwitcher, ThemeToggle  client leaves (hairline panel; light/dark override)
      NotFound (M4: designed 404 + open-street photo), DefaultCatchBoundary, PagePlaceholder
      Reveal.tsx           the single scroll-entry motion primitive (SSR-visible, reduced-motion safe)
      BookCover, BookCard, StatusTag, ShelfStage, HeroAsk  shared book + finder primitives
      home/  Hero, TrustStrip, Reframe, MethodBeats, LivingBooks, NextBook, Experiences
      book/  BookActions, BookTabs (About / Changelog), ImproveForm, BookExperiences
      reader/  Reader (toolbar + reading surface + comfort control + chapter list)
      requests/  RequestBoard (one-tap vote, localStorage flag), RequestSubmit (ask-for-a-book)
      experiences/  ExperienceFilter (URL-driven), ExperienceSubmit (anonymous consent flow)
    i18n/
      config.ts          locales (en/da/ar), dir map, native names, BCP-47
      messages/en.ts      complete catalog (copy deck verbatim where canonical)
      messages/da.ts, ar.ts  SAMPLE partial catalogs (fall back to en)
      types.ts, index.ts, routing.ts  widened Messages type, deep-merge resolver, hreflang
    lib/
      theme.ts           3-state theme (system/light/dark), no-flash init script
      measure.ts         track() + sanitizeQuery() per the measurement contract
      ui.ts              shared className recipes (btnPrimary/Secondary, inkLink, inputText)
      utils.ts           cn() for shadcn/ui + Tailwind class merging
    data/
      types.ts           fixture shapes (mirror the future API)
      books.ts           10 books derived from covers-manifest.json (MOCK values flagged)
      sample-chapters.ts real sample prose: scrolling x3, sugar x1 (MOCK sample content)
      requests.ts, experiences.ts, blog.ts  boards + blog metadata (MOCK, flagged)
```

### How the foundation is wired

- **Tokens.** Every color / type / spacing / radius value from the DESIGN.md
  front-matter is a CSS variable set once at `:root` in `src/styles/globals.css`.
  Light is the default; `[data-theme="dark"]` and a `prefers-color-scheme` block
  (scoped to `[data-theme="system"]`) carry dark. Tailwind v4 reads these via
  `@theme inline`, so utilities like `bg-canvas`, `text-ink`, `border-hairline`,
  `rounded-lg` resolve to the tokens and swap with the theme automatically. The
  numeric spacing base is 8px.
- **Fonts.** Self-hosted woff2 in `public/fonts`, declared in
  `src/styles/fonts.css` with `font-display: swap`, no `<link>` to Google. DM
  Sans (400/500/600), DM Mono (400/500), Newsreader (400 + italic). Latin and
  Latin-ext subsets are bundled (Latin-ext carries Danish diacritics). Arabic
  renders via a per-script system stack (DESIGN.md), so no Arabic webfont ships.
- **Locales.** `/{locale}/` prefix on every route. `$locale.tsx` validates the
  segment (unknown locales 404), resolves the translator, and emits hreflang
  alternates; `__root.tsx` sets `<html lang>` and `dir` from the active locale so
  `ar` mirrors RTL on the very first server render. All layout uses logical CSS
  properties. The language switcher shows native names in a hairline panel.
- **Theme toggle.** A no-flash inline script sets `data-theme` before paint;
  the toggle flips an explicit light/dark choice persisted in localStorage
  (functional storage only, never measurement).

---

## Decisions taken where the plan left room

1. **Explicit server/client entries.** TanStack Start can supply virtual
   defaults, but `src/server.ts` and `src/client.tsx` are authored explicitly so
   later milestones have a documented seam for locale negotiation / headers.
2. **TypeScript pinned to 5.9.3, not 7.x.** `typescript@7` (the new native
   compiler) is `latest` on npm, but the mature 5.9 line is what TanStack Start's
   codegen and the wider ecosystem target. Chosen for a rock-solid foundation.
3. **Dropped `vite-tsconfig-paths` and router devtools.** Vite 8 resolves
   tsconfig paths natively (`resolve.tsconfigPaths: true`); devtools versions lag
   the router and add no value to an SSR foundation. Leaner is sturdier.
4. **Canonical URLs without trailing slash.** Kept the router's default
   trailing-slash normalization (`/en/` → `/en`) rather than fighting it; links
   and hreflang all use the no-slash form.
5. **Placeholder home + route stubs.** Every link in the shell resolves to a
   real SSR page today (via `PagePlaceholder`), so the app is coherent end to end
   and later milestones replace one file at a time.
6. **shadcn/ui infra only.** `components.json` + `cn()` are set up; no components
   generated yet, so no default shadcn pixels exist to leak. Later milestones add
   restyled primitives as needed.

### M2 / M3 decisions (home, library, book page, reader)

7. **Reader route as a de-nested sibling (`$slug_.read.$n`).** The reader must
   replace the book page, not render inside it, so it uses TanStack's trailing
   underscore convention to opt out of the `$slug` layout while still matching
   `/books/{slug}/read/{n}`. This keeps the book page URL free of a trailing
   slash (a directory-based `$slug/index.tsx` would have forced `/books/{slug}/`).
8. **`Reveal` renders visible on the server, arms after mount.** The fade-up
   entry animation would otherwise ship `opacity:0` in the SSR HTML and hide all
   content without JavaScript. `Reveal` outputs a plain, fully-visible element on
   the server and the first client render, then swaps to the animated element
   after mount, so no-JS content is present and there is no flash of hidden text.
9. **Comfort modes are a reading-surface palette, independent of the site theme.**
   `.reader-surface[data-comfort=light|sepia|dark]` sets local `--rs-*` variables
   that restyle only the reading column; the site chrome keeps its own theme
   (DESIGN.md). The comfort choice and per-book reading position persist in
   localStorage as functional storage only. On first open the surface mirrors the
   site theme once, then follows the reader's explicit choice.
10. **The finder is URL-state (`?q=`), the library owns `finder_no_match`.** The
    hero ask navigates to `/books?q=...`; the library filters over title +
    subject + promise + status, renders exactly N cells, and fires
    `finder_no_match` once per distinct normalized query that returns nothing.
    Keeping the query in the URL makes it shareable and lets the hero seed it.
11. **Reading position stored, "continue" left for M4.** The reader writes the
    current chapter to `bc-reading:{slug}` so a later "continue reading" affordance
    (e.g. on the book page) can resume without new plumbing; v1 does not surface a
    resume button yet.
12. **Font pipeline fix.** DM Sans ships from Google as one variable woff2 shared
    across weights; the M1 fetch script deduped by URL and left the 400/500
    `@font-face` `src` files unwritten. Fixed `scripts/fetch-fonts.mjs` to point
    every weight at the one downloaded file (and the `__root.tsx` preload to
    match), so 400/500/600 all resolve and body-weight hierarchy renders.

---

### M4 decisions (requests, experiences, blog, about, how-it-works, 404)

13. **Request board voting is optimistic + local-only.** The one-tap vote
    increments a local delta immediately and records the subject id in a
    `bc-voted` localStorage array so the UX never offers the same vote twice.
    The flag is read in a post-mount `useEffect`, so SSR and the first client
    render agree (no already-voted state), then local flags apply. This is
    functional storage only (no identity), matching the measurement contract;
    `vote_cast` carries the subject id and nothing else. Published rows drop the
    vote button and link to their book instead.
14. **The experience filter is URL state (`?book=`), not client state.** The
    full list is the SSR/default render; a `?book=` param filters server-side so
    every filtered view is shareable and crawlable. Both `validateSearch` and
    the component resolve the param only to a book that actually exists, so a
    stale or hand-typed slug always falls back to the full list, never an empty
    page. The honest empty state ("No experiences of {book} yet") is reserved
    for a real book that genuinely has none.
15. **The library no-match seam is now wired.** The library's no-match CTA
    passes the finder query to `/requests` as a validated `?subject=` param; the
    board caps it at 120 chars and prefills the submit field as an editable
    default (TanStack redirects an over-long param to its normalized form).
16. **Blog bodies live in `src/data/blog.ts`, DM Sans on the post page.** The
    three post bodies are builder-written sample prose (flagged in code, never
    labeled "sample" in the UI). The post page reads at a 65ch measure in DM
    Sans, not Newsreader (Newsreader stays reader-only per DESIGN.md).
17. **The 404 is the router default and locale-aware.** The designed NotFound
    (open-street photo, copy-deck title, ink links) is wired as
    `defaultNotFoundComponent` and the root `notFoundComponent`, so every
    unmatched path lands there. It defaults to English but stays in-locale when
    the failing path already carried a valid locale (e.g. `/en/nowhere`).
18. **Blog + Experiences added to the footer nav.** Neither had a shell entry;
    the footer is their natural home, so the footer link group now reads About /
    Request a book / Experiences / Notes / Open source (its aria-label fixed
    from the stray "About" to a proper "Site" group label).

## Deferred to later milestones (per the build order)

- M2 Home, M3 Library / Book page / Reader, and M4 Requests / Experiences / Blog
  / About / How-it-works / 404 are all DONE. Every route in the SITE-PLAN
  sitemap is now built and SSR-complete; no `PagePlaceholder` stubs remain in
  the route tree (the component stays for future use).
- M5 completing the `da` / `ar` catalogs (all new M4 keys added to `en.ts` this
  milestone need translating; see the list in the M4 handoff below), generating
  `docs/MEASUREMENT.md` from the SITE-PLAN measurement section, and the full
  site-wide gate pass (both themes on every page, RTL, reduced motion).

### M4 → M5 translator handoff: new `en.ts` keys to translate

- `footer.experiences`, `footer.blog`, `footer.navLabel`
- `requests.*` new keys: `loopExplainer`, `rankedHeading`, `voted`, `voteAria`,
  `votedAria`, `voteCountOne`, `readTheBook`, `rankLabel`, `submitBody`,
  `submitSubjectHelp`, `submitExperienceOptional`, `submitExperiencePlaceholder`,
  `submitSuccessTitle`, `submitSuccessBody`, `submitAnother` (and the reworded
  `submitSubjectPlaceholder`, `submitExperienceLabel`).
- `experiences.*` new keys: `lede`, `filterLabel`, `listHeading`, `countAll`,
  `countAllOne`, `countForBook`, `countForBookOne`, `emptyFiltered`,
  `clearFilter`, `aboutBook`, `submitTitle`, `submitBody`, `submitBookLabel`,
  `submitBookPlaceholder`, `submitTextLabel`, `submitTextPlaceholder`,
  `submitConsentLabel`, `submitCta`, `submitSuccessTitle`, `submitSuccessBody`,
  `submitAnother`, `consentRequired`, `bookRequired`.
- `blog.*` new keys: `readAria`, `backToNotes`, `postedLabel`.
- `howItWorks.*` (entire new section): `title`, `lede`, and the five
  principle heading/body pairs, `closingHeading`, `closingBody`, `ctaLibrary`,
  `ctaRequests`, `heroImageAlt`.
- `about.*` (entire new section): `missionHeading`, `missionBody1`,
  `missionBody2`, `lawsHeading`, the five `law*Title`/`law*Body` pairs,
  `honestyHeading`, `honestyBody`, `openSourceHeading`, `openSourceBody`,
  `openSourceLink`, `imageAlt`.
- `notFound.imageAlt` (new).
- Blog post BODIES in `src/data/blog.ts` are English-only sample prose; if M5
  localizes post content it should resolve per locale like book content does.

---

## Gate report (Milestone 1 scope)

- **Build:** `npm run build` passes clean (client + SSR bundles; the woff2
  "resolved at runtime" notice is expected for public-path url() references).
- **Typecheck:** `npm run typecheck` passes clean under strict TS.
- **SSR:** dev and a production `{ fetch }` run both serve `/en`, `/da`, `/ar`
  with complete server-rendered HTML; `/` → `/en`; unknown locale and unknown
  book slug both 404.
- **RTL:** `<html lang="ar" dir="rtl">` on the first server byte; logical
  properties throughout the shell.
- **Themes:** light + dark + system all present in the served CSS
  (`[data-theme=...]` selectors + `prefers-color-scheme`); no-flash init script
  in `<head>`.
- **Tokens / fonts:** all DESIGN.md color tokens and 14 `@font-face` rules
  (all `font-display: swap`) present in the served stylesheet; DM Sans preloaded.
- **Console:** zero SSR errors or warnings in the dev log across all routes.

## Gate report (Milestone 2 / 3 scope: home, library, book page, reader)

- **Build + typecheck:** `npm run build` and `npm run typecheck` both pass clean.
- **SSR (curled):** `/en` home renders all seven beats with real copy and covers;
  `/en/books` renders the full 10-cell grid; `/en/books?q=sugar` filters to one
  cell server-side; `/en/books?q=<nomatch>` renders the no-match state; every
  book page (`sugar` published, `porn` being-written, `gaming` in-translation)
  renders its correct actions / version block / tabs / experiences state;
  `/en/books/scrolling/read/1` renders the full Newsreader reading surface with
  comfort control and chapter nav; `read/4` renders the dignified being-written
  chapter; out-of-range and non-numeric chapters 404.
- **taste-skill §14:** homepage uses seven distinct layout families, zero
  eyebrows (well under the ceil(7/3)=2 budget), at most two consecutive
  image+text splits (the third method beat breaks to a full-width stack), exact
  cell counts everywhere, quotes clamped to a glance, one middle dot per metadata
  line. No AI tells, no fake precise numbers presented as real (all fixture
  values are MOCK-flagged), no div-fake screenshots, no decorative dots.
- **Copy:** canonical copy-deck strings verbatim; all new strings authored in
  register (warm to the person, harsh to the trap, sentence case, no exclamation
  marks, no AI clichés) and added to `en.ts`. Zero em-dashes and en-dashes in
  source and in rendered HTML.
- **DESIGN.md do's/don'ts:** one hairline weight, ink-only interaction, one ink
  primary per screen, pill radius only on status tags, pastels only for status
  semantics, DM Sans everywhere except the reader (Newsreader), sections
  alternate canvas/band with dividers only where same-color sections would meet.
- **A11y:** labels above inputs, `sr-only` labels where a field's purpose is
  visual, ink focus rings inherited from the base layer, aria-live on the finder
  count and the improve-form success, hand-built tabs with roving arrow-key
  focus and correct roles, reader comfort as an ARIA radiogroup.
- **Motion / reduced motion:** the only motion is `Reveal` (fade-up 12px, ~600ms,
  80ms stagger, in-view once) plus 150-200ms hover/press transitions; all collapse
  under `prefers-reduced-motion` (Reveal returns a plain element; the global CSS
  zeroes transition/animation durations). No 3D. The ShelfStage documents the
  Phase 3 3D mount contract and ships as the static reduced-motion fallback.
- **Both themes:** all surfaces use theme tokens (bg-canvas / bg-band / text-ink
  / border-hairline / the `--color-pastel-*` pairs), so light and dark both hold;
  covers and paintings are never tinted and glow against the dark canvas. (Both
  themes reviewed via the served token CSS and structure; no browser was
  available in the sandbox for a pixel diff.)

## Gate report (Milestone 4 scope: requests, experiences, blog, about, how-it-works, 404)

- **Build + typecheck:** `npm run build` and `npm run typecheck` both pass clean.
- **SSR (curled):** every new route serves complete server-rendered HTML.
  `/en/requests` renders all 8 ranked rows (2 published linking to their book,
  6 with a one-tap vote) with mono ranks + vote counts; `/en/experiences`
  renders the painting anchor and all 6 cards, `?book=sugar` filters to the 2
  sugar cards server-side, `?book=porn` shows the honest empty state, an invalid
  `?book=` falls back to the full 6; `/en/blog` renders the kite painting and the
  3 post rows; each `/en/blog/{slug}` renders its full body at 65ch (unknown slug
  404s); `/en/how-it-works` renders the riverside-glide hero and the 5 method
  beats; `/en/about` renders the open-window photo, the 5 laws, and the honesty
  note verbatim in spirit; unknown paths (`/en/nowhere`, `/garbage`) render the
  designed open-street 404. All three locales (`en`/`da`/`ar`) 200 on every new
  route; `ar` mirrors `dir="rtl"` from the first byte with English fallback copy.
- **taste-skill §14:** each new page uses ≥3 distinct layout families and zero
  eyebrows (well under budget). The data surfaces obey the hairline discipline:
  the request board is ONE bordered container with `divide-y` (never
  border-t+border-b per row); the blog index, the about laws, and the
  how-it-works sequence use sparse single dividers (border-t only, first row
  bare). Exact cell counts (8 / 6 / 3 / 5). No three-equal-cards, no zigzag run
  (each page has at most one image+text split), no decorative dots, no AI tells,
  no fake precise numbers (fixture votes are MOCK-flagged).
- **Copy:** copy-deck strings verbatim (`Which trap should we take apart next?`,
  the four statuses, the honesty-note phrasing, `This page isn't in the library.`);
  the method page never names Easyway / Allen Carr / Freedom Model; the three
  blog bodies are 390-410 words each, in register. Zero em-dashes and en-dashes
  in source and in every rendered route.
- **Imagery law:** one voice per section. Experiences / blog / how-it-works carry
  paintings only (together-after-rain, kite, riverside-glide); about and 404
  carry the Quiet-Fact photographs only (open-window, open-street). No painting
  and photo share a viewport; no covers are tinted or cropped.
- **A11y:** labels above every input, helper text below in secondary ink,
  `sr-only` list/section headings, ink focus rings from the base layer, `aria-live`
  on all three form success swaps (request / experience) and the experience
  count, `role="alert"` on the experience validation error, the vote button
  carries a descriptive `aria-label` and disables once used, the filter is a
  labelled nav of keyboard-native links with `aria-current`.
- **Motion / reduced motion:** the only motion is `Reveal` plus 150-200ms
  hover/press transitions, all collapsing under `prefers-reduced-motion`.
- **Console:** zero SSR errors or warnings across every new route in the dev log.
- **Both themes:** every new surface uses theme tokens only (including the vote
  button's ink-invert hover and the pastel success/error inks), so light and
  dark both hold; reviewed via served CSS + structure (no browser for a pixel
  diff in the sandbox).
