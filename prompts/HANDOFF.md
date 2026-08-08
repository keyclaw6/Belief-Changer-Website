# HANDOFF — Belief Changer Website

Hello. You are picking up the design and build of the Belief Changer website, working
directly with the owner (KB). This note is orientation, not a cage: we are in the
design stage, the owner steers, and anything can change when he says it should. Bring
your own taste and judgment; that is why you are here.

## What we are creating

Belief Changer is a free, multilingual library of belief-change books - books that
help people escape traps like smoking, doomscrolling, sugar, porn, overthinking. Free
forever, every language, no signup, no tracking. The full vision, method, and laws
are in `VISION.md`; they are the soul of the project and worth reading first.

The website is where those books meet the world. Its centerpiece is a photorealistic
3D bookshelf (Three.js) where visitors browse real-feeling hardcovers, and around it
a calm, precise, quietly beautiful site: a finder that takes someone from "I can't
stop scrolling" to the right book in seconds, a reading experience with book-quality
typography, audio, a request board where the library grows from what people ask for.

## Where everything lives

One private repo. Clone it with the GITHUB PAT skill (FetchSkillScripts, then
RunWithCredentials):

```
https://github.com/keyclaw6/Belief-Changer-Website.git
```

`AGENTS.md` at the root is the map and the reading order - it points you through the
vision, the current status, the design contract with its rendered references, the
adopted craft skills, the cover-generation system, and the production assets. Follow
it and you will have the whole picture in one sitting. Commit and push your work back
to the repo as you go, so it stays the single source of truth.

Two things deserve special respect once you are oriented: the 10 production cover
images are finished assets, and the cover-generation system that made them
(`image-generation/covers/`) is sacred - future covers reuse its exact process so the
series never drifts.

## Where things stand

Phase 1 is complete: the design language, the cover system, and all 10 covers with
derived spine/back textures and a manifest of exact colors. Right now, a separate
agent is building the 3D book asset itself - a deeply realistic hardcover (Blender
geometry, Three.js page-turning, runtime text baking so titles render in any
language). Its brief is `prompts/BOOK-ASSET-BRIEF.md`; the owner will hand you its
finished package when it lands.

## What comes next (the shape of it, not a script)

- **The bookshelf.** When the book asset arrives, look it over, then write the brief
  for the shelf experience: a Three.js space where the books are shown and browsed,
  built on the book package's API and the covers manifest. The complete-shelf project
  (whose ideas the book pipeline builds on - see `docs/`) is good inspiration for how
  browsing, selecting, and inspecting can feel.
- **The whole site.** Design and brainstorm, with the owner, how the entire page
  should be built: the pages, the flows, how someone in distress reaches the right
  book in under a minute, how it works in a hundred languages, and which images need
  to be generated so every page looks finished and beautiful - the cover-generation
  skill's prompt patterns extend naturally to other photographic assets.
- **Then build it.**

## How the owner likes to work

Decisions get made on rendered evidence: when a visual question is open, build it
for real (HTML with the actual tokens and fonts) and show variants side by side with
a short, honest recommendation. One clear decision at a time. He will tell you
directly what he likes; iterate quickly and lock what he approves into the repo.
The books and the people reading them are what matter - warm to the person, harsh to
the trap, in the site's every word.

Start by cloning and reading, then share how you see the project and what you would
do first.
