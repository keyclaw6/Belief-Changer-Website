# A-R14 image provenance — Track A final plates

## Generation disclosure

"OpenAI documentation states Images 2.5 is available in Codex. The Codex built-in image_gen tool did not expose the internal image-model variant for these calls, so the work uses the current Codex Images 2.5 path without independently verifiable Flare/Sunburst attribution."

## Selection

A visual review selected **a-r14-candidate-1** over **desktop-01** / **desktop-02**
as the desktop master. The candidates are preserved in
`docs/experiments/2026-09-15-three-track/a-r14-image-candidates/` (desktop-01.png,
desktop-02.png) and `.r14-work/` (prompts). Candidate-1 won for restraint: the
calmest plaster copy field, the most legible shallow nosing crown, no sunny
yellow cast, no spotlight dapple on the seat.

## Masters (immutable input — never modified, only read)

| File | SHA-256 | Dimensions | Bytes |
|---|---|---|---|
| `site/public/site/a-r14-master-desktop.png` | `5c80707ae00a751a232d4d45dfa47019cead69f8e289678910b0ffd99c389912` | 1536 x 1024 (3:2) | 2,298,234 |
| `site/public/site/a-r14-master-mobile.png` | `dbf0ec53ffa367d8d445d02abd20b50af50a3933b653c721de6d5ce2e0113dc1` | 941 x 1672 (9:16) | 2,158,964 |
| `site/public/site/a-r14-candidate-1.png` | (same bytes as desktop master) | 1536 x 1024 | 2,298,234 |

The mobile master is a separately composed portrait photograph in the same
design language (own camera, own framing), not a crop of the desktop master.

## Responsive derivatives (generated, reproducible)

Generator: `site/scripts/generate-r14-assets.py` (Pillow: WebP quality 86,
AVIF quality 50; bands WebP quality 95). All plate renditions are straight
Lanczos width resizes of the masters — no crop, tint, relight, or repaint.

| Derivative | Source | Size (bytes) |
|---|---|---|
| `responsive/site/a-r14-plate-768.webp` / `.avif` | desktop master | 32,790 / 12,474 |
| `responsive/site/a-r14-plate-1280.webp` / `.avif` | desktop master | 80,142 / 31,513 |
| `responsive/site/a-r14-plate-1536.webp` / `.avif` | desktop master | 113,690 / 43,992 |
| `responsive/site/a-r14-platem-480.webp` / `.avif` | mobile master | 32,486 / 12,344 |
| `responsive/site/a-r14-platem-768.webp` / `.avif` | mobile master | 79,278 / 29,716 |
| `responsive/site/a-r14-platem-941.webp` / `.avif` | mobile master | 114,538 / 45,783 |
| `responsive/site/a-r14-fore.webp` (380x80 band) | desktop master crop (380,720,760,800) | 4,364 |
| `responsive/site/a-r14-forem.webp` (550x70 band) | mobile master crop (45,1210,595,1280) | 9,664 |

Nosing bands: verbatim plate RGB (q95; mean abs diff ~7-10 inside the
stone-texture band, perceptually invisible) with alpha cut along the traced
crown contour (desktop `y = 0.032x + 743`, mobile `y = 0.031x + 1227`,
5px feather). Band edges are invisible because band RGB continues the plate
scene; registration is proven by rest-diff measurement (R14-RESULT.md), not
by bit-equality.

## Sacred boundaries kept

- Production covers untouched: the Sugar Trap face renders exact cover pixels
  via `BookCover` (no filter, tint, relight, crop, or transform — asserted in
  `site/tests/cinematic-window-r14.test.mjs`).
- No text baked into any image: all copy is live DOM.
- No people, no props, no signage in either plate.
