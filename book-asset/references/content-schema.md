# content.json schema

`books/<slug>/content.json` is the only file a new-book agent should rewrite for headlines and writing. The compiled HTML reads it as `window.BOOK_CONTENT`.

The 3D book prints **exactly 11 pages**. That is a runtime constant (five deformable leaves + the page-11 cap). Do not add a twelfth page; cut or combine instead.

## Top level

```json
{
  "meta": { "title": "", "subtitle": "", "author": "", "imprint": "" },
  "frontCover": { "eyebrow": "", "title": "", "subtitle": "", "author": "", "edition": "" },
  "backCover": { "headline": "", "paragraphs": [""], "quote": "", "imprint": "" },
  "spine": { "title": "", "author": "", "mark": "" },
  "pages": [ /* exactly 11 page objects */ ]
}
```

`meta` is the catalog identity. Cover, spine, and title-page strings are **not** derived from it automatically — keep them in sync by hand.

## Cover and spine (runtime type, not baked into the image)

The cover file is always textless. Troika prints these strings at runtime.

| Surface | Fields | Notes |
|---|---|---|
| `frontCover` | `eyebrow`, `title`, `subtitle`, `author`, `edition` | Title wraps in the upper board. Eyebrow is small tracked caps. Author and edition sit at the foot. |
| `spine` | `title`, `author`, `mark` | Title and author are uppercased by the layout. `mark` is a short imprint mark near the tail (e.g. `NWP` or `BC`). |
| `backCover` | `headline`, `paragraphs[]`, `quote`, `imprint` | Headline is the large claim. Paragraphs are the blurb. Quote is set in italics with added quotation marks. |

## Page types (`content.type`)

If `type` is omitted the page is a `chapter`.

### `title`

Centred title page, no folio.

```json
{
  "type": "title",
  "title": "The Sugar Trap",
  "subtitle": "How the craving disguises itself as hunger",
  "author": "Belief Changer",
  "imprint": "Belief Changer",
  "logo": "logo.png"
}
```

`logo` is a filename in `books/<slug>/logos/`. Omit it if the book has no mark.

### `copyright`

Small imprint lines, flush to the foot.

```json
{
  "type": "copyright",
  "lines": [
    "The Sugar Trap",
    "First edition, 2026",
    "Free forever. No signup."
  ]
}
```

`paragraphs` is accepted as an alias for `lines`.

### `toc`

Heading plus one line per `{title, page}` entry. Dotted leaders are on by default.

```json
{
  "type": "toc",
  "title": "Contents",
  "toc": [
    { "title": "The afternoon walk to the kitchen", "page": 5 },
    { "title": "What the sweetness actually buys", "page": 6 }
  ]
}
```

Page numbers are editorial, not computed. Keep them honest against the 11-page map: pages 1–4 are usually front matter, 5–10 body, 11 colophon.

### `section`

Centred divider. No folio.

```json
{
  "type": "section",
  "kicker": "Part One",
  "title": "Orientation",
  "subtitle": "On learning to look before leaping"
}
```

### `chapter` (default)

Kicker, title, rule, flowing paragraphs. This is where the writing lives.

```json
{
  "kicker": "I · ORIENTATION",
  "title": "The First Deliberate Look",
  "paragraphs": [
    "First paragraph.",
    "Second paragraph."
  ]
}
```

Optional per-page type tweak:

```json
"layout": { "body": { "size": 0.018, "lineHeight": 1.45 } }
```

Sizes are fractions of page height. Smaller `size` or tighter `lineHeight` if a paragraph overflows. The runtime will drop overflow rather than paginate it.

### `blank`

Empty sheet. Folio and running head stay off unless forced.

## Folio and running head

Default: on for `chapter`, `copyright`, `toc`. Off for `title`, `section`, `blank`.

Override per page with `"folio": true|false` and `"runHead": true|false`.

## Recommended 11-page map

Copy this shape from `books/00-template/content.json` and rewrite the words:

| Index | Type | Role |
|---|---|---|
| 0 | `title` | Title page |
| 1 | `copyright` | Imprint |
| 2 | `toc` | Contents |
| 3 | `section` | Part divider |
| 4–9 | `chapter` | Six body pages |
| 10 | `section` | Colophon / close |

## Writing register

These books help someone leave a trap. Warm to the person, harsh to the trap. No shame, no pep, no marketing. Short paragraphs. Concrete verbs. First-person subject names when a person is named. See `../../VISION.md` and `../../DESIGN.md`.

Do not leave the template's Craft of Attention prose in a new slug. `validate_book.py` rejects a new book that still uses that title.
