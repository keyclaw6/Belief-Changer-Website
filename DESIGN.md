---
version: alpha
name: Quiet Editorial
description: Design system for the Belief Changer site. Premium utilitarian minimalism in the minimalist-skill / taste-skill v2 tradition. White canvas, hairline structure, ink interaction, pastel semantics, photorealistic books as the emotional core.
colors:
  canvas: "#FFFFFF"
  band: "#EBE7DF"
  surface: "#F7F6F3"
  hairline: "#EAEAEA"
  ink: "#111111"
  ink-secondary: "#787774"
  action: "#111111"
  action-hover: "#333333"
  on-action: "#FFFFFF"
  focus: "#111111"
  pastel-red-bg: "#FDEBEC"
  pastel-red-ink: "#9F2F2D"
  pastel-blue-bg: "#E1F3FE"
  pastel-blue-ink: "#1F6C9F"
  pastel-green-bg: "#EDF3EC"
  pastel-green-ink: "#346538"
  pastel-yellow-bg: "#FBF3DB"
  pastel-yellow-ink: "#956400"
  canvas-dark: "#161615"
  band-dark: "#1D1C19"
  surface-dark: "#1D1D1B"
  hairline-dark: "rgba(255,255,255,0.08)"
  ink-dark: "#F2F0EC"
  ink-secondary-dark: "#8F8B85"
  action-dark: "#F2F0EC"
  on-action-dark: "#111111"
  focus-dark: "#F2F0EC"
typography:
  display-xl:
    fontFamily: DM Sans
    fontSize: 60px
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 38px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.015em
  headline-md:
    fontFamily: DM Sans
    fontSize: 26px
    fontWeight: 600
    lineHeight: 1.25
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  ui-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  label-caps:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.08em
  mono-meta:
    fontFamily: DM Mono
    fontSize: 12.5px
    fontWeight: 400
    lineHeight: 1.4
  wordmark:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.01em
  book-title:
    fontFamily: DM Sans
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.3
  reader-body:
    fontFamily: Newsreader
    fontSize: 19px
    fontWeight: 400
    lineHeight: 1.7
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  section-y: 96px
  section-y-lg: 128px
  gutter: 24px
  card-pad: 32px
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  pill: 9999px
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    typography: "{typography.ui-sm}"
    rounded: "{rounded.sm}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-primary-dark:
    backgroundColor: "{colors.action-dark}"
    textColor: "{colors.on-action-dark}"
  input-text:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 14px
  card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-pad}"
  status-tag:
    typography: "{typography.label-caps}"
    rounded: "{rounded.pill}"
    padding: 7px
---

# Belief Changer — DESIGN.md (Quiet Editorial)

## Overview

A precise, document-style, premium-minimal interface in the tradition of the best
contemporary workspace products: white canvas, hairline structure, extreme typographic
clarity, color used only where it means something. The audience is unchanged and shapes
everything: visitors often arrive in distress, sometimes at 2am, sometimes about
subjects they would never say out loud. The interface answers with dignity, precision,
and zero friction — a calm, well-run reading room rendered as a modern editorial
product. Not a wellness brand, not a SaaS pitch, not a charity appeal.

The photorealistic books remain the emotional core and the richest color on any page;
the chrome around them is white, exact, and quiet. Ground truth is this document plus
the rendered reference `design/reference-homepage.html` (open it in a browser; both themes
via the toggle) plus the skills it adopts. A second art-direction reference,
`design/comp-6b-reference.png`, captures the intended warmth and calm of the whole
site; it is fully compatible in spirit, and where its details differ from the tokens
here, this document and the rendered reference win. It sits alongside (`skills/taste-skill`,
`skills/minimalist-skill`); where the two skills disagree with each other, this
document names the winner.

## Colors

- **Canvas** {colors.canvas} and **Band** {colors.band}: the site's signature contrast.
  Full-width sections alternate between pure white and this warm bone — a flat, honest
  two-tone rhythm (no shadow, no gradient) that makes zoning visible at a glance.
  White content panels sitting on warm bone is the look.
- **Surface** {colors.surface}: the lighter warm tint for small elements only — wells,
  kbd chrome, subtle input fills. Nothing else tints large areas.
- **Hairline** {colors.hairline}: the structural element of the whole system. 1px,
  always this value (or rgba(0,0,0,0.06) on imagery). Dividers between rows, borders on
  cards and inputs, column rules. One weight, one color, everywhere. Used with intent
  and generous whitespace, a hairline is precision, not slop; used as decoration it is
  banned (no crosshair grids, no lines that organize nothing).
- **Ink** {colors.ink}: near-black for text and for interaction. Links are ink with
  underlines; focus rings are ink; the primary button is solid ink. No brand accent
  color exists.
