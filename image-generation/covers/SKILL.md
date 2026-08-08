---
name: belief-changer-covers
description: "Reproducible prompt system for generating Belief Changer book-cover artwork with GPT Image 2 (gpt-image-2). Use whenever a new book or subject needs a cover, a ground-color variant, or a series-consistent regeneration. Follows the locked 'Specimen Series' design language."
compatibility: "Any GPT Image 2 access path: gpt-image CLI, OpenAI API, or a host platform's native gpt-image-2 tool. quality=high for all final assets."
---

# Belief Changer — Cover System ("The Specimen Series")

> **SACRED — DO NOT MODIFY.** The prompt structure in this file and the anchor process
> in `references/gallery.md` are locked. They are how every cover in the library stays
> part of one series. Changes happen only on the owner's explicit instruction. New
> covers follow this system verbatim; they never improvise on it.

Agent runbook for producing cover artwork, in the GPT-Image2-Skill operating-loop
format so any current or future model can replicate the series exactly.
Every accepted cover's exact prompt, endpoint, and settings are recorded in
`references/gallery.md` — read it before generating anything.

## The locked design language

One grammar for every book in the library:

> **A museum-restraint still-life photograph, full-bleed, edge to edge.
> One object as specimen on a seamless studio-backdrop ground.
> Soft directional light from the upper left. A long quiet shadow.
> Object in the lower third. Vast calm negative space above —
> that emptiness is the title's home, and the title is added by CODE, not by the image model.**

- **Dignity law:** the object is a specimen, never an advertisement and never an
  accusation. No glamour styling, no shame styling. For sensitive subjects the object
  is more metonymic; it must pass the "reading it on a train" test.
- **Escape orientation:** where an object state can lean hopeful (a phone asleep, a
  cigarette unlit, a glass empty), choose the hopeful state. The trap is presented
  already disarmed.
- **Grounds vary per book**: muted, desaturated studio-backdrop colors from the series
  palette. Never one uniform gray across the library, never neon, never saturated
  primaries.
- **Text:** production artwork is generated TEXTLESS. Titles, subtitle lines, and the
  series mark are overlaid at runtime (live text on flat pages; canvas-composited into
  textures for the 3D shelf) so one artwork serves every language. With-text
  generations exist only as calibration proofs (see `../../assets/covers/proofs/`).
- **Typography for overlays** (validated in the with-text proofs): title in an elegant
  classical serif, charcoal `#2F3437` on light grounds / warm bone `#F5F1E8` on deep
  grounds, centered in the upper negative space; series mark "BELIEF CHANGER" in small
  letterspaced serif capitals at the foot. Per-book ink lives in
  `../../assets/covers/covers-manifest.json` (`overlayInk`, chosen by WCAG contrast
  ratio).

## Operating loop

1. **Slot the template** (below): object clause, ground color, title (calibration
   only) or textless (production).
2. **Series consistency protocol:** the first accepted cover of a batch is the ANCHOR
   (for the existing library: `../../assets/covers/01-sugar.png` — see
   `references/gallery.md` for its exact prompt and every edit made from it). Generate every other
   cover with the edits endpoint, passing the anchor as reference image, with
   invariant language: "same composition system, same lighting direction, same object
   scale and placement in the lower third, same photographic character; change ONLY
   the object to [X] and the ground color to [Y]". This eliminates ground-tone and
   lighting drift across independent generations.
3. **Always `quality=high`,** size `1024x1536` (2:3 portrait).
4. **QA every output**: object reads as specimen (not ad, not shame); shadow soft and
   single-sourced; ground even and seamless; for production assets, ZERO text or
   lettering anywhere; upper two-fifths effectively empty (reserved for overlay).
5. **Run `../../scripts/derive-surfaces.py`** after accepting new covers: it produces
   matching spine and back textures and fills `groundHex` + `overlayInk` in the
   manifest.
6. **Log accepted covers** in the manifest so the series stays reproducible.

## Prompt template — PRODUCTION (textless texture asset)

