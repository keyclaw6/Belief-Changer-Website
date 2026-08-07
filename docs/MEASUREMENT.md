# MEASUREMENT.md - Belief Changer measurement contract

Authority for how the Belief Changer site measures itself. Generated from the
`docs/SITE-PLAN.md` "Measurement contract" section and the front-end
implementation in `site/src/lib/measure.ts`. This document is the specification
the future backend implements: if the collector ever ships, it must satisfy
everything below and nothing more.

Status: the front end fires these events through `track()`, which logs to the
console in development and is a **no-op in the production build**. There is no
network call, no collector, and no stored analytics in v1. This file describes
the contract that a v2 collector would have to honor.

---

## 1. Philosophy (non-negotiable)

The site serves people who often arrive in distress, sometimes at 2am, sometimes
about subjects they would never say out loud. Measurement here answers exactly
one question, "which traps do people need books for," and it answers it without
ever costing the reader their dignity or privacy.

The rules that follow from that:

- **Count events, not people.** We tally what happens (a page was viewed, a
  search found nothing), never who did it. There is no notion of a "user" in the
  measurement model.
- **No unique-visitor counting.** No device id, no session id, no fingerprint,
  no hashed IP, no "returning vs new." None of these are computed, sent, or
  stored. Two page views from the same person are simply two page views.
- **Nothing is stored on or read from the device for measurement.** The site
  does use a little device storage, but strictly to make the site work for the
  reader (theme, language, reading position, voted flags). None of it is ever
  read back for analytics, and none of it is ever attached to an event. See
  §4.
- **No cookies, no accounts, no consent banner.** Because nothing that requires
  consent is collected, there is nothing to ask permission for. The absence of a
  cookie banner is a feature of the honesty, not an oversight.
- **Free text never leaves the device untouched.** Any human-typed string that
  could reach a measurement payload is sanitized client-side first (§3): capped
  in length, with emails and long digit runs stripped, before it is ever
  considered for sending.
- **Best-effort, never in the way.** `track()` is wrapped so it can never throw
  into a user flow. If measurement fails, the reader never notices.

The closed event vocabulary lives in one place (`EventName` in
`site/src/lib/measure.ts`). Adding an event means adding it there first, so the
analytics surface stays a small, reviewable set. The list below is that set in
full.

---

## 2. The event table

Every event carries only the props listed. No event carries an identifier, a
timestamp beyond a coarse server-side receipt time, a referrer, a user agent, or
any device-derived value. Props are dropped when undefined so payloads stay
clean and comparable.

| Event | Props | Fired where (front end) | When |
|---|---|---|---|
| `page_view` | `routeClass` (string), `locale` (`en` \| `da` \| `ar`) | every route component's mount effect | once per navigation into a route class |
| `read_start` | `slug` (string) | `components/reader/Reader.tsx` | first time a book's reader opens in a session (deduped per book via a ref) |
| `chapter_view` | `slug` (string), `n` (number) | `components/reader/Reader.tsx` | every chapter view, including re-reads |
| `download` | `slug` (string), `format` (`epub`) | `components/book/BookActions.tsx` | reader taps Download EPUB (v1 file is a documented stub) |
| `vote_cast` | `subjectId` (string) | `components/requests/RequestBoard.tsx` | reader adds their voice to a request row (once per row per device) |
| `request_submitted` | none | `components/requests/RequestSubmit.tsx` | reader submits the "ask for a book" form |
| `feedback_submitted` | `slug` (string), `kind` (`with-consent` \| `private`) | `components/book/ImproveForm.tsx` | reader submits the improve-this-book form; `kind` records only whether they consented to publish, never the text |
| `experience_submitted` | `slug` (string) | `components/experiences/ExperienceSubmit.tsx`, and `components/book/ImproveForm.tsx` when the reader consents to publish | reader shares an experience, or opts to publish improve-form feedback as one |
| `finder_no_match` | `queryNormalized` (string, sanitized), `locale` (`en` \| `da` \| `ar`) | `routes/$locale/books/index.tsx` | a real, non-empty library query matches zero books (fired once per distinct normalized query) |

`routeClass` values currently emitted: `home`, `library`, `book`, `requests`,
`experiences`, `blog`, `blog-post`, `how-it-works`, `about`. (The reader emits
`read_start` / `chapter_view` instead of a `page_view`; the 404 emits nothing.)

Notes on specific events:

