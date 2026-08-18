# Build prompt — The Orbit

Use this prompt with Codex, Cursor, Claude Code, or another coding agent, working inside
this repository. It is intentionally implementation-aware but leaves room for craft.

```text
Create an original, premium Three.js experience called "The Orbit" — the hero for the
Belief Changer library, a free collection of books that help people escape traps like
smoking, sugar, and doomscrolling. It must feel like a calm, real library of beautiful
hardcovers floating in space: trustworthy, quiet, never a tech demo.

GOAL
A great ring of photoreal hardcover books levitates in a pure white void. The books
stand like dominoes arranged in a circle: every book edge-on, its spine pointing at the
ring's center. Only the selected book at the front turns 90 degrees to present its
front cover to the visitor. Scrolling turns the ring; as the next book arrives at the
front it turns to present itself while the departing book turns back into the ring.
That presentation turn is the signature moment — make it feel wonderful.

THE BOOKS (use what exists — do not rebuild)
This repo already contains the finished photoreal hardcover as a compiled Three.js HTML
runtime: book-asset/products/00-template-reader.html (openable, page turns) and
00-template-shelf.html (closed). Read book-asset/SKILL.md and
book-asset/references/runtime.md first. Extract the book engine from these products —
geometry, materials, renderer/color/lighting configuration, cover mapping, case
tinting, text — and lift the craft configuration verbatim; if your extracted book looks
cheaper than the gold product side by side, stop and fix that before anything else.
The ten production covers live in assets/covers/ (textless by design, titles render at
runtime) with exact ground colors in covers-manifest.json. Never crop, tint, or
regenerate a cover. Populate the ring with these ten books repeated, shuffled so the
same cover never sits twice in view. All books identical proportions.

THE RING
- Books keep their true cover art and case colors at every position and every
  distance. Nothing is ever white, faded, or ghosted — depth comes from distance and
  perspective, not bleaching.
- The ring is large, gently tilted back, front book nearest the camera; the far side
  is small in the distance and still real.
- The white void is absolute: no floor, no shadows catching a surface, no horizon.
- Reference image (mood and composition, not geometry): design/orbit-reference.jpg,
  with the orientation change described above.

BROWSING
- One wheel notch or arrow key advances exactly one book, with a damped, settling
  motion. Trackpad momentum must not skip books.
- Click any visible book to bring it to the front (shortest path around the ring).
- The front book presents its cover; hovering it lifts/cracks it slightly so the
  visitor can feel it is interactive.
- A quiet arrow at the bottom center points down: the page continues below the hero.
  Hovering it releases the wheel to normal page scrolling; clicking it scrolls down.
  Put real placeholder content below the stage so this works from day one.
- Touch: horizontal swipes browse, vertical swipes always scroll the page. Keyboard:
  arrows browse, Enter opens the front book, Escape returns. Respect
  prefers-reduced-motion with a composed still and discrete stepping.

DETAIL VIEW
- Clicking the presented front book pulls it out of the ring: it travels toward the
  visitor and hangs alone in front of them, large and sharp. The ring stays visible
  in the distance behind it, unchanged and in full color.
- Dragging rotates the BOOK itself — the camera and the world stay still. The ring in
  the background must not move while the book turns in the visitor's hands.
- Dragging the front cover opens the book progressively; dragging pages turns them
  both directions with the extracted page-turn system; dragging the cover closes it.
  Committed pages never spring back. Closing the cover settles any turned pages.
- Test every one of these with real pointer and wheel events in a real browser — not
  by calling internal functions. If a drag does not work with a real mouse, it does
  not work.
- A quiet editorial panel of real HTML appears beside the detail book: title, one
  warm line about the book, a small metadata line, a primary button to the book's
  page, and a "Back to the orbit" affordance. The panel is the only thing that ever
  navigates. Style it from DESIGN.md (DM Sans, sentence case, ink buttons, hairlines,
  no pills, no gradients).

ENGINEERING
- Deliver one self-contained index.html (inline CSS/JS) in hero-orbit/, served from a
  local HTTP server, plus a short README.
- Pinned Three.js ES modules via import map — the same version the book asset pins.
  No framework, no bundler, no backend, no analytics.
- A clear deterministic state machine: ring, presenting, pulling out, inspecting,
  reading, returning. Time-based easing with exact endpoints; the first and final
  pose of every transition must match resting geometry exactly.
- Only the inspected book carries the page-turn machinery; build it once, lazily,
  and rebind it per book. Ring books stay light. 60fps on a mid-range laptop.
- Zero console errors or warnings.

VERIFICATION (in a real browser, with your own eyes)
- Look at the ring: do you see spines and page edges on every book except the
  presented one? If you see a wall of covers, the orientation is wrong.
- Scroll five notches: the ring advanced exactly five books, each presentation turn
  clean, no book ever white or faded.
- Click a side book: it comes to the front. Click the presented book: it pulls out
  of the ring, ring still visible behind.
- Drag the detail book: the book rotates, the background does not move.
- Drag the cover open, turn several pages both ways, drag it closed. All with a real
  mouse.
- Check the hover lift, the down arrow release-and-scroll, touch semantics, reduced
  motion, and a narrow viewport.
```

## Notes

- The gold products in `book-asset/products/` are the craft authority. When in doubt,
  put your extracted book beside the gold reader at the same pose and compare.
- The visual reference `design/orbit-reference.jpg` shows the ring's mood and scale —
  its book orientation is outdated; the text above wins.
- Iterate the way complete-shelf recommends: one focused change, run the page, verify
  the real interaction, inspect the console, keep only what improves it.
