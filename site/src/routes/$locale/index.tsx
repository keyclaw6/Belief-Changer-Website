import { useEffect } from 'react'
import { Link, createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { books } from '~/data'
import { track } from '~/lib/measure'

/**
 * Placeholder home for Milestone 1.
 *
 * This is intentionally NOT the final homepage. It renders the shell plus a
 * temporary note confirming the foundation is standing, and a static,
 * server-rendered cover row that proves the data layer, the copied cover
 * assets, and the design tokens are all wired. Milestone 2 replaces this file
 * with the real homepage flow (hero, trust strip, reframe, method beats, living
 * books, next-book votes, experiences) per SITE-PLAN.
 */
export const Route = createFileRoute('/$locale/')({
  component: HomePlaceholder,
})

function HomePlaceholder() {
  const { locale } = useParams({ from: '/$locale/' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)

  useEffect(() => {
    // Measurement smoke test: fires a page_view in dev, no-ops in prod.
    track('page_view', { routeClass: 'home', locale: activeLocale })
  }, [activeLocale])

  const published = books.filter((b) => b.status === 'published')

  return (
    <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      {/* Temporary milestone note (content area only). */}
      <section className="border-b border-hairline py-[var(--spacing-section-y)]">
        <p className="type-label-caps text-ink-secondary">Milestone 1</p>
        <h1
          className="mt-4 max-w-[18ch] text-ink"
          style={{
            fontSize: 'var(--text-display-xl)',
            fontWeight: 'var(--text-display-xl--font-weight)',
            lineHeight: 'var(--text-display-xl--line-height)',
            letterSpacing: 'var(--text-display-xl--letter-spacing)',
          }}
        >
          {t.wordmark}
        </h1>
        <p
          className="mt-5 max-w-[52ch] text-ink-secondary"
          style={{
            fontSize: 'var(--text-body-lg)',
            lineHeight: 'var(--text-body-lg--line-height)',
          }}
        >
          The foundation is in place: design tokens, self-hosted fonts, light and
          dark themes, locale routing for en, da, and ar, and the layout shell.
          The full pages arrive in the milestones that follow.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to={localePath(activeLocale, '/books')}
            className="rounded-sm bg-action px-6 py-3.5 font-semibold text-on-action no-underline transition-colors duration-150 hover:bg-action-hover"
            style={{ fontSize: 'var(--text-ui-sm)' }}
          >
            {t.nav.library}
          </Link>
          <Link
            to={localePath(activeLocale, '/how-it-works')}
            className="self-center text-ink"
            style={{ fontSize: 'var(--text-ui-sm)' }}
          >
            {t.nav.howItWorks}
          </Link>
        </div>
      </section>

      {/* Static cover row: proves data + assets + tokens render SSR. Real
          corners, cover shadow per the rendered reference. Each cover links to
          its (future) book page. This is the seed of the ShelfStage contract. */}
      <section className="py-[var(--spacing-section-y)]">
        <p className="type-mono-meta">
          {published.length} published · derived from covers-manifest.json
        </p>
        <ul className="mt-6 flex flex-wrap items-end gap-[var(--spacing-lg)]">
          {published.map((book) => (
            <li key={book.slug}>
              <Link
                to={localePath(activeLocale, `/books/${book.slug}`)}
                className="group block no-underline"
                aria-label={book.title}
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  width={160}
                  height={240}
                  loading="lazy"
                  className="h-[240px] w-auto rounded-[2px] transition-transform duration-200 group-hover:-translate-y-1"
                  style={{ boxShadow: 'var(--shadow-cover)' }}
                />
                <span
                  className="mt-3 block text-ink"
                  style={{
                    fontSize: 'var(--text-book-title)',
                    fontWeight: 'var(--text-book-title--font-weight)',
                    lineHeight: 'var(--text-book-title--line-height)',
                  }}
                >
                  {book.title}
                </span>
                <span className="type-mono-meta mt-1 block">
                  v{book.version} · {book.languages} languages
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
