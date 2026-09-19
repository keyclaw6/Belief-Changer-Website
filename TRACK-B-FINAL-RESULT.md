# Track B Final Result — bank R13 after the R14 visual KILL

Branch: `experiment/living-editorial-atlas` · Work dir: `/tmp/bc-site-track-b` · Date: 2026-09-19
**Verdict: PASS** — the completed Track B branch banks R13 as the visible homepage
reading-room experience. The final experiment branch is intended to be committed and pushed for review; it is not merged or deployed.

## Decision in one paragraph

The R14 Images 2.5 experiment produced `b-r14-candidate-1.png` and
`b-r14-master-desktop.png` (plus `b-r14-mobile.png`); an independent visual gate
KILLED both — furniture/showroom read, disconnected table/shelf, centered staged
chair, worse book hierarchy. Nothing was generated again and no R14 plate ships in
the visible site. The final visible version intentionally banks the strongest proven
direction: the R11 shelf-to-desk transfer machine plus the R13 material-continuity
layer, now mounted as this branch's actual homepage reading-room experience
(immediately after the trust strip), replacing the earlier generic R9 insertion
rather than duplicating it. Provenance:
`docs/experiments/2026-09-15-three-track/B-R14-IMAGE-PROVENANCE.md`.

## What changed (final diff scope)

| File | Change |
| ---- | ------ |
| `site/src/routes/$locale/index.tsx` | Homepage mounts `<ReadingRoomR13>` after `<TrustStrip>`; generic `<ReadingRoom>` (R9) insertion removed, not duplicated. Hero/Orbit and all downstream sections preserved. |
| `site/src/components/home/ReadingRoomR11.tsx` | Header comment corrected to the honest identity scope (below); R11-route paragraph updated (machine now also serves the homepage via R13). No behavioral change. |
| `site/src/components/home/ReadingRoomR13.tsx` | Header documents final homepage role + honest identity scope. No behavioral change. |
| `site/src/components/home/reading-room-r11.css` | **The one implementation fix:** Arabic eyebrow/title glyph collision — `[dir="rtl"]` title `margin-top` 10px → 18px desktop, added 14px in the ≤640px block. Nothing else touched. |
| `site/src/components/home/reading-room-r13.css` | Header updated (R13 applies on homepage + lab route; R9/R10/R11 preserved as files). No rule change. |
| `site/src/routes/$locale/reading-room-r13.tsx` | Route comment updated (same component as homepage). No behavioral change. |
| `site/tests/reading-room.test.mjs` | Homepage test now asserts R13-after-trust-strip order and no R9/R10/R11 duplication. |
| `site/tests/reading-room-r11.test.mjs` | Slice-preservation test updated for final wiring; transfer test renamed/commented to the honest identity scope. No assertion weakened. |
| `site/tests/reading-room-r13.test.mjs` | Isolation test now asserts lab-route purity AND homepage mounting; machine-reuse test renamed off "same-node". No assertion weakened. |
| `docs/experiments/2026-09-15-three-track/B-R14-IMAGE-PROVENANCE.md` | New: hashes/dimensions, rejection fact, Images 2.5 attribution disclosure. |
| `docs/experiments/2026-09-15-three-track/rejected-r14-plates/` | Quarantine location for the three killed PNGs, byte-identical (hashes verified before/after move). Zero `b-r14*` files remain under `site/public/site/`. |
| `r13-captures/` | Refreshed against the final build (isolated route). |
| `final-home/` | New: full homepage capture matrix + scrolled room shots (evidence, untracked). |

No new interface chrome, no new animation system, no new runtime dependency, no
cover/plate asset touched, no site copy changed (one CSS margin value excepted).

## Identity — the honest guarantee and what proves it

Prior wording ("SAME-DOM-NODE shelf→desk transfer") overstated the mechanism and
has been corrected in code comments, tests, and here. The true guarantee is
**per-title single-mount continuity with a single-cut handoff**: the incoming shelf
`<button>` FLIPs to desk geometry, then unmounts at commit while the desk node
(`key={selected.slug}`) mounts the same title. React DOM-node identity is NOT
preserved across the cut; title identity is. Proven, not claimed:

- Mid-transfer probe (homepage AND isolated route): 4 titles mounted, each count
  exactly 1 (`distinct=4, total=4`), `flying=1`, desk swaps to the clicked title,
  0 console/page errors.
- Rapid-selection drain: settles on the last target, `noDup=true`, `flying=0`.
- Rested states: shelf holds the 3 non-selected titles, desk holds the selected
  one — every capture inspected by eye, no duplicate selected cover anywhere.

