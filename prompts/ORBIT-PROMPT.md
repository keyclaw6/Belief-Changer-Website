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
stand like dominoes arranged in a circle: every book edge-on, its spine pointing at
the ring's center. Only the book at the front turns to present its cover to the
visitor. Browsing turns the ring, and each arriving book presents itself while the
departing one folds back in. Clicking the presented book pulls it out of the ring to
be held, turned, opened, and read.

THE BOOKS
Use what exists in this repo — do not rebuild the hardcover. The finished photoreal
book is a compiled Three.js HTML runtime: book-asset/products/00-template-reader.html
(openable, page turns) and 00-template-shelf.html (closed). Read book-asset/SKILL.md
and book-asset/references/runtime.md first. Extract the book engine from these
products — geometry, materials, cover mapping, case tinting, text — and lift the
renderer configuration verbatim: tone mapping, exposure, color space, lighting. A
book in your scene at the gold reader's pose must render pixel-comparable to the
gold reader; nothing ever washes to white on a real GPU. The ten production covers
live in assets/covers/ (textless by design, titles render at runtime) with exact
ground colors in covers-manifest.json. Never crop, tint, or regenerate a cover.
Populate the ring with these ten books repeated, shuffled so the same cover never
sits twice in view. All books identical proportions. Ring books share geometry and
material instances, differing only by cover texture and case tint — never clone the
full book engine per instance.

THE RING
- Books keep their true cover art and case colors at every position and every
  distance. Depth comes from distance and perspective, not fading or bleaching.
- The ring is large, gently tilted back, front book nearest the camera; the far
  side is small in the distance and still real, and never reads through or over
  the presented book.
- The white void is absolute: no floor, no walls, no horizon line, no visible
  boundary at any camera pose the experience can reach.
- Hide any visible wraparound jump when the ring loops.
- On first load the ring may compose itself with a brief, calm settling — never a
  spinner.
- Reference image for mood and scale: design/orbit-reference.jpg. Its book
  orientation is outdated; this text wins.

THE PRESENTATION TURN
This is the moment the experience is built around; spend real craft here. As a book
reaches the front it pivots from edge-on to face the visitor — a single confident
quarter-turn, like a curator lifting a volume from the shelf and turning it to show
you the cover. It leads slightly, then settles without a bounce; the cover catches
the studio light as it comes square to camera, so the turn reveals the art rather
than merely rotating it. The departing book folds back into the ring in the same
breath, so the two motions read as one exchange. It should be watchable on a loop
and never feel mechanical. If it looks like a rotating billboard, it is wrong. The
presented book's front cover faces the camera — verify by reading its title: if the
title is mirrored or missing, the book is flipped 180 degrees.

BROWSING
- One wheel notch, one arrow key, or one flick advances exactly one book, with a
  damped, settling motion. Debounce wheel input — accumulate delta and lock out
  further advances until the current settle completes — so one physical notch or
  flick equals one book no matter how many events the browser fires.
- Use true single-click hit targets on the books. Clicking any visible book carries
  it to the front by the shortest path. Browsing never depends on drag gestures.
- Hovering the presented book lifts it slightly toward the visitor, so it feels
  touchable.
- If the visitor does not interact, the orbit browses itself: every 10 seconds it
  advances one book with the same presentation turn, a slow, patient museum
  carousel. Any interaction pauses it; it resumes after 10 quiet seconds. Only
  auto-advance while the stage is fully in view, never while a book is out, and
  pause both the idle advance and the render loop when the tab is hidden.
- A quiet arrow at the bottom center points down: the page continues below the
  hero. Hovering it releases the wheel to normal page scrolling; clicking it
  scrolls down. Capture the wheel for browsing only while the stage fills the
  viewport. Put real placeholder content below the stage so this works from day
  one.
- Touch: horizontal swipes browse, vertical swipes always scroll the page.
  Keyboard: arrows browse, Enter opens the front book, Escape returns.
- Respect prefers-reduced-motion: a composed still, discrete stepping, no idle
  advance, no wheel capture.

