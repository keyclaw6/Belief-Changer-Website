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
      $locale/index.tsx  Milestone 1 placeholder home (note + static cover row)
      $locale/books/index.tsx, $slug.tsx, how-it-works.tsx, requests.tsx, about.tsx  stubs
    components/
      Nav, Footer, LocaleShell     layout shell (nav 68px + hairline; footer + mono trust line)
      LanguageSwitcher, ThemeToggle  client leaves (hairline panel; light/dark override)
      NotFound, DefaultCatchBoundary, PagePlaceholder
    i18n/
      config.ts          locales (en/da/ar), dir map, native names, BCP-47
      messages/en.ts      complete catalog (copy deck verbatim where canonical)
      messages/da.ts, ar.ts  SAMPLE partial catalogs (fall back to en)
      types.ts, index.ts, routing.ts  widened Messages type, deep-merge resolver, hreflang
    lib/
      theme.ts           3-state theme (system/light/dark), no-flash init script
      measure.ts         track() + sanitizeQuery() per the measurement contract
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

---

## Deferred to later milestones (per the build order)

- M2 Home (hero, trust strip, reframe, method beats, living books, next-book
  votes, experiences) replacing `$locale/index.tsx`.
- M3 Library finder, Book page (version block, changelog tab, improve form,
  experiences), Reader (Newsreader surface, comfort modes, reading position).
- M4 Request board, Experience board, Blog post bodies, About, styled 404 with
  the Photo-voice imagery.
- M5 completing the `da` / `ar` catalogs, generating `docs/MEASUREMENT.md` from
  the SITE-PLAN measurement section (deliberately not created in M1 to honor the
  "work only inside site/" boundary for this milestone), and the full gate pass.
- `motion` and `@phosphor-icons/react` are installed; Phosphor is already used in
  the shell. `motion` is unused so far by design (M1 has no motivated motion
  beyond CSS transitions) and lands with the home/scroll work.

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

taste-skill §14 is a page-level gate applied per surface as pages are built; M1
ships infrastructure + a deliberately minimal placeholder, so page-level boxes
(hero fit, eyebrow count, zigzag cap, etc.) are enforced from M2 onward. The
foundation itself honors the applicable laws: zero em-dashes in visible copy, no
emojis, one hairline weight, ink-only interaction, no pill primary buttons, no
brand accent, pastels reserved for status semantics, no pure black.
