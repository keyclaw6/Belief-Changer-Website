# Global — navigation, footer, the cord, motion, images

## Navigation (every page)

Left: the wordmark **Belief Changer** (DM Sans 600).
Center-right, in order: **Books · How it works · Experiences · Notes · About**.
Far right: the language switcher (native names) and the pull-cord.
Hairline bottom border, 68px, calm. On mobile: wordmark + menu.

*Contribute and Privacy live in the footer (Contribute also gets a quiet line on
About and a card at the foot of the blog). Requests is reached from the Books
page, the homepage vote strip, and the footer, it is a destination for the
committed, not a nav tab.*

## The pull-cord (theme switch)

The light switch is a real, physics-simulated ceiling cord (FeralUI PullCord,
`npm install pullcord`) hanging from the top of the viewport near the right edge,
in front of the nav. Pull it: the lights go off (dark). Pull again: morning
(light). It swings and settles like a real cord because it is simulated like one.

- Rope ink: hairline gray in light, bone in dark (CSS variables provided by the
  package: `--pullcord-ink`, `--pullcord-right`, etc.).
- `onPull` toggles the theme; `pulled` mirrors the state; `ariaLabel`
  "Turn the lights on/off" localized. Keyboard: focus + Enter works (built in).
- Reduced motion: the cord renders at rest (`noEntrance`) and acts as a plain
  toggle.
- The old toggle button disappears. The cord IS the toggle, and the first thing
  a visitor plays with. It sets the whole tone: physical, warm, a room not an app.
- *Note for the fix: the current theme bug (React owns `<html data-theme>` while
  the toggle mutates it) gets solved properly in the rebuild: theme state lives in
  React context, attribute rendered by React, init script + suppressHydrationWarning.*

## The hologram hover (covers in lists)

Wherever covers stand in a browsable list (library grid, homepage library row,
related books), hovering lifts the book slightly toward you with a gentle
pointer-tracked tilt and a soft light sweep across the cover, the FeralUI
Hologram effect (per its docs at feralui.dev/hologram; if the package cannot be
reached, implement the equivalent: 3D tilt toward cursor, 4-6px lift, one soft
specular sweep, 150ms in, 250ms out).

- The effect is transient interaction light, not a re-lighting of the artwork;
  the cover file itself is never modified.
- Touch: a subtle lift on press. Reduced motion: plain 2px lift, no tilt.

## Covers become books (site-wide rule)

Every cover shown anywhere carries its **title in live text over the artwork**,
set in the upper negative space (the artwork was composed for exactly this), in
the manifest's per-book ink (charcoal or bone), with the small letterspaced
series mark **BELIEF CHANGER** at the foot. Any language, since it is live text.
The with-text proofs in `assets/covers/proofs/` are the target look. A book on
this site is never an unlabeled rectangle again.

## The voice (governs every word on every page)

Scandinavian: subtle, direct, unhyped. We are not marketing; we are describing
how beliefs and behavior actually work, to smart people who simply were never
shown. Concretely:

- **Educate, never persuade.** State how it works; let it land. No superlatives,
  no urgency, no promises about us ("we will never shame you" is out;
  "shaming never helps" is in: a fact, not a pledge).
- **The framing is behavior and reasons, not "the trap".** People keep trying to
  fix the behavior instead of understanding the reasons for it; the reasons live
  in beliefs; correct the belief and the behavior follows. The word "trap" stays
  in book titles (the series is named that) and may appear where precise, but
  it is not the site's vocabulary.
- Plain sentences. Say it once. Cut anything that sounds like a landing page.
- Warm through respect, not through warmth-words. The reader is intelligent.

## Motion language (Scandinavian: almost still)

- **No side entries, no zigzag.** Images and text appear with at most a gentle
  fade and a few pixels of rise (~400ms, once). Mostly, things are simply there.
- **Scale carries the feeling**: story images are big (55-75vw, breakout moments
  where called out) with generous whitespace. Stillness + scale = the premium.
- **One exception, sanctioned by the owner: the experience marquee.** A single
  horizontal band that drifts slowly and lazily (60s+ per loop, pausable on
  hover, static under reduced motion). Max one per page, home only for now.
- **Reduced motion**: everything renders in place, fully visible.
- Interactions stay 150-250ms, transform/opacity only. No parallax, no scroll
  hijacking anywhere (the 3D shelf hero, later, is the one sanctioned exception
  with its own approved rules).

## Footer (every page)

Four quiet columns over a hairline: **Belief Changer** (wordmark + one line:
"Free books that change the belief behind the behavior."), **Library** (Books ·
Request a book), **Community** (Experiences · Notes · Contribute), **The small
print** (About · Privacy · Open source). Below, the mono line:

> Free forever · no accounts, no tracking

## Type, color, tokens

Unchanged law: DM Sans everywhere, DM Mono for machine facts, Newsreader only
inside the reader. The site's colors are the tokens; the books and the paintings
carry all the color. Both themes on every page, the covers and paintings
identical in both.
