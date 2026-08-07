import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { format } from '~/i18n'
import { BookCover } from '~/components/BookCover'
import { Reveal } from '~/components/Reveal'
import { inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * LivingBooks: versions, public changelogs, "the newest version is always the
 * one you get" (SITE-PLAN homepage flow §5). Mono facts and hairline structure:
 * a row of the published books, each with its real fixture version and language
 * count set in mono-meta, sitting in a single hairline-bordered white panel on
 * the band section (white content on warm bone is the signature look).
 *
 * The section reads as data, not marketing: no eyebrow, real numbers from the
 * fixture, one middle dot per meta line only.
 */
export function LivingBooks({
  locale,
  t,
  books,
}: {
  locale: Locale
  t: Messages
  books: Book[]
}) {
  return (
    <section className="bg-band">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
        <Reveal>
          <h2
            className="max-w-[16ch] text-ink"
            style={{
              fontSize: 'var(--text-headline-lg)',
              fontWeight: 'var(--text-headline-lg--font-weight)',
              lineHeight: 'var(--text-headline-lg--line-height)',
              letterSpacing: 'var(--text-headline-lg--letter-spacing)',
            }}
          >
            {t.home.livingBooksTitle}
          </h2>
          <p
            className="mt-3 max-w-[54ch] text-ink-secondary"
            style={{
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--text-body-lg--line-height)',
            }}
          >
            {t.home.livingBooksBody}
          </p>
        </Reveal>

        <Reveal as="div" className="mt-10">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-9 rounded-lg border border-hairline bg-canvas p-8 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((book, i) => (
              <li key={book.slug}>
                <Link
                  to={localePath(locale, `/books/${book.slug}`)}
                  aria-label={book.title}
                  className="group block no-underline"
                >
                  <span className="block transition-transform duration-200 group-hover:-translate-y-1 motion-reduce:transform-none">
                    <BookCover book={book} sizes="(max-width: 640px) 40vw, 180px" />
                  </span>
                  <span
                    className="mt-3.5 block text-ink"
                    style={{
                      fontSize: 'var(--text-book-title)',
                      fontWeight: 'var(--text-book-title--font-weight)',
                      lineHeight: 'var(--text-book-title--line-height)',
                    }}
                  >
                    {book.title}
                  </span>
                  {/* Mono fact: version and language count, one middle dot. */}
                  <span className="type-mono-meta mt-1 block">
                    {format(
                      book.languages === 1
                        ? t.book.versionLanguagesOne
                        : t.book.versionLanguages,
                      { version: book.version, count: book.languages },
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="div" className="mt-8">
          <Link
            to={localePath(locale, '/books')}
            className={cn(inkLink, 'inline-flex items-center gap-1.5')}
          >
            {t.home.livingBooksLink}
            <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
