---
name: belief-changer-site-imagery
description: "Reproducible two-voice prompt system for generating Belief Changer WEBSITE imagery with GPT Image 2 (gpt-image-2): The Painted Life (fine-line classical oil painting of modern freedom) and The Quiet Fact (museum-restraint photography of real, hopeful places). Use whenever any site surface needs supporting imagery. The book-cover system is separate and sacred: skills/cover-generation/SKILL.md — never use this file for covers."
compatibility: "Any GPT Image 2 access path: gpt-image CLI, OpenAI API, or a host platform's native gpt-image-2 tool. quality=high for all final assets."
---

# Belief Changer — Site Imagery ("The Life Outside")

> Companion system to the sacred cover system, never a replacement for it.
> **The covers show the trap, disarmed, on a studio table. The site's imagery shows
> the life outside it.** Owner-locked 2026-08-07. Structural changes only on the
> owner's explicit instruction; new images follow this system verbatim.

Every accepted image's exact prompt, endpoint, and settings are recorded in
`references/gallery.md` — read it before generating anything.

## The feeling (read this before generating anything)

The visitor arrives believing escape is hard, gray, and full of sacrifice. Every site
image answers: **the way out exists, it is ordinary, and it feels like morning.**

- Relief, not triumph. Lightness, not luxury. Freedom made visible, not described.
- The scene is the world the visitor already lives in — their street, their window,
  their bridge, their park — recognizably today, never a period piece.
- We are celebrating: the visitor has found the way out. If an image makes quitting
  look like loss, it is wrong. If it makes ordinary life look quietly wonderful, it
  is right.
- Never melancholy, never nostalgia, never shame, never glamour. The owner's anchor
  painting supplies the CRAFT; its wistful solitary mood is explicitly NOT the target.
- Freedom must be legible in the picture itself: motion, release, fresh air, an open
  way. Mere pleasantness is not freedom — a person enjoying a coffee is NOT the brief.

## The two voices and the law

**THE LAW: photography states the facts; painting shows the life.** One voice per
section — the two never share a viewport moment.

- **Voice 1 — The Painted Life** (lead voice, roughly 4/5 of site imagery).
  Fine-line classical oil painting in the exact craft of `references/painting-anchor.jpg`:
  fine detailed brushwork, lush deep greens, dappled natural light, deep reflective
  water, soft atmospheric depth. Modern scenes, modern clothes, people of all ages
  welcome (and gender-balanced across the set). Jobs: the emotional surfaces — the
  homepage's method beats, how-it-works, the experience board's atmosphere, blog
  features.
- **Voice 2 — The Quiet Fact** (structural voice, roughly 1/5).
  The cover system's museum-restraint photography walked out of the studio into real
  modern places: one soft light, long quiet shadows, immaculate, no people. Hope
  arrives through light, air, and openness only. Jobs: moments that sit directly
  beside covers, the 404, quiet structural anchors. *(Owner note: Voice 2 assets may
  later be repainted into Voice 1 — treat them as replaceable.)*

Shared rules, both voices:
- **Textless, always.** Site copy is live HTML text; artwork never contains lettering.
- **Palette:** muted and harmonious; deep muted greens and blues lead; warm bone
  light; never a golden-yellow haze over everything; never neon, never AI-purple.
  Where natural, quote the series palette from `assets/covers/covers-manifest.json`
  ground hexes so the site rhymes with the library.
- **Dignity law (inherited from the cover system):** no shame styling, no glamour
  styling, brand-sterile, passes the "reading it on a train" test.
- **Negative space:** compose with room for the page — headlines live in calm skies
  and bare walls.

## Operating loop

1. **Choose the voice by job**: is this moment stating a fact or showing the life?
2. **Slot the template** (below): scene clause, people clause (Voice 1 only,
   optional), freedom note, palette note, targeted avoids.
3. **Series consistency protocol:**
   - Voice 1: ALWAYS pass `references/painting-anchor.jpg` as the reference image
     (edits endpoint / image input), with the invariant style language of the
     template. The anchor supplies craft only — the scene must be entirely new and
     modern.
   - Voice 2: text-to-image with the invariant grammar language; optionally pass an
     accepted Voice 2 reference for tonal continuity.
4. **Settings, always:** model `gpt-image-2` · `quality=high` · 3:2 for scenes
   (default), 16:9 for full-bleed bands, 1:1 for tiles.
