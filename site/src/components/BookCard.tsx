import { Link } from '@tanstack/react-router'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { format } from '~/i18n'
import { BookCover } from './BookCover'
import { StatusTag } from './StatusTag'

/**
 * BookCard: the library grid card (DESIGN.md Components §Book cards). Cover
 * (its own ground is the identity) + book-title type beneath + one mono-meta
 * line. A tiny status tag sits above the meta so books being written read as
 * real content, not gaps. The whole card is one link; there is no boxed card
 * around the cover (the cover carries itself), matching the rendered reference.
 *
 * The mono line adapts to what is true: published/in-translation books show
 * "Version N · M languages"; books with no version yet show only their status
 * (the tag already carries the meaning), so no fake "Version 0" ever appears.
 */
export function BookCard({
  book,
  locale,
  t,
}: {
  book: Book
  locale: Locale
  t: Messages
}) {
  const hasVersion = book.version > 0
  const meta = hasVersion
    ? format(
        book.languages === 1
          ? t.book.versionLanguagesOne
          : t.book.versionLanguages,
        { version: book.version, count: book.languages },
      )
    : null

  return (
    <Link
      to={localePath(locale, `/books/${book.slug}`)}
      className="group block no-underline"
      aria-label={book.title}
    >
      <span className="block transition-transform duration-200 group-hover:-translate-y-1 motion-reduce:transform-none">
        <BookCover book={book} sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 300px" />
      </span>

      <span className="mt-4 flex items-center gap-2">
        <StatusTag status={book.status} t={t} />
      </span>

      <span
        className="mt-2.5 block text-ink"
        style={{
          fontSize: 'var(--text-book-title)',
          fontWeight: 'var(--text-book-title--font-weight)',
          lineHeight: 'var(--text-book-title--line-height)',
        }}
      >
        {book.title}
      </span>

      {meta ? (
        <span className="type-mono-meta mt-1 block">{meta}</span>
      ) : null}
    </Link>
  )
}
