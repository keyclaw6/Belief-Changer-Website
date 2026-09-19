# B-R14 image provenance — Images 2.5 generation attempt (REJECTED)

Date: 2026-09-15 · Track B: Living Reading Room · Branch: `experiment/living-editorial-atlas`

## What was attempted

The R14 experiment tried to re-author the reading room around a credible
reader position (chair/table relationship, book orientation derived from a
seat) using generated room plates. Two desktop plates and one mobile plate
were produced:

- `b-r14-candidate-1.png`
- `b-r14-master-desktop.png`
- `b-r14-mobile.png`

## Verdict: KILLED by the independent visual gate — do not ship

Both desktop plates were rejected, and the mobile plate with them. At a
three-second glance they read as furniture/showroom: a disconnected
table/shelf relationship, a centered staged chair, and worse book hierarchy
than the banked R13 room. The direction was killed, not iterated. No R14
plate is referenced by any route, component, test, or capture script, and no
R14 file remains under `site/public/site/`.

## Preserved bytes (exact, after quarantine move)

The rejected plates are preserved byte-identical for the record under
`rejected-r14-plates/` next to this document. Hashes verified identical
before and after the move:

| File | SHA-256 | Bytes | Dimensions |
| ---- | ------- | ----- | ---------- |
| `rejected-r14-plates/b-r14-candidate-1.png` | `609eeffd56dc88b72ae5cfff4effb85617f948a8eeb53ca146791be33b11b434` | 2275468 | 1536x1024, 8-bit sRGB PNG |
| `rejected-r14-plates/b-r14-master-desktop.png` | `c5f1808b83c4f4692d779981aab3960ef882ad8894e941a097a9f2ba1b83c6ff` | 2622271 | 1536x1024, 8-bit sRGB PNG |
| `rejected-r14-plates/b-r14-mobile.png` | `dbee825d3788f69e3a9670a130f90d075762e023a07b270cfefb6dc9dfd63ecb` | 2067516 | 1122x1402, 8-bit sRGB PNG |

Dimensions via ImageMagick `identify`; hashes via `sha256sum`.

## Model-attribution disclosure

"OpenAI documentation states Images 2.5 is available in Codex. The Codex built-in image_gen tool did not expose the internal image-model variant for these calls, so the work uses the current Codex Images 2.5 path without independently verifiable Flare/Sunburst attribution."

## Consequence

Track B banks R13 (R11 transfer machine + R13 material continuity) as the
visible homepage reading-room experience. See `TRACK-B-FINAL-RESULT.md` at
the repo root. No new image generation was run after the kill.
