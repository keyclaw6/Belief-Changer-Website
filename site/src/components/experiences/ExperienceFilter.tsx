import { Link } from '@tanstack/react-router'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { cn } from '~/lib/utils'

/**
 * ExperienceFilter: the book filter on /experiences. URL-driven so the full
 * list renders server-side first and any filtered view is shareable and
 * crawlable (no client state gate on the initial render). Each option is a
 * router Link that sets or clears the ?book= param; the active one is solid ink
 * (the finder-chip treatment from DESIGN.md, not a pastel, since a book is not a
 * status). Rendered as a labelled group of links, keyboard-navigable by default.
 */
export interface FilterBook {
  slug: string
  title: string
}

export function ExperienceFilter({
  books,
  active,
  locale,
  t,
}: {
  books: FilterBook[]
  /** Active book slug, or null for "All books". */
  active: string | null
  locale: Locale
  t: Messages
}) {
  const chip =
    'inline-flex items-center rounded-md border px-3.5 py-2 type-ui-sm no-underline transition-colors duration-150'
  const idle = 'border-hairline text-ink-secondary hover:border-ink hover:text-ink'
  const on = 'border-ink bg-ink text-on-action'

  return (
    <nav aria-label={t.experiences.filterLabel}>
      <p className="type-label-caps mb-3 text-ink-secondary">{t.experiences.filterLabel}</p>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            to={localePath(locale, '/experiences')}
            search={{}}
            aria-current={active === null ? 'true' : undefined}
            className={cn(chip, active === null ? on : idle)}
          >
            {t.experiences.filterAll}
          </Link>
        </li>
        {books.map((b) => {
          const selected = active === b.slug
          return (
            <li key={b.slug}>
              <Link
                to={localePath(locale, '/experiences')}
                search={{ book: b.slug }}
                aria-current={selected ? 'true' : undefined}
                className={cn(chip, selected ? on : idle)}
              >
                {b.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
