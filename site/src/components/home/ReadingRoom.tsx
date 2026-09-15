import { useState } from 'react'
import './reading-room.css'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { BookCover } from '~/components/BookCover'
import { assetPath } from '~/lib/deployment'
import { inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * ReadingRoom (Track B slice R9): one photographic reading alcove.
 *
 * R9 answers the R8 verdict (a synthetic CSS recess, asset gap flagged):
 * the room is now the approved photographic plate
 * (site/public/site/reading-room-r9-*, derived AVIF/WebP from the
 * art-directed 1536x1024 empty-scene master; the source PNG lives outside
 * the repo). Chalk plaster, charcoal felt, pale ash shelf, deep desk,
 * narrow right daylight reveal. This run tests ONE thing: existing
 * immutable books register as a believable shelf -> selected desk-book ->
 * reading instrument inside this real place.
 *
 * Single physical node rule: the selected title appears exactly ONCE, as
 * the bound book resting on the desk. The ash shelf shows only the other
 * (up to three) titles, upright, feet on the shelf board, never the
 * selected one. No vacancy placeholder, no dashed recess, no duplicate
 * cover, no container chrome: the room itself is the layout.
 *
 * Registration: the plate renders 1:1 (alcove aspect 3/2 = plate aspect),
 * so shelf/desk slots are physical % coordinates glued to the ash
 * surfaces. The mobile portrait composition is a deliberate crop of the
 * same master (tuned object-position) with re-registered slot coordinates
 * for the visible window -- never a stacked card version.
 *
 * Plate and covers are decorative/photographic matter: never mirrored,
 * cropped, tinted, or re-lit by this slice (BookCover owns the art;
 * contact shadows sit on the wood OUTSIDE cover faces). Dark mode may
 * alter the surrounding page interface only, never the plate or covers.
 * Camera-fixed: slot geometry uses physical left/right so the room does
 * NOT mirror in RTL; DOM order and text use logical flow only.
 *
 * STATIC approval baseline: selection swaps the desk book with an instant
 * cut (keyed swap, no animation, no transition). The single Read action
 * sits adjacent to the editorial copy and never depends on decorative
 * state. No runtime renderer, no menu/tabs/dropdowns/progress.
 */

const COPY: Record<
  Locale,
  {
    eyebrow: string
    title: string
    body: string
    shelfLabel: string
    deskLabel: string
    readChapter: string
    aboutBook: string
    beingWritten: string
    chapterLabel: string
  }
> = {
  en: {
    eyebrow: 'The reading room',
    title: 'Pick a book up, read a little.',
    body: 'Four small books about everyday habits. One rests on the desk; the first chapter is open.',
    shelfLabel: 'On the shelf',
    deskLabel: 'On the desk',
    readChapter: 'Read chapter 1',
    aboutBook: 'About this book',
    beingWritten: 'Being written',
    chapterLabel: 'Chapter 1',
  },
  da: {
    eyebrow: 'Læsestuen',
    title: 'Tag en bog ned, læs lidt.',
    body: 'Fire små bøger om hverdagens vaner. En ligger på bordet; første kapitel står åbent.',
    shelfLabel: 'På hylden',
    deskLabel: 'På bordet',
    readChapter: 'Læs kapitel 1',
    aboutBook: 'Om denne bog',
    beingWritten: 'Skrives nu',
    chapterLabel: 'Kapitel 1',
  },
  ar: {
    eyebrow: 'غرفة القراءة',
    title: 'تناول كتابا واقرأ قليلا.',
    body: 'أربعة كتب صغيرة عن عادات اليوم. واحد على الطاولة؛ الفصل الأول مفتوح.',
    shelfLabel: 'على الرف',
    deskLabel: 'على الطاولة',
    readChapter: 'اقرأ الفصل الأول',
    aboutBook: 'عن هذا الكتاب',
    beingWritten: 'قيد الكتابة',
    chapterLabel: 'الفصل الأول',
  },
}

export function ReadingRoom({ locale, books }: { locale: Locale; books: Book[] }) {
  const copy = COPY[locale]
  if (books.length === 0) return null
  const fallback = books.find((b) => b.slug === 'scrolling') ?? books[0]!
  const [selectedSlug, setSelectedSlug] = useState(fallback.slug)
  const selected = books.find((b) => b.slug === selectedSlug) ?? fallback
  // The ash shelf holds the other titles only: never the selected one, so
  // the selected book exists as exactly one physical node on the desk.
  const shelf = books.filter((b) => b.slug !== selected.slug).slice(0, 3)

  const chapter = selected.chapters[0]
  const readHref = localePath(locale, `/books/${selected.slug}/read/1`)
  const bookHref = localePath(locale, `/books/${selected.slug}`)
  const versionText =
    selected.version > 0 && selected.versionDate
      ? `Version ${selected.version} · ${selected.versionDate}`
      : copy.beingWritten
  const chapterText = chapter ? `${copy.chapterLabel}: ${chapter.title}` : selected.title

  return (
    <section aria-labelledby="reading-room-title" className="bg-band reading-room">
      <div className="reading-room__wrap mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
        <p className="type-label-caps text-ink-secondary">{copy.eyebrow}</p>
        <h2
          id="reading-room-title"
          className="text-ink"
          style={{
            fontSize: 'var(--text-headline-lg)',
            fontWeight: 'var(--text-headline-lg--font-weight)',
            lineHeight: 'var(--text-headline-lg--line-height)',
            letterSpacing: 'var(--text-headline-lg--letter-spacing)',
          }}
        >
          {copy.title}
        </h2>
        <p
          className="reading-room__body mt-4 max-w-[38ch] text-ink-secondary"
          style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
        >
          {copy.body}
        </p>

        {/* The single Read action in this viewport, adjacent to the copy.
            Live DOM, never dependent on decorative state. */}
        <p className="reading-room__actions">
          <Link to={readHref} className={cn(inkLink, 'reading-room__read')}>
            {copy.readChapter}
            <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
          </Link>
        </p>

        {/* The room: the photographic plate IS the layout. Shelf slots and
            the desk book register onto the real ash surfaces. Plate is
            decorative; every book and action stays SSR/live DOM. */}
        <div className="reading-room__alcove">
          <picture className="reading-room__plate" aria-hidden="true">
            <source
              type="image/avif"
              srcSet={`${assetPath('/site/reading-room-r9-960.avif')} 960w, ${assetPath('/site/reading-room-r9-1536.avif')} 1536w`}
              sizes="(max-width: 640px) 100vw, 1536px"
            />
            <source
              type="image/webp"
              srcSet={`${assetPath('/site/reading-room-r9-960.webp')} 960w, ${assetPath('/site/reading-room-r9-1536.webp')} 1536w`}
              sizes="(max-width: 640px) 100vw, 1536px"
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
              className="reading-room__plate-img"
            />
          </picture>

          {/* Ash shelf: three real upright titles, feet on the board. The
              covers are the direct controls; no vacant slot is rendered.
              camera-fixed: slots use physical left registration, never mirrored. */}
          <ul className="reading-room__shelf" aria-label={copy.shelfLabel}>
            {shelf.map((book, i) => (
              <li key={book.slug} className={`reading-room__slot reading-room__slot--${i + 1}`}>
                <button
                  type="button"
                  aria-label={book.title}
                  onClick={() => setSelectedSlug(book.slug)}
                  className="reading-room__shelf-btn"
                >
                  <BookCover book={book} sizes="(max-width: 640px) 13vw, 9vw" />
                </button>
              </li>
            ))}
          </ul>

          {/* Desk landing area: the one bound book rests here. Instant cut
              on selection (static baseline, no arrival animation). */}
          <div
            key={selected.slug}
            className="reading-room__deskbook"
            role="img"
            aria-label={`${copy.deskLabel}: ${selected.title}`}
          >
            <BookCover
              book={selected}
              priority
              sizes="(max-width: 640px) 30vw, 15vw"
              className="reading-room__book-face"
            />
            {/* Neutral fore-edge page block: adjacent element, never
                cover pixels. */}
            <span className="reading-room__edge" aria-hidden="true" />
          </div>
        </div>

        {/* Quiet marginal version info as live DOM below the room:
            selection announcements surface here for screen readers. */}
        <p className="type-mono-meta reading-room__marginalia" role="status">
          <span className="reading-room__marginalia-facts">
            {copy.deskLabel}: <bdi>{selected.title}</bdi>, {versionText}, <bdi>{chapterText}</bdi>
          </span>
          <Link to={bookHref} className={cn(inkLink, 'reading-room__marginalia-link')}>
            {copy.aboutBook}
            <ArrowRight size={13} weight="bold" aria-hidden="true" className="dir-flip" />
          </Link>
        </p>
      </div>
    </section>
  )
}
