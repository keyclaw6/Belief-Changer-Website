# Cover Generation Gallery — exact prompts and process

> **SACRED — DO NOT MODIFY.** This gallery is the reproduction record for the entire
> series. Every production cover below was accepted by the owner; its prompt,
> endpoint, and settings are recorded verbatim. New covers reuse this process
> exactly. Never regenerate an existing cover.

## The process (how every future cover is made)

1. **The anchor is `../../../assets/covers/01-sugar.png`** (entry No. 01 below). It defines the
   series: composition, lighting direction, shadow character, object placement,
   photographic register.
2. Every other cover is generated through the **edits endpoint** with the anchor
   passed as the reference image, using the invariant wrapper from No. 02-10 below:
   keep everything identical, change ONLY the object and the ground color.
3. Settings, always: model `gpt-image-2` · size `1024x1536` (2:3 portrait) ·
   `quality=high` · production covers are TEXTLESS.
4. After acceptance: run `../../../scripts/derive-surfaces.py` (spine/back textures + manifest
   hexes) and add the new cover's entry to this gallery with its exact prompt.
5. Slot rules, dignity law, and QA checklist: see `../SKILL.md`.

---

## Production covers (textless assets in `../../../assets/covers/`)

### No. 01 · The Sugar Trap — THE SERIES ANCHOR

- Image: `../../../assets/covers/01-sugar.png`
- Metadata: Production · text-to-image (generations endpoint) · 1024x1536 · high · gpt-image-2

```text
A full-bleed museum-restraint still life photograph, filling the entire frame edge to edge with no borders and no frames: a single white sugar cube on a seamless pale dove-gray studio backdrop ground, one soft directional light from the upper left, a long quiet shadow, the object placed in the lower third of the frame, vast calm empty negative space above it — dignified and specimen-like, clinical calm. This is flat printed cover artwork, not a photograph of a book: no book, no pages, no spine, no perspective, no table edge, no outer background, no text, no lettering, no logos anywhere.

Avoid: any text or typography, borders or frames, a rendered book object, glamour or advertising styling, appetizing dessert styling, gloss and reflections, gold ornament, AI-purple, busy props.
```

### No. 02 · The Smoking Trap

- Image: `../../../assets/covers/02-smoking.png`
- Metadata: Production · edits endpoint, reference = 01-sugar.png · 1024x1536 · high

```text
Using the reference image as the exact series anchor for a book-cover photography series: keep the composition system, the object placement in the lower third, the soft directional lighting from the upper left, the long quiet shadow, the vast empty negative space above, and the museum-restraint photographic character absolutely identical. Change ONLY two things: replace the sugar cube with a single unlit cigarette lying flat, and change the seamless studio backdrop ground to muted sage green. This remains flat printed cover artwork, not a photograph of a book: no book, no perspective, no text, no lettering, no logos anywhere.

Avoid: lit cigarette, smoke, ash, ashtray, packaging or brand marks, any text or typography, borders or frames, gloss, gold ornament, AI-purple, busy props.
```

### No. 03 · The Scrolling Trap

- Image: `../../../assets/covers/03-scrolling.png`
- Metadata: Production · edits endpoint, reference = 01-sugar.png · 1024x1536 · high

```text
Using the reference image as the exact series anchor for a book-cover photography series: keep the composition system, the object placement in the lower third, the soft directional lighting from the upper left, the long quiet shadow, the vast empty negative space above, and the museum-restraint photographic character absolutely identical. Change ONLY two things: replace the sugar cube with a single smartphone lying flat at rest, face up with its screen completely dark and off, and change the seamless studio backdrop ground to muted slate blue. This remains flat printed cover artwork, not a photograph of a book: no book, no perspective, no text, no lettering, no logos anywhere.

Avoid: glowing screen, app icons, notifications, brand logos, camera bump facing up, cracked glass, hands, any text or typography, borders or frames, gloss, gold ornament, AI-purple, busy props.
```

### No. 04 · The Porn Trap

- Image: `../../../assets/covers/04-porn.png`
- Metadata: Production · edits endpoint, reference = 01-sugar.png · 1024x1536 · high