- **Ink-secondary** {colors.ink-secondary}: captions, metadata, helper text.
- **Pastel semantics** — exactly four, used ONLY for status meaning on small elements
  (tags, badges), never on sections or large surfaces:
  - {colors.pastel-green-bg}/{colors.pastel-green-ink} published · available
  - {colors.pastel-yellow-bg}/{colors.pastel-yellow-ink} being written · in progress
  - {colors.pastel-blue-bg}/{colors.pastel-blue-ink} in translation · informational
  - {colors.pastel-red-bg}/{colors.pastel-red-ink} errors · destructive confirmation
- The book covers (muted sage, terracotta, slate, ochre, dove…) supply every other drop
  of color the site has. Never crop, tint, or re-light them.

## Typography

- **DM Sans** is the site's single voice: display, UI, body, the wordmark, and book
  titles. Weight does the hierarchy (400/500/600), sentence case everywhere including
  headlines, tight tracking at display sizes only.
- **DM Mono** ({typography.mono-meta}) for machine facts: version numbers, request
  counts, changelog dates, keyboard hints. It marks "data, not prose."
- **Newsreader** survives in exactly one place: {typography.reader-body}, the reading
  surface itself (65–70ch, 1.7 line height). A book being read deserves book
  typography; everywhere else, including book titles on cards and pages, is DM Sans.
  (This is the adjudication between the two skills: taste-skill's sans-display rule
  wins everywhere except long-form reading, where minimalist-skill's editorial-serif
  instinct is functionally correct.)
- Non-Latin scripts: per-script system stacks; hierarchy must survive on weight and
  size alone.

## Layout

- **Hero: asymmetric split.** Text column left (left-aligned): headline ≤ 2 lines,
  subtext ≤ 20 words, ask-input + primary button. Asset right: the shelf (3D module or
  static cover row) or a single hero book. No centered manifesto.
- **Trust strip**: directly under the hero, four hairline-separated columns in
  {typography.label-caps}: "Free forever", "No signup", "No tracking", "Every
  language". (Middle dots are rationed site-wide: max one per line, metadata only.)
- Page max-width 1400px; text measure 65ch; 8px spacing scale; {spacing.section-y}
  between sections. **Sections alternate {colors.canvas} and {colors.band}** as the
  primary zoning device; hairline dividers separate sections only where two same-color
  sections meet. White cards sit on band sections; hairline-bordered cards sit on white.
- Section rhythm follows taste-skill discipline: ≥ 4 distinct layout families per page,
  max 2 consecutive image+text splits, eyebrows ≤ 1 per 3 sections, grids render
  exactly N cells for N items.

## Elevation & Depth

Flat, structured by two-tone banding and hairlines, with almost no shadow. The
canvas/band alternation carries macro depth; hairlines carry micro structure.

- Cards: {colors.canvas} + 1px {colors.hairline}, {rounded.lg}, generous padding.
  Hover lift: `0 2px 8px rgba(0,0,0,0.04)` over 200ms. Nothing heavier exists.
- Rows group with `divide-y` hairlines inside a bordered container, or with plain
  whitespace. Never boxed-card-inside-boxed-card.
- Sections must not feel flat-empty: permitted depth devices are a faint warm radial
  light spot (`radial-gradient`, opacity ≤ 0.03, on a fixed non-scrolling layer),
  desaturated warm photography at low opacity, or the books themselves. No grain
  overlays on scrolling containers, no glassmorphism beyond a subtle nav blur.

## Shapes

Crisp and engineered: buttons {rounded.sm}, inputs {rounded.md}, cards {rounded.lg}
maximum. **Pill radius is reserved for small tags and status badges only** — never
primary buttons, inputs, or containers. The books keep true right angles. One radius
system, documented here, applied everywhere; mixed systems are broken design.

## Components

- **Primary button**: solid {colors.action}, {colors.on-action} text, {rounded.sm},
  no shadow; hover {colors.action-hover}; active `scale(0.98)`. One primary action per
  screen; label ≤ 3 words, never wraps.
- **Ask input**: white field, 1px {colors.hairline} border, {rounded.md}, placeholder
  in {colors.ink-secondary} ("Tell us what you're going through..."); focus = 2px ink
  ring outside the border. Label above when in forms; never placeholder-as-label.
- **Subject chips** (finder grid): white, hairline-bordered, {rounded.md}, first-person
  phrasings in sentence case; hover: border darkens to ink; selected: solid ink with
  white text. Pastels are NOT used here — subjects are not statuses.
- **Status tags**: the four pastels, pill-shaped, {typography.label-caps}, tiny.
- **Book cards**: cover image (true corners, hairline on white if needed for edge
  definition) + {typography.book-title} beneath + one {typography.mono-meta} line
  (version · language count). The cover's own ground is the card's identity.
- **The shelf**: on the homepage, the 3D module sits on {colors.canvas} with real
  contact shadows; on flat pages, a static cover row inside a hairline-bordered,
  {colors.surface} band.