DETAIL VIEW
- Clicking the presented book pulls it out of the ring: it leaves the formation and
  travels toward the visitor to hang alone in front of them, large and sharp. Its
  slot in the ring stays visibly empty while it is away — neighbors do not shift to
  fill it; the gap reads as a book that stepped out, not a hole. The ring stays
  visible in the distance behind, unchanged and in full color.
- While a book is out, the ring does not browse — wheel, arrows, and background
  clicks are inert until it is home, so the empty slot stays exactly where the
  book must return.
- Dragging rotates the book itself, weighty and damped, like turning a volume in
  your hands — the camera and the world stay still. The ring behind must not move.
- Dragging the front cover opens it progressively; pages drag-turn in both
  directions with the extracted page-turn system and settle with the gold reader's
  curve; dragging the cover closes it. Committed pages never spring back, and
  closing settles any turned pages first.
- Returning (Escape or the panel's back link) reverses the journey: the book flies
  home to its empty slot and folds back into the ring, no last-frame jump.
- A quiet editorial panel of real HTML appears beside the book once it settles:
  title, one warm line about the book, a small metadata line, a primary button to
  the book's page, and a "Back to the orbit" affordance. The panel is the only
  thing that ever navigates. Style it from DESIGN.md: DM Sans, sentence case, ink
  buttons, hairline borders, no pills, no gradients.

ART DIRECTION
- Museum-grade editorial minimalism — the hush of a Phaidon monograph shot on a
  white cyclorama. The covers are the only color in the world; let them carry it.
- Soft studio light that flatters paper and board without theatrical shadows.
- The only legible title is the presented book's; the rest of the ring stays quiet.
- Motion is calm and certain — nothing bounces, nothing overshoots more than a
  breath, nothing moves without a reason.
- The visitor should feel: these books are real, this library is cared for, and it
  is here for me.

ENGINEERING
- Deliver one self-contained index.html (inline CSS/JS) in hero-orbit/, plus a
  short README. Run it from a local HTTP server.
- Pinned Three.js ES modules via import map — the same version the book asset
  pins. No framework, no bundler, no backend, no analytics.
- Use a clear interaction state machine: orbit, presenting, pulling out,
  inspecting, reading, returning.
- Prefer time-based deterministic interpolation over frame-dependent lerp cutoffs.
  The first and final pose of every transition must match resting geometry exactly,
  including the pull-out and the return to the empty slot.
- Only the inspected book carries the page-turn machinery; build it once, lazily,
  and rebind it per book. Ring books stay light. Hold 60fps on a mid-range laptop.
- Make all interaction controls accessible by name and provide live status updates
  (which book is front, when inspection opens and closes).
- Zero console errors or warnings.

VERIFICATION (in a real browser, with real input, with your own eyes)
- Look at the ring: spines and page edges on every book except the presented one.
  A wall of covers means the orientation is wrong; a mirrored or missing title on
  the presented book means it is flipped.
- Scroll five notches: exactly five books advanced, each presentation turn clean,
  no book ever white or faded, wraparound invisible.
- Leave the page untouched for 30 seconds: the orbit advanced itself three times;
  move the mouse over it and confirm it yields immediately.
- Click a side book: it comes to the front. Click the presented book: it pulls
  out, its slot visibly empty behind it, and the ring refuses to browse until it
  returns.
- Drag the detail book: the book rotates, the background does not move.
- Drag the cover open, turn several pages both ways, drag it closed — all with a
  real mouse. If a drag does not work with a real mouse, it does not work.
- Return from both a closed and an open book; sample the first, middle,
  penultimate, and final frames of the pull-out and return to rule out jumps.
- Check the hover lift, the down arrow release-and-scroll, touch semantics,
  reduced motion, a narrow viewport, and finish with zero console errors.
```

## Notes

- The gold products in `book-asset/products/` are the craft authority. When in doubt,
  put your extracted book beside the gold reader at the same pose and compare.
- Iterate the way complete-shelf recommends: one focused change, run the page, verify
  the real interaction, inspect the console, keep only what improves it.
- The ring, the turn, and the void are yours to make beautiful — the books are
  already beautiful; build them a place that deserves them.