```text
Using the reference image as the exact series anchor for a book-cover photography series: keep the composition system, the object placement in the lower third, the soft directional lighting from the upper left, the long quiet shadow, the vast empty negative space above, and the museum-restraint photographic character absolutely identical. Change ONLY two things: replace the sugar cube with a single loosely crumpled white paper tissue, and change the seamless studio backdrop ground to warm greige, a warm gray-beige. This remains flat printed cover artwork, not a photograph of a book: no book, no perspective, no text, no lettering, no logos anywhere.

Avoid: any suggestive imagery, bodies, skin, screens, liquids, tissue box, any text or typography, borders or frames, gloss, gold ornament, AI-purple, busy props.
```

### No. 05 · The Alcohol Trap

- Image: `../../../assets/covers/05-alcohol.png`
- Metadata: Production · edits endpoint, reference = 01-sugar.png · 1024x1536 · high

```text
Using the reference image as the exact series anchor for a book-cover photography series: keep the composition system, the object placement in the lower third, the soft directional lighting from the upper left, the long quiet shadow, the vast empty negative space above, and the museum-restraint photographic character absolutely identical. Change ONLY two things: replace the sugar cube with a single empty wine glass standing upright, completely clean and empty, and change the seamless studio backdrop ground to deep muted moss green. The glass is empty: quietly hopeful. This remains flat printed cover artwork, not a photograph of a book: no book, no perspective, no text, no lettering, no logos anywhere.

Avoid: wine or any liquid in the glass, bottles, bar props, celebration styling, any text or typography, borders or frames, gold ornament, AI-purple, busy props.
```

### No. 06 · The Gaming Trap

- Image: `../../../assets/covers/06-gaming.png`
- Metadata: Production · edits endpoint, reference = 01-sugar.png · 1024x1536 · high

```text
Using the reference image as the exact series anchor for a book-cover photography series: keep the composition system, the object placement in the lower third, the soft directional lighting from the upper left, the long quiet shadow, the vast empty negative space above, and the museum-restraint photographic character absolutely identical. Change ONLY two things: replace the sugar cube with a single generic matte gray video game controller lying at rest with plain unlabeled buttons, and change the seamless studio backdrop ground to dusty ochre. This remains flat printed cover artwork, not a photograph of a book: no book, no perspective, no text, no lettering, no logos anywhere.

Avoid: brand logos, lettered buttons, glowing LEDs, cables, any text or typography, borders or frames, gloss, gold ornament, AI-purple, busy props.
```

### No. 07 · The Junk Food Trap

- Image: `../../../assets/covers/07-junkfood.png`
- Metadata: Production · edits endpoint, reference = 01-sugar.png · 1024x1536 · high

```text
Using the reference image as the exact series anchor for a book-cover photography series: keep the composition system, the object placement in the lower third, the soft directional lighting from the upper left, the long quiet shadow, the vast empty negative space above, and the museum-restraint photographic character absolutely identical. Change ONLY two things: replace the sugar cube with a single french fry lying flat, and change the seamless studio backdrop ground to muted terracotta. This remains flat printed cover artwork, not a photograph of a book: no book, no perspective, no text, no lettering, no logos anywhere.

Avoid: burgers, piles of food, appetizing glamour styling, ketchup, packaging, steam, any text or typography, borders or frames, gloss, gold ornament, AI-purple, busy props.
```

### No. 08 · The Vaping Trap

- Image: `../../../assets/covers/08-vaping.png`
- Metadata: Production · edits endpoint, reference = 01-sugar.png · 1024x1536 · high

```text
Using the reference image as the exact series anchor for a book-cover photography series: keep the composition system, the object placement in the lower third, the soft directional lighting from the upper left, the long quiet shadow, the vast empty negative space above, and the museum-restraint photographic character absolutely identical. Change ONLY two things: replace the sugar cube with a single generic matte vape pen lying flat, plain cylindrical design, and change the seamless studio backdrop ground to soft eucalyptus gray-green. This remains flat printed cover artwork, not a photograph of a book: no book, no perspective, no text, no lettering, no logos anywhere.

Avoid: vapor clouds, smoke, glowing LED, brand marks, candy colors, any text or typography, borders or frames, gloss, gold ornament, AI-purple, busy props.
```

### No. 09 · The Overthinking Trap

- Image: `../../../assets/covers/09-overthinking.png`
- Metadata: Production · edits endpoint, reference = 01-sugar.png · 1024x1536 · high