- **Accordion (FAQ)**: no container boxes; items separated by hairline `border-bottom`;
  clean `+` / `−` toggles.
- **Reader**: {colors.canvas} chrome; {typography.reader-body} at 65–70ch; chapter
  next/prev as ink links; comfort modes (light / sepia / dark) restyle the reading
  surface only.
- **Living-book block** (book pages): version, public changelog link, "improved from
  N reader experiences" — set in {typography.mono-meta}; this is functional content,
  sanctioned, not decoration.
- **Forms**: labels above, hairline inputs, helper below in {colors.ink-secondary},
  errors in {colors.pastel-red-ink} with plain prose.
- **Language switcher**: {typography.ui-sm}, native names, opens a hairline-bordered
  white panel.

## Motion

Barely there, motivated, or cut. Scroll entries fade-up 12px over ~600ms
(`cubic-bezier(0.16,1,0.3,1)`, 80ms stagger, IntersectionObserver). Interactive
transitions 150–200ms. Optional single ambient radial drift (≥ 20s, opacity ≤ 0.04,
fixed layer). transform/opacity only; `prefers-reduced-motion` collapses everything,
including the shelf (static cover row fallback). The 3D book/shelf follows its own
deterministic state machine.

## Dark Mode

The same document at night: {colors.canvas-dark} warm off-black (never blue-black,
never pure black), with {colors.band-dark} carrying the section alternation
(the two-tone rhythm survives, one step lighter),
hairlines {colors.hairline-dark}, text {colors.ink-dark}. The primary button inverts
(bone {colors.action-dark} with ink text). Pastel tags deepen: same hue families,
dark backgrounds with lightened ink (derive per pair, keep AA). The books never change
between themes; against the dark canvas they glow. Theme follows
`prefers-color-scheme` plus a quiet manual toggle; hierarchy parity between modes is
mandatory; test both before shipping anything.

## Internationalization & RTL

Unchanged and non-negotiable: logical CSS properties only, mirrored layouts under
`dir="rtl"`, Arabic metadata tested from day one, native-name language switching,
no text baked into images (titles are live text or runtime-composited textures),
locale catalogs with ICU messages, per-locale URLs and hreflang.

## Voice & Content

Warm to the person, harsh to the trap. Never shaming, never moralizing. First-person
subject names ("I can't stop scrolling"). Sentence case; no exclamation marks; no AI
clichés; zero em-dashes in visible copy (hyphen only); no fake numbers, no invented
testimonials. Trust facts stated plainly and often.

## Imagery & The Books

The books are the primary imagery and the emotional center — real production cover
assets exist in `assets/covers/` and are used wherever a book is present. Where a
section genuinely needs supporting imagery (per taste-skill: pages should not be
text-only), use high-quality desaturated warm-toned photography blended with a subtle
warm overlay, or monochrome continuous-line illustration with a single offset pastel
shape (minimalist-skill's illustration style). Real images only: no div-based fake
screenshots, no hand-rolled decorative SVGs, no AI-cliché art. UI icons: Phosphor
family, one strokeWidth globally. In production, no placeholder services; during
development, picsum seeds are acceptable and must be flagged for replacement.

## Creative Latitude

Locked: everything above. Free, and expected to be excellent: page-level composition
within the section-rhythm rules, the shelf's choreography, hairline-and-whitespace
rhythm on data-rich surfaces (library, request board, changelog), empty states
(they are real content here: "being written", request counts), the 404, and any
surface this document did not foresee. When improvising, ask: would this feel at home
in a beautifully set technical book from a prestige publisher? If it would feel at
home on a template marketplace, stop.

## Do's and Don'ts

- Do structure with 1px {colors.hairline} + whitespace; one hairline weight site-wide.
  Don't draw lines that organize nothing, and don't stack `border-t` + `border-b` on
  every row of long lists (group with sparse dividers instead).
- Do keep interaction ink-only (ink links, ink focus, ink button). Don't introduce a
  brand accent color.
- Do use the four pastels strictly for status semantics on small elements. Don't put
  pastels on sections, heroes, buttons, or subject chips.
- Do reserve pill radius for tags/badges. Don't ship pill primary buttons, pill
  inputs, or pill containers.
- Do keep DM Sans for all display and UI including book titles; Newsreader only inside
  the reader. Don't let serif leak into display or chrome.
- Do maintain WCAG AA in both themes; {colors.ink-secondary} is the lightest text on
  {colors.canvas}.
- Don't use pure #000000 or heavy drop shadows anywhere; hover lift is the ceiling.
- Don't use emojis, gradients-as-decoration, glassmorphism (beyond nav blur), glows,
  or middle-dot chains (max one · per line, metadata only).
- Do render exactly N cells for N items; empty states are content, not filler.
- Do respect `prefers-reduced-motion` with full static fallbacks including the shelf.
- Do treat the adopted skills as law where this document is silent; where the two
  skills disagree, this document's word wins.