5. **QA every output** (checklist below) — look at the image with your own vision.
6. **Log accepted images** in `references/gallery.md` with the exact prompt and
   settings; production files live under `assets/site/`.

## Voice 1 template — The Painted Life

```text
Using the reference image strictly as the painting-style anchor: fine detailed
classical oil brushwork, lush deep greens, dappled natural light, deep reflective
water, soft atmospheric depth, fine-line delicacy in grasses and foliage. Paint an
entirely NEW and MODERN scene in that exact style{: with NO people anywhere, when unpeopled}:
{SCENE_CLAUSE}. Contemporary everyday life, recognizably today. The feeling:
{FREEDOM_NOTE}. No text anywhere.

Avoid: period or vintage clothing or styling, Edwardian dress, melancholy or wistful
mood, {SUBJECT_AVOIDS}, saturated neon colors, AI-purple, golden-yellow haze over
everything, any text or lettering, borders or frames.
```

## Voice 2 template — The Quiet Fact

```text
A muted museum-restraint photograph of real modern life, calm and precise like a
prestige still-life photographer's work: {PLACE_CLAUSE}, one soft light, long quiet
shadows, {LIGHT_NOTE}. Real, contemporary, immaculate, {HOPE_NOTE}. Muted harmonious
palette: {PALETTE_NOTE}. No people anywhere, no text anywhere.

Avoid: clutter, props, people, lens flare, HDR drama, heavy warm yellow haze, gloom,
{SUBJECT_AVOIDS}, any text or lettering, borders or frames.
```

## Slot rules

| Slot | Rules |
|---|---|
| `SCENE_CLAUSE` (V1) | One clear subject in a modern everyday setting (city park, bridge, harbor, street, home). Name the modern elements explicitly ("modern rain jacket", "modern pedestrian bridge dissolved softly in the distance") or the model drifts period. State the emotional posture ("upright and unburdened", "quiet contentment"). |
| People (V1 only) | Optional. Modern clothes, deliberately varied ages (not just the young), gender-balanced across the set as a whole, faces content rather than performative. Unpeopled Voice 1 scenes are equally canonical (see No. 02). |
| `FREEDOM_NOTE` | Must make freedom legible, one phrase: "freedom, ease, motion, having left something heavy behind for good" / "release, rising, freedom". Never mere pleasantness. |
| `PLACE_CLAUSE` (V2) | One real modern place in a hopeful state: a window standing open, an empty street after rain, morning light into a quiet room. The hopeful state is explicit (open, fresh, clearing). |
| `LIGHT_NOTE` / `HOPE_NOTE` (V2) | Cool fresh light with first gentle warmth; hope named plainly ("the feeling of fresh air finally let in"). |
| `PALETTE_NOTE` | Deep muted greens and blues lead; warm bone light; optionally quote manifest ground hexes ("muted slate blue", "deep muted moss green"). Never yellow-haze-everything. |
| `SUBJECT_AVOIDS` | 2–5 targeted negatives for the scene's likely bad default. Streets: "traffic, readable signage". Windows: "theatrical billowing curtains, clutter". People: "racing gear, fashion-editorial glamour". |

## Rejected directions (do not resurrect without owner instruction)

Tested with the owner on 2026-08-07 and rejected for site imagery:

- Loose watercolor washes and ink-line + wash illustrations (too soft; owner passed).
- Layered abstract gradient veils (owner passed).
- A golden-yellow haze over every scene (owner explicitly corrected: vary color, lead
  with deep greens and blues).
- Wistful, solitary, backward-looking framing — the anchor painting's mood.
- Pleasantness standing in for freedom (the "man with a coffee cup" note).
- The specimen grammar used for site moods (the empty birdcage read as "a bit
  depressing" at page scale; specimen restraint belongs to the covers and to Voice 2's
  places, not to symbolic objects on site pages).

## QA checklist (every output)

- Feeling: does it read as relief, morning, the life outside? Would a visitor in a
  hard moment feel *welcomed forward*, not lectured or saddened?
- Freedom legible in the image itself (motion / release / air / openness)?
- Modern and recognizable (no period drift), dignity law passed, train test passed?
- Palette: muted, deep greens/blues present, no yellow haze, no neon, no AI-purple?
- ZERO text or lettering anywhere; negative space available for the page's copy?
- Voice purity: painted craft matches the anchor (V1) / photographic restraint
  matches the covers (V2)?

## The current references

See `references/gallery.md`: the owner-provided painting anchor plus four accepted
canon images (2 per voice), each with its exact prompt and settings.