## Measured evidence (prod bridge, real bundle, 2026-09-19)

Unit tests: **73/73 pass** · Typecheck: clean · Production build: clean.

Isolated `en/reading-room-r13` route (refreshed `r13-captures/`):

| Shot | LCP | Notes |
| ---- | --- | ----- |
| desktop 1440 light | 180 ms | headlineInside=1, readInside=1, overflow=0, deskRatio=1.65 |
| desktop 1024 | 60 ms | deskRatio=1.59, shelfMin=90px |
| desktop dark | 64 ms | identical plate/staging, chrome-only dark |
| mobile 390 / 360 | 72 / 68 ms | deskRatio 1.98/1.96, portrait crop, no cards |
| Arabic RTL | 100 ms | room unmirrored, read → `/ar/books/…` |
| reduced motion | 56 ms | static rest state |
| transfer | 645 ms (≤700) | swapped, singleNode, **CLS=0**, 0 errors |
| keyboard | — | focus ring 3px solid, swapped, focusKept=BUTTON |
| rapid | — | settledOnLast, noDup, 0 errors |

Homepage `en/` (`final-home/`, same machine, room at stage-top 1901/1680/1794px —
immediately after the trust strip, fullpage shot confirms Hero → beats →
TrustStrip → Room order):

- Geometry identical to the isolated route in every context (deskRatio 1.65
  desktop, 1.96–1.98 mobile, shelf 122px, desk 201px, overflow=0, 0 errors).
- Warmed transfer click→settled: **631 ms** homepage / 648 ms isolated (both ≤700;
  one cold-load matrix sample read 2262 ms under swiftshader contention — machine
  timers are fixed 120+320+160 ms, confirmed artifact, not implementation).
- CLS=0, LCP 76–160 ms across homepage contexts, single Read action
  (`/en/books/<slug>/read/1`, exactly one `/read/1` link in the slice),
  focus rescue verified, rapid drain verified.
- Dark: plate and covers byte-identical presentation; copy stays dark-on-plaster
  by design. RTL: camera-fixed, arrow flips via `dir-flip`, read retargets to
  `/ar/`. Reduced motion: instant honest rest endpoint on both surfaces.
- Mobile 390 room: same world portrait crop, physical shelf + desk, no card stack.

## The one bug found and fixed

Arabic eyebrow/title glyph collision in the room copy (eyebrow glyphs touched the
title's first line; English clean). Fix: RTL title `margin-top` 18px desktop /
14px mobile in `reading-room-r11.css`. Verified: box gap 18px desktop / 14px
mobile, crop-zoomed captures show clean separation, tests/build still green.
No re-authoring of the room.

## Kill-gate scoreboard (final)

Selected-cover duplication PASS · continuity PASS (honest scope above) ·
uneven shelf PASS (eyeballed AFTER) · desk reads as physical object PASS
(perspective seat, fore-edge block, spine shade, contact shadow) · contact
shadows grounded PASS · focus kept PASS · reduced-motion static PASS · RTL
unmirrored PASS (plus the one collision fixed) · dark correct PASS · mobile
physical PASS · one primary read action PASS · no fake testimonials/metrics
PASS (room copy carries none) · JS budget PASS (R13 layer still 1335 B gzip
over R11; no new deps) · CLS=0 PASS · LCP ≤180 ms PASS · console errors 0 PASS.

## Environment notes (for reproducibility, not part of the diff)

- `/tmp` user quota was exhausted on arrival (npm extractions wrote ~14k empty
  files). Moved my own 13 GB stale `opencode.db.pre-reasoning-recovery-*` backup
  to `/home/kab/.cache/`, then installed through a git-ignored
  `site/node_modules` symlink → `/home/kab/.cache/bc-track-b-nm` (removed after
  verification; repo arrived with no `node_modules` and leaves with none).
- `three@0.180.0` initially extracted empty (quota fallout); repaired via
  selective registry-tarball extraction (package.json/build/src). Six upstream
  stub files remain 0 bytes by design (e.g. `Three.Legacy.js`); suite proves
  them harmless. No source file was stubbed or vendored by hand.
- Prod bridge served on :3120; captures via Playwright + swiftshader.

## PASS/KILL verdict for the completed Track B branch: PASS

Bank R13 on the homepage. R14 stays dead and quarantined. One honest bug fixed,
nothing re-authored, gates green, evidence on disk.
