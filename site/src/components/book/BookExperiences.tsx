import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import type { Experience } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * BookExperiences: the experiences excerpt for this book (copy deck
 * 04-book-page). Two or three anonymous excerpts, quote-styled and clamped to a
 * glance, then the links "Read more experiences" and "Share yours" (both to the
 * experience board). When the book has none, the honest empty state stands as
 * real content. No invented testimonials, no fake counts.
 */
export function BookExperiences({
  experiences,
  locale,
  t,
}: {
  experiences: Experience[]
  locale: Locale
  t: Messages
}) {
  const items = experiences.slice(0, 3)

  return (
    <div>
      <h2
        className="text-ink"
        style={{
          fontSize: 'var(--text-headline-md)',
          fontWeight: 'var(--text-headline-md--font-weight)',
          lineHeight: 'var(--text-headline-md--line-height)',
        }}
      >
        {t.book.experiencesHeading}
      </h2>

      {items.length > 0 ? (
        <>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((exp) => (
              <li key={exp.id}>
                <figure className="flex h-full flex-col rounded-lg border border-hairline bg-canvas p-6">
                  <blockquote
                    className="flex-1 text-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:6] overflow-hidden"
                    style={{
                      fontSize: 'var(--text-body-md)',
                      lineHeight: 'var(--text-body-md--line-height)',
                    }}
                  >
                    {exp.text}
                  </blockquote>
                  <figcaption className="type-mono-meta mt-4">{exp.month}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to={localePath(locale, '/experiences')}
              className={cn(inkLink, 'inline-flex items-center gap-1.5')}
            >
              {t.book.experiencesReadMore}
              <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
            </Link>
            <Link to={localePath(locale, '/experiences')} className={inkLink}>
              {t.book.experiencesShareYours}
            </Link>
          </div>
        </>
      ) : (
        <p
          className="mt-4 max-w-[48ch] text-ink-secondary"
          style={{
            fontSize: 'var(--text-body-lg)',
            lineHeight: 'var(--text-body-lg--line-height)',
          }}
        >
          {t.book.experiencesEmpty}
        </p>
      )}
    </div>
  )
}
