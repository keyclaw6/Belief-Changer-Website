# AGENTS.md

Start here. This file is the hierarchy and the map; the content lives in the files it
points to. Do not duplicate their content anywhere, including here.

## Read in this order

1. `VISION.md` — the mission and the laws the site must honor.
2. `STATUS.md` — what is done, what is running, what is next.
3. `DESIGN.md` — the design contract, with rendered references:
   `design/reference-homepage.html` (open in a browser, both themes) and
   `design/comp-6b-reference.png` (art direction: the intended warmth and calm).
4. `skills/taste-skill/SKILL.md` + `skills/minimalist-skill/SKILL.md` — the adopted
   craft baseline (also available: `redesign-skill`, `image-to-code-skill`,
   `output-skill`).
5. `skills/cover-generation/SKILL.md` + its `references/gallery.md` — the cover
   system. **Sacred: the prompt structure and anchor process are locked.**
   Then `skills/site-imagery/SKILL.md` + its `references/gallery.md` — the
   owner-locked two-voice system for all non-cover site imagery.
6. `assets/covers/` — production covers, `covers-manifest.json` (the interface),
   derived surfaces, with-text proofs.
7. `prompts/` — standing briefs (book asset in production; handoff orientation).

## Precedence

`DESIGN.md` > this file > `skills/` > your defaults. Where the skills disagree with
each other, DESIGN.md names the winner. The register and creative freedoms are
defined in DESIGN.md (Overview, Creative Latitude); build within them.

## Rules that live only here

- **Stack:** TanStack Start + TypeScript + Tailwind v4. Tokens as CSS variables from
  DESIGN.md (light + dark under `[data-theme]` + `prefers-color-scheme`, set once at
  the root). Fonts self-hosted (`@font-face`, `font-display: swap`). Motion
  (`motion/react`) for UI animation; Three.js (the book/shelf package) in isolated
  client leaves. No component design systems; Radix primitives for a11y behavior are
  fine.
- **Platform laws** (from VISION.md): every chapter server-rendered, indexable, with
  per-locale URLs and hreflang; no signup, no tracking, no cookies beyond
  theme/locale; RTL and locale catalogs from the first commit.
- **Assets are immutable:** never regenerate, crop, tint, or re-light the production
  covers. New covers only via `skills/cover-generation/` — verbatim. New site imagery
  only via `skills/site-imagery/` — verbatim.
- **Quality bar before any surface is "done":** taste-skill's Final Pre-Flight Check
  (§14) + DESIGN.md's Do's and Don'ts, in both themes, plus an RTL and
  reduced-motion pass.
