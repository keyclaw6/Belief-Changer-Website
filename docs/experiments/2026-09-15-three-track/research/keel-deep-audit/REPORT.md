# KEEL deep-audit — https://motionsites.ai/?prompt=keel (2026-09-15)

Read-only. No repository modified (`git status` clean in `bc-site-grounding` after the pass;
track repos only read). Isolated Playwright Chromium, viewports 1440×900 and 390×844.
Prior pass `favorites-deep-dive/REPORT.md` §A confirmed and extended here; corrections noted.

## 1. What the URL actually opens (EVIDENCE)

- `?prompt=keel` is a **client-side deep link**: the Vite SPA (`/assets/index-B7MD0KTh.js`,
  911 KB) reads the query param (URLSearchParams router in bundle; no literal `keel` string
  in the bundle — card data arrives at runtime) and opens the **Keel detail modal** over the
  prompt-gallery grid. No navigation, no live site, no demo link.
- Modal content (observed, both viewports): video preview left; right panel
  **"Keel / Creative / ♥ 29 likes / Go Unlimited"** (lock icon). Like count is live
  (25 in the prior pass → 29 today).
- **Zero links matching keel/demo/preview/live** anywhere in the DOM. There is no
  corresponding website to inspect — KEEL is a gallery card, not a shipped page.

## 2. Prompt, attribution, source/repo (EVIDENCE — mostly negative results)

| Asked | Found |
|---|---|
| Exact user prompt / `prompt` param content | **Not publicly exposed.** The param value is just the card id `keel`. Card body text is paywalled (see below). No prompt text in DOM, no prompt-shaped strings in the public JS bundle. No probing beyond the page's own requests was attempted. |
| Creator attribution | **None on the card.** The page's own public Supabase queries return nulls: `prompts?select=creator_name,creator_avatar_url&id=eq.keel` → `[{"creator_name":null,"creator_avatar_url":null}]`; `prompts_public?select=creator_id&id=eq.keel` → `[{"creator_id":null}]` (both HTTP 200, re-queried in-page 2026-09-15). KEEL is a staff/anonymous card. |
| Site owner / promoter | **Viktor Oddy (@viktoroddy)**, verified X account, "designing for 15 years". Evidence: footer YouTube link `https://www.youtube.com/@ViktorOddy`; video "How I Build $5,000 3D Animated Websites with AI (Sonnet 5)" (26,791 views, Jul 1 2026, description: "Assets generated using Higgsfield", "Unlimited prompts … http://motionsites.ai"); X post 2026-09-14: "Access this as well as 600+ award-winning website prompts in one click" → motionsites.ai. |
| Linked source/repo | **None.** No GitHub/repo/demo URL in DOM, modal, or page metadata. |
| Price of the prompt | Paywalled: clicking **Go Unlimited** navigates to `https://motionsites.ai/unlimited` ("Go Unlimited — MotionSites"). Free cards show "Copy prompt"; KEEL shows "Unlock prompt". |

## 3. Public explanation of how MotionSites generates cards (EVIDENCE, pipeline-level only)

No KEEL-specific making-of exists in public. What MotionSites publicly says about its own
workflow (all verbatim-paraphrased from its pages):

- Business: "Beautiful Website Prompts for Lovable, Bolt, Cursor, and Claude. … Just copy,
  paste, and launch." Cards are **text prompts + project files** for AI site builders.
- Academy lesson (`/lesson/build-animated-website-with-motionsites`): "Start with a detailed
  MotionSites prompt, generate the site in an AI website builder, and then customize it."
- Custom-prompt service (`/request`): a reference (site, Dribbble, Pinterest, screenshot) is
  translated into "pixel-perfect" prompt + "All project files included — videos, animated
  images, fonts, and assets". Hero $99 / landing $249.
- Asset pipeline: posters served via `images.higgs.ai` (Higgsfield CDN wrapping a CloudFront
  user asset `hf_20260911_083851_…`); creator's video credits "Assets generated using
  Higgsfield" (`https://higgsfield.ai`). So: AI image → AI video/motion → R2-hosted mp4.
- **INFERENCE (labeled):** KEEL's preview is most plausibly an AI-generated landing *concept
  render* (Higgsfield-pipeline still + motion) that a buyer would then have rebuilt as a real
  site by pasting the purchased prompt into a builder. There is no evidence any live KEEL
  site was ever built; treat it as art direction + camera reference, never implementation.

## 4. The KEEL artifact, forensically (EVIDENCE)

Video file (curl `-I` + ffprobe, 2026-09-15):