```text
Using the reference image as the exact series anchor for a book-cover photography series: keep the composition system, the object placement in the lower third, the soft directional lighting from the upper left, the long quiet shadow, the vast empty negative space above, and the museum-restraint photographic character absolutely identical. Change ONLY two things: replace the sugar cube with a single tangled knot of soft gray thread with one loose end trailing free toward the light, and change the seamless studio backdrop ground to muted dusty rose. This remains flat printed cover artwork, not a photograph of a book: no book, no perspective, no text, no lettering, no logos anywhere.

Avoid: brains, heads, gears, many scattered threads, any text or typography, borders or frames, gloss, gold ornament, AI-purple, busy props.
```

### No. 10 · The Complaining Trap

- Image: `../../../assets/covers/10-complaining.png`
- Metadata: Production · edits endpoint, reference = 01-sugar.png · 1024x1536 · high

```text
Using the reference image as the exact series anchor for a book-cover photography series: keep the composition system, the object placement in the lower third, the soft directional lighting from the upper left, the long quiet shadow, the vast empty negative space above, and the museum-restraint photographic character absolutely identical. Change ONLY two things: replace the sugar cube with a single chrome water tap with one suspended water droplet hanging beneath its spout, and change the seamless studio backdrop ground to warm sand beige. This remains flat printed cover artwork, not a photograph of a book: no book, no perspective, no text, no lettering, no logos anywhere.

Avoid: sink, bathroom scene, pipes, splashing or running water, any text or typography, borders or frames, gloss beyond the chrome itself, gold ornament, AI-purple, busy props.
```

---

## With-text calibration proofs (`../../../assets/covers/proofs/`)

Not assets — ground truth for how overlay typography must look on finished books
(title serif placement, series mark, spine typography). Generated with the
calibration template in `../SKILL.md`.

### Proof · The Sugar Trap, with text

- Image: `../../../assets/covers/proofs/with-text-sugar.png`
- Metadata: Proof · text-to-image · 1024x1536 · high

```text
A photorealistic modern hardcover book standing upright, front cover fully visible, perfectly straight-on, centered on a very light warm white studio background with a soft diffuse contact shadow. Book proportions 2:3 portrait. The cover is matte printed paper over board, smooth, no gloss, no cloth, no dust jacket flaps visible.

COVER DESIGN — full-bleed photograph, modern minimal trade cover: the entire front cover edge to edge is one museum-restraint still life photograph with no borders, no frames, no cloth margin: a single white sugar cube resting on a seamless pale warm-gray studio ground, one soft directional light from the upper left, a long quiet shadow, the cube placed in the lower third, vast calm negative space above it — dignified and specimen-like, absolutely not appetizing food advertising. Overlaid directly on the photograph in the upper negative space: the title "The Sugar Trap" in elegant charcoal serif, centered. At the very foot of the cover, small letterspaced serif capitals "BELIEF CHANGER". Crisp, legible, correctly spelled text.

Avoid: cloth texture on the front, borders or frames around the image, appetizing dessert styling, gloss and reflections, gold ornament, AI-purple, garbled text, any text beyond the title and series mark.
```

### Proof · The Smoking Trap, with text

- Image: `../../../assets/covers/proofs/with-text-smoking.png`
- Metadata: Proof · text-to-image · 1024x1536 · high

```text
A photorealistic modern hardcover book standing upright, front cover fully visible, perfectly straight-on, centered on a very light warm white studio background with a soft diffuse contact shadow. Book proportions 2:3 portrait. The cover is matte printed paper over board, smooth, no gloss, no cloth, no dust jacket flaps visible.

COVER DESIGN — full-bleed photograph, modern minimal trade cover: the entire front cover edge to edge is one museum-restraint still life photograph with no borders, no frames: a single unlit cigarette lying flat on a seamless pale warm-gray studio ground, one soft directional light from the upper left, a long quiet shadow, the cigarette placed in the lower third, vast calm negative space above it — dignified and specimen-like, clinical calm, absolutely not glamorous or advertising-like. Overlaid directly on the photograph in the upper negative space: the title "The Smoking Trap" in elegant charcoal serif, centered. At the very foot of the cover, small letterspaced serif capitals "BELIEF CHANGER". Crisp, legible, correctly spelled text.

Avoid: lit cigarette, smoke, ash, ashtray, packaging or brand marks, glamour styling, borders or frames, cloth texture, gloss, gold ornament, AI-purple, garbled text, any text beyond the title and series mark.
```

### Proof · The Scrolling Trap, with text

- Image: `../../../assets/covers/proofs/with-text-scrolling.png`
- Metadata: Proof · text-to-image · 1024x1536 · high

