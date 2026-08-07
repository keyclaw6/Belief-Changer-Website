# Belief Changer — Website

Design system, production assets, and agent briefs for the Belief Changer website:
a free, multilingual library of belief-change books. The mission, method, and
platform vision live in [`VISION.md`](VISION.md). The current state of work and the
roadmap live in [`STATUS.md`](STATUS.md).

## What this repo is

The complete build kit for the site's front end. Everything an agent (or human)
needs to design and build the site consistently: the locked design contract, the
adopted craft skills, the cover-art generation system, the production cover assets,
and the standing briefs for the specialized build agents.

## Map

```
VISION.md                     The project: mission, method, platform
STATUS.md                     Current state + roadmap
DESIGN.md                     The design contract ("Quiet Editorial") - tokens + prose
AGENTS.md                     Always-read guardrails for build agents (precedence, bans, gates)

design/
  reference-homepage.html     Rendered ground-truth homepage reference (light/dark toggle)

skills/
  taste-skill/SKILL.md        Anti-slop frontend discipline (adopted)
  minimalist-skill/SKILL.md   Premium utilitarian minimalism protocol (adopted)
  LICENSE                     Upstream MIT license (see Attribution below)

prompts/
  COVER-SYSTEM.md             Reproducible gpt-image-2 cover generation runbook
  BOOK-ASSET-BRIEF.md         Standing brief for the 3D book asset agent (in production)
  HANDOFF.md                  Orientation brief for the next build agent

assets/covers/
  01..10-*.png                10 production cover textures (textless, 2:3, "Specimen Series")
  covers-manifest.json        Per-book: slug, object, ground, groundHex, overlayInk
  derived/                    Spine + back textures derived from each front
  proofs/                     With-text calibration renders (overlay typography ground truth)

scripts/
  derive-surfaces.py          Front texture -> spine/back textures + manifest hexes

docs/
  book-asset-pipeline-proposal.md   Blender->GLB->Three.js book pipeline (adopted architecture)
```

## Reading order for a new agent

1. `VISION.md` — why this exists and the laws the site must honor
2. `STATUS.md` — what is done, what is running, what is next
3. `DESIGN.md` — how everything must look and feel
4. `AGENTS.md` — how to work without breaking it
5. `prompts/` — the standing briefs

## Design system in one paragraph

Quiet Editorial: white canvas alternating with warm bone bands (`#EBE7DF`), 1px
hairline structure, ink-only interaction, crisp radii, four pastel status semantics,
DM Sans + DM Mono (Newsreader inside the reader only), split hero, and photorealistic
books as the only rich color on the site. Both themes, every language, RTL from day
one, WCAG AA everywhere. Open `design/reference-homepage.html` to see it rendered.

## Attribution

`skills/` vendors two skills from
[Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT), adopted as this
project's craft baseline. The cover runbook format follows
[wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/gpt_image_2_skill).
The book pipeline consumes ideas from
[MengTo/complete-shelf](https://github.com/MengTo/complete-shelf)'s published build
approach. The design-contract format follows
[google-labs-code/design.md](https://github.com/google-labs-code/design.md).
