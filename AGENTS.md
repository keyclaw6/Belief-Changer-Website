# AGENTS.md — Always-Read Guardrails (Belief Changer site repo)

Read this before every change. It is short on purpose.

## 0 · Precedence (when sources disagree)

1. **DESIGN.md (Quiet Editorial)** — the design contract. It adopts the
   minimalist-skill / taste-skill v2 system: white canvas, 1px hairline structure,
   ink interaction, crisp radii, pastel status semantics, split hero, sans display.
2. **This file** — build discipline and engineering rules.
3. **skills/taste-skill + skills/minimalist-skill** — apply them as law where
   DESIGN.md is silent.
4. Your defaults — last.

**The few places DESIGN.md adjudicates or bounds the skills (do not "fix" these):**
- **Serif**: taste-skill's sans-display rule wins everywhere INCLUDING the wordmark
  and book titles; minimalist-skill's editorial serif survives only as Newsreader
  inside the reader's long-form text.
- **Pastels**: bounded stricter than minimalist-skill — status semantics on small
  tags/badges only; never subject chips, sections, or buttons.
- **Version/changelog block on book pages**: sanctioned functional content (DM Mono),
  despite taste-skill's version-footer ban. Nowhere else.
- **Imagery**: books first, always; supporting desaturated photography only where a
  section genuinely needs it; no placeholder services in production.
- **Hero asset**: the split hero's right side is the shelf or a hero book, not stock.

## 1 · Fixed design read (never re-infer)

Reading this as: **trust-first multilingual book library for people in distress, with
a Quiet Editorial document-style language (DESIGN.md v2), custom Tailwind system.**
Dials, pinned: `DESIGN_VARIANCE: 4 · MOTION_INTENSITY: 3 · VISUAL_DENSITY: 3`.
The trust-first override beats any flashy urge. Do not re-run brief inference; do not
propose a different register.

## 2 · Stack and engineering rules

- **Next.js (App Router) + TypeScript + Tailwind v4.** Design tokens as CSS variables
  (DESIGN.md pairs, light + dark under `[data-theme]` + `prefers-color-scheme`);
  Tailwind consumes the variables. Theme set at the root, never per section.
- **Fonts via `next/font`** (DM Sans, DM Mono, Newsreader), `font-display: swap`.
  Never a Google Fonts `<link>` in production. Non-Latin: per-script system stacks.
- **Motion** (`motion/react`) for UI animation. **Three.js** (the book/shelf package)
  lives in isolated `"use client"` leaf components; never mix GSAP/Three.js and Motion
  in one component tree.
- Server Components by default; interactivity in client-island leaves only.
- **Never** `window.addEventListener("scroll")` or scroll math in React state; use
  `useScroll` / IntersectionObserver / motion values. Continuous pointer/scroll values
  never live in `useState`.
- `min-h-[100dvh]`, never `h-screen`. CSS Grid over flexbox percentage math. Logical
  properties only — RTL is day one, not a pass.
- Ambient depth (the faint warm radial light spot) lives on one
  `fixed inset-0 pointer-events-none` layer, opacity ≤ 0.03, never on scrolling
  containers.
- Z-index only from a documented scale in one constants file.
- Check `package.json` before importing anything; output the install command first.
- No component design systems (no shadcn/Material/Radix Themes): the system is custom,
  defined by DESIGN.md. Radix *primitives* for a11y behavior are acceptable.
- Every chapter page is server-rendered, indexable, with hreflang; no client-only
  routes for content. No signup walls, no tracking, no cookies beyond theme/locale.

## 3 · Hard bans (mechanical)

- ZERO em-dashes (—/– as separators) in visible copy. Hyphen only. Grep before ship.
- Eyebrows: max 1 per 3 sections (hero counts). Count `uppercase tracking` labels.
- Section-layout repetition: ≥ 4 distinct layout families per page; no family twice
  in a row; max 2 consecutive image+text zigzags.
- Hero: max 4 text elements; headline ≤ 2 lines; subtext ≤ 20 words; CTA above fold;
  top padding ≤ 6rem; trust strip lives BELOW the hero as its own row.
- One CTA label per intent per page; CTA text never wraps at desktop; every CTA and
  form element passes AA contrast in both themes.
- One hairline weight/color site-wide; no `border-t` + `border-b` on every row of a
  long list; no crosshair/decorative grid lines.
- No pill primary buttons, pill inputs, or pill containers (pills = small tags only).
- No section-numbering eyebrows, scroll cues, decorative status dots, locale/time/
  weather strips, version labels in heroes, marketing version footers, pills/labels
  overlaid on images, photo-credit-as-decoration, fake div screenshots, hand-rolled
  SVG icons (Phosphor family only, one strokeWidth), three-equal-feature-cards,
  split-header pattern, marquees, custom cursors, glows, middle-dot chains
  (max one · per line).
- No fake numbers, invented testimonials, or "Jane Doe" data — real empty states are
  content here ("being written", request counts).
- Grids render exactly N cells for N real items.

## 4 · Copy rules

- Warm to the person, harsh to the trap. Never shaming. First-person subject names.
- Sentence case everywhere. No exclamation marks. No AI clichés. Plain verbs.
- Copy self-audit before ship: re-read every visible string; rewrite anything
  grammatically broken, cute-but-wrong, or LLM-poetic. Boring beats hallucinated.
- All strings in locale catalogs (ICU MessageFormat); never concatenate translated
  fragments; never bake text into images (titles are live text or runtime-composited
  textures via the book package).

## 5 · Quality gates (run before declaring any surface done)

- [ ] Both themes rendered and audited; theme set at root only; hierarchy parity holds
- [ ] WCAG AA on every text/control pair, both themes; visible ink focus rings
- [ ] `prefers-reduced-motion`: full static path, including shelf fallback image
- [ ] RTL pass with Arabic metadata: mirrored layout intact, nothing clipped
- [ ] Em-dash grep = 0; eyebrow count ≤ ceil(sections/3); layout families ≥ 4;
      hairline audit (one weight, nothing decorative)
- [ ] Buttons/forms contrast audit; no wrapped CTAs; one label per intent
- [ ] Copy self-audit done; locale catalogs complete for touched strings
- [ ] Lighthouse: LCP < 2.5s, INP < 200ms, CLS < 0.1; shelf lazy-loaded below fold
- [ ] Zero console errors/warnings
- [ ] Register sanity: does this read as precise quiet-editorial product design, or
      as a template? If template, it is not done.

## 6 · Process

- One component/section per change; verify in the browser before the next.
- Never patch a broken build sideways; revert and redo.
- The 3D shelf consumes the book-asset package's API as-is; report gaps upstream,
  do not fork its internals.
- When something is ambiguous, DESIGN.md's Creative Latitude section says where you
  may invent. Everywhere else: ask, do not guess.
