import { Link } from '@tanstack/react-router'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'

/**
 * Footer: four quiet columns over a hairline (00-global.md).
 *   1. Belief Changer  wordmark + one line ("Free books that change the belief
 *      behind the behavior.")
 *   2. Library         Books · Request a book
 *   3. Community       Experiences · Notes · Contribute
 *   4. The small print About · Privacy · Open source
 * Then the mono trust line: "Free forever · no accounts, no tracking".
 *
 * Requests and Contribute live here (Requests is a destination for the
 * committed, not a nav tab). "Open source" is an outbound link to the public
 * repository, marked as a clearly-labeled placeholder href until the owner
 * confirms it.
 */
export function Footer({ locale, t }: { locale: Locale; t: Messages }) {
  const linkClass = 'type-ui-sm text-ink-secondary no-underline transition-colors duration-150 hover:text-ink'

  const columns: Array<{ heading: string; links: ReadonlyArray<{ label: string; to?: string; href?: string }> }> = [
    {
      heading: t.footer.libraryHeading,
      links: [
        { label: t.footer.books, to: '/books' },
        { label: t.footer.requestABook, to: '/requests' },
      ],
    },
    {
      heading: t.footer.communityHeading,
      links: [
        { label: t.footer.experiences, to: '/experiences' },
        { label: t.footer.notes, to: '/blog' },
        { label: t.footer.contribute, to: '/contribute' },
      ],
    },
    {
      heading: t.footer.smallPrintHeading,
      links: [
        { label: t.footer.about, to: '/about' },
        { label: t.footer.privacy, to: '/privacy' },
        // Placeholder href: the public repository URL is an owner decision.
        { label: t.footer.openSource, href: 'https://github.com/belief-changer' },
      ],
    },
  ]

  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] pb-14 pt-16">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Column 1: wordmark + one line. */}
          <div className="max-w-[30ch]">
            <Link
              to={localePath(locale, '/')}
              className="type-wordmark text-ink no-underline"
            >
              {t.wordmark}
            </Link>
            <p
              className="mt-3 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
            >
              {t.footer.tagline}
            </p>
          </div>

          {/* Columns 2 to 4: link groups. */}
          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <p className="type-label-caps text-ink-secondary">{col.heading}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={localePath(locale, l.to)} className={linkClass}>
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Mono trust line, copy deck verbatim. Middle dot is metadata-only. */}
        <div className="mt-14 border-t border-hairline pt-8">
          <span className="type-mono-meta">{t.footer.trustLine}</span>
        </div>
      </div>
    </footer>
  )
}