```text
A photorealistic modern hardcover book standing upright, front cover fully visible, perfectly straight-on, centered on a very light warm white studio background with a soft diffuse contact shadow. Book proportions 2:3 portrait. The cover is matte printed paper over board, smooth, no gloss, no cloth, no dust jacket flaps visible.

COVER DESIGN — full-bleed photograph, modern minimal trade cover: the entire front cover edge to edge is one museum-restraint still life photograph with no borders, no frames: a single smartphone lying face down, screen hidden against the ground, perfectly at rest, on a seamless pale warm-gray studio ground, one soft directional light from the upper left, a long quiet shadow, the phone placed in the lower third, vast calm negative space above it — dignified and specimen-like, clinical calm, the device finally quiet. Overlaid directly on the photograph in the upper negative space: the title "The Scrolling Trap" in elegant charcoal serif, centered. At the very foot of the cover, small letterspaced serif capitals "BELIEF CHANGER". Crisp, legible, correctly spelled text.

Avoid: glowing screen, app icons, notifications, brand logos or Apple logo, cracked glass, hands, borders or frames, cloth texture, gloss, gold ornament, AI-purple, garbled text, any text beyond the title and series mark.
```

### Proof · Spine, three-quarter view

- Image: `../../../assets/covers/proofs/spine-three-quarter.png`
- Metadata: Proof · text-to-image · 1024x1536 · high

```text
A photorealistic modern hardcover book standing upright at a three-quarter angle, rotated so that BOTH the front cover AND the spine are clearly visible, centered on a very light warm white studio background with a soft diffuse contact shadow. Book proportions 2:3 portrait, substantial hardcover thickness. The cover is matte printed paper over board, smooth, no gloss, no cloth, no dust jacket.

FRONT COVER (seen in perspective): full-bleed museum-restraint still life photograph, no borders: a single white sugar cube resting on a seamless pale warm-gray studio ground, soft directional light, long quiet shadow, cube in the lower third, vast negative space; the title "The Sugar Trap" in elegant charcoal serif overlaid in the upper negative space; small letterspaced serif capitals "BELIEF CHANGER" at the foot.

SPINE (facing the viewer at the angle): the same seamless pale warm-gray ground continues around from the front cover onto the spine with no seam or color break. On the spine, running vertically from top to bottom: the title "The Sugar Trap" in elegant charcoal serif. Near the foot of the spine, very small letterspaced serif capitals "BELIEF CHANGER". Clean flat matte spine, crisp legible correctly spelled text, believable book-design typography.

Also faintly visible: the cream page block edge on the open side. Soft warm ambient light, extremely diffuse shadows, quiet museum-photography restraint, production-quality book mockup.

Avoid: cloth texture, dust jacket flaps, gloss and reflections, borders or frames, gold ornament, warped or garbled text, any text beyond the title and series mark on each surface.
```

### Proof · Spine row, four-book series

- Image: `../../../assets/covers/proofs/spine-row-series.png`
- Metadata: Proof · text-to-image · 1536x1024 (3:2) · high

```text
A photorealistic shelf photograph: four modern hardcover books standing side by side with their SPINES facing the viewer, on a pale light-oak wooden shelf against a very light warm white wall. Straight-on view of the row of spines, soft warm ambient light from above left, gentle diffuse contact shadows, quiet museum-photography restraint. The books have slightly different heights and thicknesses for realism, matte printed paper-over-board covers, no dust jackets, no cloth.

SPINE DESIGN SYSTEM — all four spines share one strict series design: seamless pale warm-gray matte ground, a vertical title running top to bottom in elegant charcoal serif, and very small letterspaced serif capitals "BELIEF CHANGER" near the foot of each spine. The four vertical spine titles read exactly, left to right: "The Sugar Trap", "The Smoking Trap", "The Scrolling Trap", "The Porn Trap". Crisp, legible, correctly spelled text on every spine, believable book typography, consistent alignment across all four.

The cream page block edges visible on top of the books. Production-quality mockup of a uniform publisher series on a shelf.

Avoid: colored spines, cloth texture, dust jackets, gloss, borders, ornament, gold, warped or garbled text, any text beyond each title and the series mark.
```

*(Note: production spine text is composited at runtime per language; the spine proofs
document the typographic look the runtime compositing must reproduce. The production
scrolling cover shows the phone face up with a dark screen — see No. 03 — which
superseded the face-down pose in this proof.)*
