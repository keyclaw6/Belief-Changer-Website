import { useState } from 'react'
import './reading-room-r10.css'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { BookCover } from '~/components/BookCover'
import { assetPath } from '~/lib/deployment'
import { cn } from '~/lib/utils'

/**
 * ReadingRoomR10 (Track B slice R10): the room plate IS the layout.
 *
 * Bounded R10 spike, isolated to the /{locale}/reading-room-r10 route. R9
 * (homepage slice) is untouched. The single goal: remove the cream website
 * band above the room. There is no copy block, no marginalia row, no section
 * padding anywhere outside the plate. The photographic plate
 * (site/public/site/reading-room-r9-*, the approved R9 empty-scene master)
 * is the only stage, and the live DOM copy (eyebrow, headline, short
 * subcopy, the one Read chapter 1 link) sits directly in the quiet chalk
 * plaster negative space on the left of the plate. No baked text, no card,
 * no scrim, no gradient wash, no giant UI vessel.
 *
 * B stays distinct from A: an inward reading room organized around
 * collection (ash shelf), desk (one bound book), and selection consequence
 * (choosing a shelf book swaps the desk book and retargets the Read link).
 *
 * Single physical node rule (from R9, unchanged): the selected title
 * appears exactly ONCE, as the bound book on the desk. The ash shelf shows
 * only the other (up to three) titles. No vacancy placeholder, no dashed
 * recess, no duplicate cover, no flying-book clone. Selection is an instant
 * keyed cut: no animation, no transition, no runtime motion of any kind.
 *
 * Copy honesty: the long application-style On the desk / version / chapter
 * readout is gone, and nothing claims a chapter is open (no open book is
 * visible; the desk holds one closed bound book). A visually-hidden
 * role="status" line announces the selection to screen readers only.
 *
 * Registration: desktop stage aspect is 3/2 = plate aspect, so the plate
 * renders 1:1 and shelf/desk slots are physical % coordinates glued to the
 * ash surfaces (same registration as R9). The phone composition is a
 * deliberate crop of the same master with re-registered slots; the copy
 * stays inside the same physical world (upper-left plaster), never in a
 * separate block above or below the room.
 *
 * In-plate ink is FIXED (not theme tokens): the plaster is light in both
 * themes and the plate is never re-lit, so dark mode keeps the identical
 * plate and the identical dark-on-plaster copy. Only the surrounding page
 * chrome (nav/footer) follows the theme.
 *
 * Camera-fixed: slot geometry uses physical left/right so the room does
 * NOT mirror in RTL; the copy box is also physically pinned to the left
 * plaster while its text flows logically (rtl stays readable, art stays
 * fixed). Cover art is never mirrored.
 *
 * STATIC baseline: no keyframes, no transitions, no timed motion, no
 * parallax, no camera motion, no WebGL/Three.js/GSAP/Lenis, no video, no
 * tabs/toolbars/progress. Shelf covers are the direct keyboard controls
 * (native buttons, visible focus); reading access is an ordinary Link.
 */

const COPY: Record<
  Locale,
  {
    eyebrow: string
    title: string
    body: string
    shelfLabel: string
    readChapter: string
    selectedAnnounced: string
  }
> = {
  en: {
    eyebrow: 'The reading room',
    title: 'Pick a book up, read a little.',
    body: 'Four small books about everyday habits. Pick one up from the shelf.',
    shelfLabel: 'On the shelf',
    readChapter: 'Read chapter 1',
    selectedAnnounced: 'Selected',
  },
  da: {
    eyebrow: 'Læsestuen',
    title: 'Tag en bog ned, læs lidt.',
    body: 'Fire små bøger om hverdagens vaner. Tag en ned fra hylden.',
    shelfLabel: 'På hylden',
    readChapter: 'Læs kapitel 1',
    selectedAnnounced: 'Valgt',
  },
  ar: {
    eyebrow: 'غرفة القراءة',
    title: 'تناول كتابا واقرأ قليلا.',
    body: 'أربعة كتب صغيرة عن عادات اليوم. تناول واحدا من الرف.',
    shelfLabel: 'على الرف',
    readChapter: 'اقرأ الفصل الأول',
    selectedAnnounced: 'تم اختيار',
  },
}

