# The Orbit — Inspection copy

Modified working copy of `site/public/orbit/` (the front-page hero). See
`../FINDINGS.md` for the full change log, measurements, and evidence index.
Nothing here is committed; production still serves `site/public/orbit/`.

## Run (from the repository root)

```bash
python3 -m http.server 8901
```

Open <http://127.0.0.1:8901/Inspection/orbit/index.html>.

Path adapters for repo-root serving (production serves these at the site root):
- fonts: `../../site/public/fonts/…`
- materials: `MAT_BASE = '../../site/public/orbit-materials/'`
- covers: `../../assets/covers/…` (in `_extract/books-meta.json`)

## What changed here (summary)

- Reader title transform + gold-parity y mapping + depth-tested troika text;
  Newsreader 15.5 cqw site-canon cover typography (`vendor/fonts/` has the
  converted TTF troika needs).
- Reading camera bias (open spread always in frame), presented-book pitch,
  portrait "standing at the shelf" camera fit, narrow-aspect inspect framing.
- Browsing caption (title + promise while the ring turns), RTL + dark mode.
- Detail-book ground shadow, rebalanced light rig, cleaned promises.
- Perf: cached-texture dispose guard, reader pre-bind during idle (click→open
  7 ms), page-turn 950 ms, darker/larger page type, aniso 16.
- `_extract/pages.js`: real reader content — site sample prose for sugar and
  scrolling, written method-arc chapters for the other eight.

## Interaction

- **Wheel / ← →** — one book per gesture; bursts coalesce while scrolling.
- **Click a ring book** — shortest path to the front. **Click the front book** —
  pull out; drag to rotate; drag the cover to open; drag pages to turn.
- **Enter** open · **Escape** return · **wheel** zooms in inspect.
- Idle auto-advance every 10 quiet seconds; `prefers-reduced-motion` steps
  discretely with no idle advance. Debug API: `window.__ORBIT`.