- `https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/keel-landing.mp4` —
  **4,864,099 bytes, 7.0 s, 1920×1418, H.264 40 fps + AAC**, Last-Modified 2026-09-11.
  Served with `Accept-Ranges: bytes` (206 partial-content in page). Appears **twice** in the
  DOM (grid card + modal). Poster: Higgsfield `images.higgs.ai` WebP.
- Gallery page: **~50 muted autoplay loop `<video>`s, 0 `<canvas>`, 0 iframes** (DOM count).
  The gallery is DOM + video. Console on interaction: 0 errors, 1 warning.
- **CORRECTION to the prior pass:** the 7 s loop is a **montage, not one continuous shot**.
  1-fps frame extraction (`frames/keel-t1.jpg`…`keel-t7.jpg`) shows hard cuts between staged
  tableaus: (a) statue plaza, heroine with orb + light rings; (b) robed crowd looking up;
  (c) youth holding chrome pear (close-up); (d) chrome hands splitting the pear;
  (e) hands with particle dispersion (also the mobile-screenshot moment). Motion *within* a
  tableau is a slow push-in; motion *between* tableaus is a cut.
- The following are **baked video pixels, not DOM**: serif headline "Keel helps you emerge.",
  subline "Not a partner on the clock, a partner in the payout.", pills "START A PARTNERSHIP"
  and "APPLY", micro-labels "ON CALL FOR YOU" / "THE SHARE", footnote paragraph, "SCROLL"
  hint, and the hairline survey grid with crosshair markers. The pills are non-buttons.
- Responsive strategy: pure CSS grid → the modal **stacks** (video over info panel) at
  390×844; grid cards reflow to one column. No separate mobile asset, no canvas fallback
  logic — video simply scales. Verified in `03-mobile-390-modal-stacked.png`.

## 5. Mechanism comparison vs the two R13 prototypes (EVIDENCE-grounded)

Track A R13 (`/tmp/bc-site-track-a`, `R13-RESULT.md` — PASS): photographic still plate +
immutable Sugar Trap cover as bound volume + **one** plate-derived occlusion leaf
(verbatim sill-nosing pixels, 5–19 KiB) + leaf-only drift (±6px X, ±3px Y); plate, book,
and copy pinned; LCP 64 ms; honest-occlusion-or-nothing rule.

Track B R13 (`/tmp/bc-site-track-b`, `R13-RESULT.md` — PASS): room plate IS the layout,
4-book ash shelf + desk, **same-node FLIP** shelf→desk transfer (600 ms deterministic
lift/carry/settle), R13 a CSS-only material pass (lean, fore-edge thickness, leftward
shadows, uneven occupancy); selection has collection consequence.

| Axis | KEEL | Track A R13 | Track B R13 |
|---|---|---|---|
| What moves | Baked push-ins + hard cuts inside a 4.9 MB video | One registered leaf, ≤6/3 px, everything else pinned | The selected book itself (FLIP), room pinned |
| Depth trick | Montage + staged tableaux | One honest plate-derived occlusion (~9 px tuck) | Self-occlusion (fore-edge/spine) + leftward shadows |
| Copy | Baked pixels, incl. fake pills | 100% live DOM, no scrim/card | 100% live DOM, one live Read link |
| Overlay grid | Baked into video | Absent (opportunity — §7) | Absent |
| Interaction/state | None (loop) | Pointer-gated drift w/ static poster contract | Selection consequence + focus/ARIA machine |
| Material honesty | Chrome-everything spectacle | Verbatim plate pixels, disclosed ~55 px fiction | Declared window light, feet-planted geometry |
| Cost | 4,864,099 B autoplay | 19 KiB desktop leaf, LCP 64 ms | +1,335 B gzip JS, LCP +4 ms vs R11 |
| Responsive | Video scales, modal stacks | Re-registered crop + composed still, no drift on touch | Re-registered slots, same physics, no card stack |

Blunt summary: KEEL's "camera" (cuts) is exactly what both R13s forbid, and KEEL's
"UI" (baked pills) is exactly what both R13s re-render as live DOM. What KEEL has and the
R13s lack is all in §6 — and all of it is portable without the video.

## 6. Exact reusable mechanisms (not protected surface design)

1. **Single-material discipline.** KEEL's premium read comes from one coherent reflection
   story (chrome everywhere), not from the chrome itself. BC's equivalent is already law
   ("covers are the only color") — KEEL is confirmatory evidence, adopt nothing visual.
