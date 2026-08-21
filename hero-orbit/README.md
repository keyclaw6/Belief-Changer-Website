# The Orbit

Hero experience for Belief Changer: a calm ring of photoreal hardcovers in a
pure white void. Browse with the wheel, arrows, or a click; open the front book
to hold, turn, and read.

## Run

From the repository root (ES modules and cover textures need HTTP):

```bash
python3 -m http.server 8765
```

Open [http://127.0.0.1:8765/hero-orbit/](http://127.0.0.1:8765/hero-orbit/).

## Interaction

- **Wheel / ← →** — advance exactly one book (locked until the presentation settle finishes)
- **Click a ring book** — shortest path to the front
- **Click the presented book** — pull out; drag to rotate; drag the cover/pages to open and turn
- **Enter** — open the front book · **Escape** — return to the orbit
- **Down chevron** — hover releases the wheel to page scroll; click scrolls to content below
- Idle auto-advance every 10 quiet seconds (paused off-screen, while a book is out, or when the tab is hidden)
- `prefers-reduced-motion` — discrete steps, no idle advance, no wheel capture

## Architecture

| File | Role |
|------|------|
| `index.html` | Scene, ring choreography, input, editorial panel |
| `book-engine.js` | Closed shelf books + openable reader (shared materials/geometry) |
| `_extract/01-noise.js` … `03-pageturn.js` | Gold runtime extracts (load before the module) |
| `_extract/books-meta.json` | Ten production titles; covers under `../assets/covers/` |

Three.js **r180** via import map (same revision as `book-asset/products/`). Renderer
tone mapping, exposure, and studio lights match the gold reader. Debug API:
`window.__ORBIT`.

## QA harness

Optional single-book check: `_test-book.html` (closed shelf + openable reader side by side).