- **`finder_no_match` is the point of the whole system.** It is the only event
  that carries reader-typed text, and that text is sanitized first (§3). It tells
  the library which books to write next; it is why aggregate search counting
  exists at all.
- **`feedback_submitted.kind` is coarse on purpose.** It distinguishes a private
  note from one the reader agreed to publish, so the pipeline knows what may
  become a public experience. It never encodes the note's content.
- **Form events never carry free text.** `request_submitted` carries nothing;
  `feedback_submitted` and `experience_submitted` carry a slug (and coarse kind),
  never the words the reader wrote. The written content stays in the (future)
  submission pipeline, which is a separate contract from measurement.

---

## 3. Sanitization rules (client-side, before any send)

Applied by `sanitizeQuery()` in `site/src/lib/measure.ts` to any free-text value
that could reach a measurement payload (today: only `finder_no_match`'s query).
The library normalizes the query once and passes the result as
`queryNormalized`.

In order:

1. **Strip emails.** Any `\S+@\S+\.\S+` token is removed.
2. **Strip long digit runs.** Any run of 4 or more consecutive digits is removed
   (phone numbers, card fragments, ids typed into search).
3. **Collapse whitespace** to single spaces and trim.
4. **Cap length at 80 characters.**

A query that sanitizes to an empty string is not sent (the library guards on the
normalized value being non-empty before firing). Sanitization runs on the device
before the value is ever handed to `track()`, so raw free text never crosses the
network even in a future collector.

---

## 4. Functional-storage inventory

The site stores a few values on the device. Every one exists to make the site
work for the reader; **none is measurement, none is an identifier, and none is
ever read back into an event.** All are written defensively (private-mode and
storage-disabled failures are swallowed) and all are readable/clearable by the
reader through normal browser controls.

| Purpose | localStorage key | Value | Written by | Why it exists |
|---|---|---|---|---|
| Theme choice | `bc-theme` | `light` \| `dark` (absent = follow system) | `lib/theme.ts` | remember an explicit light/dark override; a no-flash inline script reads it before first paint |
| Reading comfort | `bc-reader-comfort` | `light` \| `sepia` \| `dark` | `components/reader/Reader.tsx` | remember the reading-surface palette across sessions, independent of the site theme |
| Reading position | `bc-reading:{slug}` | chapter number (string), one key per book | `components/reader/Reader.tsx` | let a later "continue reading" affordance resume a book; one entry per book read |
| Voted flags | `bc-voted` | JSON array of subject ids voted for | `components/requests/RequestBoard.tsx` | stop the UI offering the same one-tap vote twice; the flag is local only and carries no identity |

Locale is **not** stored on the device: it lives in the URL (`/{locale}/...`)
and is chosen through the language switcher, so there is nothing to persist and
nothing to read.

What is deliberately absent: no analytics cookie, no `localStorage`/`sessionStorage`
analytics key, no `IndexedDB`, no device id of any kind, no A/B bucket, no
consent record (because there is nothing to consent to).

---

## 5. The future endpoint (not implemented in v1)

When a collector is introduced, it is a single fire-and-forget POST and nothing
else:

```
POST /api/measure
body: { event: EventName, props: Record<string, string | number>, ts: number }
```

Rules the endpoint must honor, restated so they cannot be lost:

- No cookies set or read. No `Set-Cookie`, no auth, no session.
- No client identifier of any kind is ever attached to the request (no id in the
  body, no id in a header, no fingerprinting, no IP-derived id stored).
- `props` is exactly the sanitized, undefined-stripped object the front end
  built; the endpoint adds only a coarse server-side receipt time (`ts`) and
  stores counts, not rows tied to anyone.
- The send is best-effort (`navigator.sendBeacon` or `fetch` with `keepalive`);
  a failure is silent and never blocks or surfaces to the reader.
- The event set is closed to the vocabulary in §2. New events are added to
  `EventName` first and documented here before they are sent.

Until that exists, `track()` logs in development and no-ops in production. No data
is collected, transmitted, or retained.

---

## 6. The honesty statement (as shown to readers)

The About page states the approach in plain words. This is the promise the
contract above exists to keep; the wording lives in the locale catalogs under
`about.honestyBody` and reads:

> We count page views and searches in aggregate, so we can tell which traps
> people need books for. We never identify you. No cookies, no accounts, no
> tracking. The only things kept on your device are the ones that make the site
> work for you: your theme, your language, where you are in a book, and which
> subjects you have voted for.

If the implementation and this sentence ever disagree, the sentence wins and the
implementation is the bug.