```text
A full-bleed museum-restraint still life photograph, filling the entire frame edge to edge
with no borders and no frames: {OBJECT_CLAUSE} on a seamless {GROUND_COLOR} studio backdrop
ground, one soft directional light from the upper left, a long quiet shadow, the object
placed in the lower third of the frame, vast calm empty negative space above it — dignified
and specimen-like, clinical calm{, ESCAPE_NOTE}. This is flat printed cover artwork, not a
photograph of a book: no book, no pages, no spine, no perspective, no table, no outer
background, no text, no lettering, no logos anywhere.

Avoid: any text or typography, borders or frames, a rendered book object, glamour or
advertising styling, {SUBJECT_AVOIDS}, gloss and reflections, gold ornament, AI-purple,
busy props.
```

## Prompt template — CALIBRATION (with text, proof only)

Same design, rendered ON a book WITH text, for evaluating the finished look:

```text
A photorealistic modern hardcover book standing upright, front cover fully visible,
perfectly straight-on, centered on a very light warm white studio background with a soft
diffuse contact shadow. Book proportions 2:3 portrait. The cover is matte printed paper
over board, smooth, no gloss, no cloth, no dust jacket flaps visible.

COVER DESIGN — full-bleed photograph, modern minimal trade cover: the entire front cover
edge to edge is one museum-restraint still life photograph with no borders, no frames:
{OBJECT_CLAUSE} on a seamless {GROUND_COLOR} studio ground, one soft directional light from
the upper left, a long quiet shadow, the object placed in the lower third, vast calm
negative space above it — dignified and specimen-like, clinical calm{, ESCAPE_NOTE}.
Overlaid directly on the photograph in the upper negative space: the title "{TITLE}" in
elegant charcoal serif, centered. At the very foot of the cover, small letterspaced serif
capitals "BELIEF CHANGER". Crisp, legible, correctly spelled text.

Avoid: {SUBJECT_AVOIDS}, borders or frames, cloth texture, gloss, gold ornament, AI-purple,
garbled text, any text beyond the title and series mark.
```

## Slot rules

| Slot | Rules |
|---|---|
| `OBJECT_CLAUSE` | One object, singular, concrete, at rest. Literal for substances ("a single unlit cigarette lying flat"); metonymic for behaviors ("a single smartphone lying at rest, screen dark"); symbolic for pure abstractions ("a single tangled knot of soft gray thread"). State the hopeful/disarmed state explicitly where one exists. Brand-sterile: generic shapes, no logos, no lettered buttons. |
| `GROUND_COLOR` | Muted, desaturated studio backdrop paper: "muted sage green", "dusty terracotta", "deep muted moss green", "pale dove gray". |
| `ESCAPE_NOTE` | Optional one-phrase hopeful reading: "the device finally quiet" / "the glass is empty: quietly hopeful". |
| `SUBJECT_AVOIDS` | 2-5 targeted negatives for the model's likely bad default. Smoking: "lit cigarette, smoke, ash, ashtray, packaging". Scrolling: "glowing screen, app icons, notifications, brand logos". Sensitive subjects: "any explicit or suggestive imagery, bodies, skin". Food: "appetizing dessert styling, spreads of food". |
| `TITLE` (calibration only) | Series formula: "The {Subject} Trap". Always quoted verbatim. |

## Sensitive-subject law (hard rule)

The more sensitive the subject, the more restrained the object. The image must stay
fully non-explicit and dignified in isolation — meaning arrives only through the title
overlay. Never prompt explicit context into the image model; prompt the neutral object
and let the book's title do the naming. Must pass: "Would someone read this cover on a
train?" (Example: the porn book's object is a single loosely crumpled white paper
tissue — a mundane object until the title lands.)

## Physical/3D asset notes (for the site's Three.js shelf)

- Production artwork = FLAT texture: no book render, no book shadow, no outer
  background. The still life's own internal shadow IS part of the artwork and stays.
- Spine and back textures are NOT generated: `../../scripts/derive-surfaces.py` extracts each
  front's ground gradient and grain and renders seamless `{slug}-spine.png` /
  `{slug}-back.png` (in `../../assets/covers/derived/`), plus exact `groundHex` values.
- The engine (Three.js PBR) supplies book geometry, material response, scene lighting,
  and contact shadows. Never bake those into artwork.
- The with-text calibration renders in `../../assets/covers/proofs/` are the art-direction
  references for how finished books (front and spine typography) must look.

## The current library (10 production covers)

See `../../assets/covers/covers-manifest.json` for the authoritative list: slug, object
clause, ground description, sampled `groundHex`, and `overlayInk` per book. The
manifest is the interface consumed by the site and the 3D book component.
