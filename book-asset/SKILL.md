---
name: book-asset
description: "Create or rebuild a photoreal Three.js hardcover for the Belief Changer library from a textless cover texture, cover/spine headlines, and 11 pages of writing. Use when adding a book, swapping a cover, rewriting titles or interior copy, or compiling books/<slug> into reader and shelf HTML."
license: UNLICENSED
compatibility: "Python 3.9+ with Pillow. No npm required to mint or compile a book. Open the compiled HTML in a browser to QA."
metadata:
  author: keyclaw6
  version: "1.0"
  repo: keyclaw6/Belief-Changer-Website
---

# Belief Changer — 3D Book

Mint a new title, or rebuild an existing one, without touching the Three.js engine.

The finished book is already built. A new agent does **not** model geometry, does **not** reopen the Blender brief, and does **not** invent a second runtime. It copies `books/00-template`, swaps the cover and the words, and compiles.

## When to use

- A new subject needs a 3D hardcover (after the cover artwork exists).
- Headlines, spine, blurb, or interior writing must change.
- `products/<slug>-reader.html` / `products/<slug>-shelf.html` are stale.

Do **not** use this skill to generate cover photography. That is `../image-generation/covers/SKILL.md` (sacred). Do **not** use it to build the shelf room or the site hero chrome; those consume the products this skill emits.

## Read first

1. This file.
2. `books/00-template/book.json` and `books/00-template/content.json` — the working example.
3. `references/content-schema.md` — page types and the 11-page map.
4. Only if compiling or integrating: `references/runtime.md`.

Cover photography, if a new front is needed: `../image-generation/covers/SKILL.md`, then `../scripts/derive-surfaces.py`. Prefer an already-accepted file from `../assets/covers/`.

## Layout

```
book-asset/
├── SKILL.md                 ← this skill
├── README.md
├── books/<slug>/            ← the only authoring surface
│   ├── book.json            ← slug, cover filename, optional caseColor
│   ├── content.json         ← headlines + 11 pages
│   ├── cover.webp           ← textless 2:3 front
│   └── logos/               ← optional marks referenced by pages
├── products/                ← compiled, do not hand-edit
│   ├── <slug>-reader.html
│   └── <slug>-shelf.html
├── assets/materials/        ← shared paper/binding scans (do not per-book)
├── scripts/
│   ├── new_book.py
│   ├── build_book.py
│   └── validate_book.py
└── references/
    ├── content-schema.md
    └── runtime.md
```

`00-template` (`The Craft of Attention`) is the gold source. Its products are the engine. Every other slug is data.

## Operating loop

### 1. Confirm the cover exists

Need a new front? Stop. Generate it with the cover skill. Production files are immutable once accepted.

A cover for this runtime must be:

- textless (no title, no series mark, no lettering)
- 2:3 portrait
- full-bleed specimen on a seamless ground
- unused upper negative space (that is where type sits)

### 2. Create the slug folder

From the repo root:

```bash
python3 book-asset/scripts/new_book.py sugar \
  --title "The Sugar Trap" \
  --cover assets/covers/01-sugar.png
```

This copies `00-template`, writes the new title into meta/front/spine/title-page, and copies the cover. It does **not** rewrite the body prose — that is the next step.

To rebuild an existing slug, skip this and edit `books/<slug>/` in place.

### 3. Rewrite `content.json`

Replace every template sentence. The validator rejects a non-template slug that still titles itself `The Craft of Attention`.

Minimum edits:

- `meta` — title, subtitle, author, imprint
- `frontCover` — eyebrow, title, subtitle, author, edition
- `spine` — title, author, short `mark`
- `backCover` — headline, blurb paragraphs, quote, imprint
- `pages` — all 11 entries (see `references/content-schema.md`)

Keep the 11-page map. The runtime cannot grow a twelfth leaf.

Writing register: warm to the person, harsh to the trap. No shame, no pep, no marketing. Short paragraphs. If a chapter overflows the leaf, shorten it or lower `layout.body.size` — the engine drops overflow, it does not paginate.

### 4. Validate, then compile

```bash
python3 book-asset/scripts/validate_book.py sugar
python3 book-asset/scripts/build_book.py sugar
```

If `caseColor` / `caseLuminance` are null, the build samples them from the cover's 4% border ring and writes them back to `book.json`. That tint is the cloth-less paper case (boards, spine, back).

Outputs:

- `book-asset/products/sugar-reader.html`
- `book-asset/products/sugar-shelf.html`

### 5. QA the products

Open both HTML files in a browser. On the reader:

- Hero, Top, Spine, Edge cameras
- Open / Close
- Turn several pages both ways

Check, by eye:

- Cover art is full-bleed, undistorted, title sitting in the empty upper ground
- Spine ink reads against the sampled case colour
- Back-cover headline and blurb are the new copy, not the template
- Title page, contents, and first chapter are the new writing
- No template voice (`Craft of Attention`, `Mara Ellison`, `North Window`) remains

The shelf product must match the closed reader. It has no page-turn UI on purpose.

## What you must not do

- Do not edit `products/*.html` by hand. Rebuild.
- Do not modify `assets/materials/` or the inlined Three.js/troika engine unless the owner asked for an engine change.
- Do not restart `prompts/BOOK-ASSET-BRIEF.md` (the GLB / Blender pipeline). This HTML runtime replaced it.
- Do not bake titles into the cover image. Type is runtime, so one cover serves every language later.
- Do not crop, tint, re-light, or regenerate an accepted production cover.
- Do not put Belief Changer catalog titles into this runtime by inventing a new cover look. Use the Specimen Series.

## Inputs at a glance

| Want | Edit |
|---|---|
| New front photograph | Cover file + `book.json` `cover`; leave `caseColor` null |
| Title / subtitle / author on the case | `content.json` `frontCover` and `spine` |
| Back blurb | `content.json` `backCover` |
| Interior writing | `content.json` `pages` |
| Imprint mark on the title page | file in `logos/` + `pages[0].logo` |
| Type size on one chapter | that page's `layout.body` |

## Done when

- `validate_book.py <slug>` exits 0
- reader and shelf products exist and were produced by `build_book.py`
- a visual pass confirms new cover, new headlines, new writing
- no template copy remains on a non-template slug
