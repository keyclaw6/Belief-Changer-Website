# Track C R2 — image provenance

Date: 2026-09-19. Worktree: `/tmp/bc-site-track-c` only.

## Inputs (immutable generated input for this pass)

Four environment plates were provided under `site/public/orbit/env/` and are
used **verbatim** — no crop, tint, re-light, or pixel edit of any kind. The
only derived uses are (a) direct `<img src>` display with `object-fit: cover`
positioning and (b) the foreground occlusion leaf, which renders the *same
file* a second time with a CSS `clip-path` bottom-strip crop — no new pixels,
no separate derived file.

| File | Dims | Bytes | SHA-256 |
| --- | --- | --- | --- |
| `c-r2-day-candidate-1.png` (day desktop) | 1536 x 1024 | 2461037 | `d7b2bfe18938040bca88d902c349e61973c56ed26cdeb83d50b59974c4408491` |
| `c-r2-day-mobile.png` (day mobile, portrait) | 941 x 1672 | 2157486 | `c5181fc849f8d6366c35d5e5c042a09b2ee738f204ac67d1e21b8f8716654bca` |
| `c-r2-night-desktop.png` (night desktop) | 1536 x 1024 | 2213935 | `e184c867df61d902f4ab963857fd18f8f40f5e6dc9b46fe40f931f75e61eaa3b` |
| `c-r2-night-mobile.png` (night mobile, portrait) | 941 x 1672 | 1994776 | `b3f115ae6b944790d82df46341ba831df250f828a3ef6ff9c4bfde3d6a4043df` |

Notes:

- The R1 temporary proof plate (`proof-room-day.png`, a verbatim Track A copy)
  was **deleted** in R2; nothing from R1 ships.
- The night-mobile plate arrived during the R2 pass (before finalization), so
  mobile dark uses a genuine authored night plate. No day-for-night fallback
  and no CSS dim of any plate exists anywhere in R2.
- Cover artwork (`assets/covers/`, `site/public/covers/`, responsive imagery)
  is byte-identical: `git diff` shows zero changes there.

## Model disclosure (exact)

"OpenAI documentation states Images 2.5 is available in Codex. The Codex built-in image_gen tool did not expose the internal image-model variant for these calls, so the work uses the current Codex Images 2.5 path without independently verifiable Flare/Sunburst attribution."
