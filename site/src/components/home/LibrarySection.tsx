import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { BookCard } from '~/components/BookCard'
import { Reveal } from '~/components/Reveal'
import { inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * LibrarySection (home, canvas): "The books." A generous grid of titled covers
 * with hologram hover, then the "All books" link (copy deck 01-home). Each card
 * carries its live-text title and one mono line; hologram lift on hover comes
 * from BookCard. Exactly N cells for N books shown.
 */
export function LibrarySection({
  locale,
  t,
  books,
}: {
  locale: Locale
  t: Messages
  books: Book[]
}) {
  return (
    <section className="bg-canvas">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
        <Reveal>
          <h2
            className="text-ink"
            style={{
              fontSize: 'var(--text-headline-lg)',
              fontWeight: 'var(--text-headline-lg--font-weight)',
              lineHeight: 'var(--text-headline-lg--line-height)',
              letterSpacing: 'var(--text-headline-lg--letter-spacing)',
            }}
          >
            {t.home.libraryTitle}
          </h2>
          <p
            className="mt-3 max-w-[56ch] text-ink-secondary"
            style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
          >
            {t.home.libraryBody}
          </p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-11 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((book, i) => (
            <Reveal key={book.slug} as="li" index={Math.min(i, 7)} amount={0.15}>
              <BookCard book={book} locale={locale} t={t} />
            </Reveal>
          ))}
        </ul>

        <Reveal as="div" className="mt-10">
          <Link
            to={localePath(locale, '/books')}
            className={cn(inkLink, 'inline-flex items-center gap-1.5')}
          >
            {t.home.libraryLink}
            <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