2. **Survey-grid + crosshair overlay as live DOM hairlines.** The grid + tick micro-labels
   are what make the concept read "designed/agency". BC already owns hairlines; adding a
   restrained grid + mono eyebrow row over the Track A plate is ~0 bytes of imagery,
   SSR-safe, theme/RTL-controllable — unlike KEEL's baked pixels.
3. **Slow single-axis push-in as the maximum sanctioned camera move.** Within-tableau KEEL
   motion never exceeds a gentle drift — consistent with BC's ≤4%-drift ceiling. Cite the
   ceiling, not the footage.
4. **Copy zones composed as regions, text rendered live.** KEEL's layout (serif headline
   left, pill below, eyebrow + footnote low-left, APPLY top-right) is a sound zone map;
   every zone must be live text in BC (textless-plate law + i18n/RTL).
5. **Eyebrow micro-labels in mono** ("ON CALL FOR YOU") — directly compatible with DM Mono
   meta style; cheapest premium signal in the whole artifact.
6. **Shallow staged depth rows** (statue rows receding) as a compositional idea for shelf
   choreography — ideas only; any web port is custom shader/R3F work (cf. F7 Skia caveat),
   not drop-in.

## 7. What not to copy

- The 4.9 MB / 7 s autoplay video hero (violates stillness + performance laws; compare
  4,864,099 B vs the R13 leaf's 19 KiB and 64 ms LCP).
- Baked-in headlines, pills, and micro-labels (textless law; fake buttons; untranslatable).
- Montage cuts presented as camera motion (BC allows one continuous drift, never cuts).
- Saturated-blue + chrome triumphalism and its emotional register (BC: relief/lightness,
  bone/ink, "never glamour"; "warm to the person").
- The statues, pear, rings, or any styling (protected surface design of a marketplace
  asset; also wrong feeling for BC).
- The prompt itself: paywalled — do not attempt to extract, guess, or reconstruct it.

## 8. Three concrete lessons for the next prototype

1. **Put the survey grid + eyebrows in live DOM on the Track A still.** KEEL proves the
   grid/micro-label combo carries the "premium agency" read almost alone. Cost on the R13
   baseline: a few hairline divs + DM Mono labels, zero imagery bytes, SSR/RTL/reduced-motion
   safe by construction. Falsifiable check: glance test (grid vs no-grid still) + 0 ms LCP
   regression gate, same harness as R13.
2. **Write the single-tableau rule into the plate QA checklist.** KEEL is disqualified as
   motion reference precisely at its cuts; any future generated plate (video or drift)
   must be one continuous tableau, copy-free, with a what-survived audit per tableau.
   Reuse the Av1d survived/missed ritual from `favorites-deep-dive/REPORT.md` §B1.
3. **Treat KEEL's poster, never its video, as the reference still — and KEEL as the
   negative performance benchmark.** The Higgsfield WebP poster is the actual first paint;
   BC's ceiling stays poster-first with optional ≤4% drift. Any motion proposal must beat
   the R13 numbers (≤19 KiB imagery delta, LCP ≤64 ms +200 ms gate, CLS 0) the way R13
   beat R8 — KEEL (≈4.9 MB) sets the "do not cross" line, not the target.

## 9. Screenshots (in this folder) + public URLs

- `01-desktop-1440-modal-hero.png` — 1440×900, Keel modal, statue-plaza tableau
  ("Keel helps you emerge.", START A PARTNERSHIP pill, survey grid, Keel/29-likes panel).
- `02-desktop-1440-grid-pear-scene.png` — 1440×900, gallery grid moment showing the
  chrome-hands/pear-split tableau ("THE SHARE"); documents the montage structure.
- `03-mobile-390-modal-stacked.png` — 390×844, modal stacked (video over panel),
  particle-dispersion tableau; documents responsive strategy.
- `frames/keel-t1.jpg`…`keel-t7.jpg` — 1-fps extraction of the 7 s loop (scene inventory).
- Full loop reference (prior pass, unmodified):
  `../favorites-deep-dive/keel/keel-landing-full.mp4` (+ start/mid/end frames).
- Public URLs: `https://motionsites.ai/?prompt=keel`,
  `https://motionsites.ai/unlimited`,
  `https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/keel-landing.mp4`,
  `https://motionsites.ai/lesson/build-animated-website-with-motionsites`,
  `https://motionsites.ai/request`,
  `https://www.youtube.com/@ViktorOddy`,
  `https://x.com/viktoroddy/status/2099488750283923775` (owner workflow post, 2026-09-14),
  `https://higgsfield.ai` (pipeline attribution, not KEEL-specific).
