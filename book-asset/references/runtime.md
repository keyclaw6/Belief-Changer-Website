# Runtime notes

Read this only when compiling, debugging a product HTML, or integrating the book into the site. New-book work does not need it.

## Two products, one source

`books/<slug>/` compiles to:

- `products/<slug>-reader.html` — openable hardcover, five deformable leaves, eleven printed pages, page-turn interaction.
- `products/<slug>-shelf.html` — the same closed book with every page-turn system stripped. Use this on a shelf or hero. Visually identical to the reader with its cover closed.

Do not hand-edit product HTML. Rebuild from source.

## What `build_book.py` injects

It copies the gold `00-template` product for that variant, then replaces:

- `BK.book` — slug, variant, cover data-URL, sampled `caseColor` / `caseLuminance`, inlined logos, `builtAt`
- `window.BOOK_CONTENT` — the contents of `content.json`
- `<title>` — `content.meta.title`
- `BK.assetsPerf` on the shelf variant — drops `endpaper_color`, `headband_color`, `page_edge_scan` (the shelf never samples them)

Shared paper, cloth-grain, table, and font payloads stay in the gold HTML. They are identical across titles.

## Cover handling

`BK.book.cover.image` is a data URL of the textless cover. The runtime loads it clamped and fits it like CSS `background-size: cover`. Any aspect ratio works; 2:3 portrait is the series standard.

`caseColor` is the mean of a 4% border ring. The boards, spine, and back are tinted that colour so the case reads as one printed piece. `caseLuminance` picks print ink: dark ink on a light case, light ink on a dark case. Leave both null in `book.json` and the build samples them.

Never re-light, crop, or tint a production cover. If the cover looks wrong in the scene, the light is wrong — not the texture. Production covers live in `../../assets/covers/` and are generated only by `../../image-generation/covers/SKILL.md`.

## Query flags (harness / QA)

Useful on a product file opened locally:

| Flag | Effect |
|---|---|
| `?quality=mobile\|standard\|high` | Tessellation and text atlas scale |
| `?pose=` | Not a built-in; camera presets are the on-page Hero / Top / Spine / Edge buttons |
| `?msdf=0` | Fall back to canvas page printing |
| `?sheets=N` | Page-block sheet count (default 260) |
| `?inkDebug=1` | Draw page ink unlit for deform diagnosis |

## What this is not

The original Phase 2 brief (`../../prompts/BOOK-ASSET-BRIEF.md`) asked for a GLB + `Book.js` ES module. The finished asset superseded that: the book is a self-contained HTML runtime with procedural geometry, not a loaded `book.glb`. Do not restart the Blender pipeline. Do not invent a second Book class. The next shelf agent should iframe or extract from these products, not rebuild the hardcover.

## Integration hint for the shelf / hero

`site/src/components/ShelfStage.tsx` is still a static cover row. When a later agent mounts 3D:

- Use the **shelf** product for closed books in the alcove.
- Promote to the **reader** product only in inspection / reading.
- Keep the static row as the reduced-motion and no-WebGL fallback.
- Consume titles and strings from the site catalogs; do not hardcode English from `content.json`.
- Do not navigate from canvas clicks. Navigation stays in HTML around the canvas.