export function ReadingRoomR10({ locale, books }: { locale: Locale; books: Book[] }) {
  const copy = COPY[locale]
  if (books.length === 0) return null
  const fallback = books.find((b) => b.slug === 'scrolling') ?? books[0]!
  const [selectedSlug, setSelectedSlug] = useState(fallback.slug)
  const selected = books.find((b) => b.slug === selectedSlug) ?? fallback
  // The ash shelf holds the other titles only: never the selected one, so
  // the selected book exists as exactly one physical node on the desk.
  const shelf = books.filter((b) => b.slug !== selected.slug).slice(0, 3)

  const readHref = localePath(locale, `/books/${selected.slug}/read/1`)

  return (
    <section aria-labelledby="reading-room-r10-title" className="reading-room-r10">
      {/* The room stage: the photographic plate IS the layout. Copy, shelf
          and desk all live inside this rect; nothing sits above it. */}
      <div className="reading-room-r10__stage">
        <picture className="reading-room-r10__plate" aria-hidden="true">
          <source
            type="image/avif"
            srcSet={`${assetPath('/site/reading-room-r9-960.avif')} 960w, ${assetPath('/site/reading-room-r9-1536.avif')} 1536w`}
            sizes="(max-width: 640px) 100vw, 100vw"
          />
          <source
            type="image/webp"
            srcSet={`${assetPath('/site/reading-room-r9-960.webp')} 960w, ${assetPath('/site/reading-room-r9-1536.webp')} 1536w`}
            sizes="(max-width: 640px) 100vw, 100vw"
          />
          <img
            src={assetPath('/site/reading-room-r9-1536.webp')}
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={1536}
            height={1024}
            className="reading-room-r10__plate-img"
          />
        </picture>

        {/* Live DOM copy in the quiet plaster negative space. No card, no
            scrim, no baked text: ink straight on the chalk wall. */}
        <div className="reading-room-r10__copy">
          <p className="reading-room-r10__eyebrow">{copy.eyebrow}</p>
          <h1 id="reading-room-r10-title" className="reading-room-r10__title">
            {copy.title}
          </h1>
          <p className="reading-room-r10__body">{copy.body}</p>
          <p className="reading-room-r10__actions">
            <Link to={readHref} className={cn('reading-room-r10__read')}>
              {copy.readChapter}
              <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
            </Link>
          </p>
        </div>

        {/* Ash shelf: the other titles only, upright, feet on the board.
            Covers are the direct keyboard controls. camera-fixed: physical
            left registration, never mirrored. */}
        <ul className="reading-room-r10__shelf" aria-label={copy.shelfLabel}>
          {shelf.map((book, i) => (
            <li key={book.slug} className={`reading-room-r10__slot reading-room-r10__slot--${i + 1}`}>
              <button
                type="button"
                aria-label={book.title}
                onClick={() => setSelectedSlug(book.slug)}
                className="reading-room-r10__shelf-btn"
              >
                <BookCover book={book} sizes="(max-width: 640px) 15vw, 9vw" />
              </button>
            </li>
          ))}
        </ul>

        {/* Desk landing area: the one bound book rests here. Instant cut
            on selection (static baseline, no arrival animation). */}
        <div
          key={selected.slug}
          className="reading-room-r10__deskbook"
          role="img"
          aria-label={selected.title}
        >
          <BookCover
            book={selected}
            priority
            sizes="(max-width: 640px) 30vw, 15vw"
            className="reading-room-r10__book-face"
          />
          {/* Neutral fore-edge page block: adjacent element, never
              cover pixels. */}
          <span className="reading-room-r10__edge" aria-hidden="true" />
        </div>

        {/* Screen-reader-only selection announcement. The visible readout
            is gone; AT users still hear the consequence of choosing. */}
        <p className="reading-room-r10__srstatus" role="status">
          {copy.selectedAnnounced}: {selected.title}
        </p>
      </div>
    </section>
  )
}
