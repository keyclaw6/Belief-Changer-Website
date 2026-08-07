import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Link,
  createFileRoute,
  useNavigate,
  useParams,
  useSearch,
} from '@tanstack/react-router'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { getMessages, format } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates, localePath } from '~/i18n/routing'
import { books } from '~/data'
import type { Book } from '~/data/types'
import { statusLabel } from '~/components/StatusTag'
import { BookCard } from '~/components/BookCard'
import { Reveal } from '~/components/Reveal'
import { track, sanitizeQuery } from '~/lib/measure'
import { inputText, btnPrimary, inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'
import type { Messages } from '~/i18n'

/**
 * Library (M3). Every book, browsable and searchable, honest about what is
 * coming. The full grid is server-rendered first (SSR-complete HTML, exactly
 * one cell per book); the finder then filters client-side over the title,
 * subject, and promise. Books being written render as real content (cover +
 * status tag), never as gaps.
 *
 * The finder is URL-driven: the query lives in ?q= so it is shareable and so
 * the homepage hero can seed it. On a true no-match with a real query, the
 * no-match state offers the request board and fires finder_no_match once per
 * distinct query (SITE-PLAN measurement contract).
 */

interface LibrarySearch {
  q?: string
}

export const Route = createFileRoute('/$locale/books/')({
  validateSearch: (search: Record<string, unknown>): LibrarySearch => {
    const q = typeof search.q === 'string' ? search.q : undefined
    return q && q.trim() ? { q } : {}
  },
  head: () => ({
    links: hreflangAlternates('/books').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: LibraryPage,
})

/** Build the lowercased haystack a book is matched against. */
function haystack(book: Book, t: Messages): string {
  return [
    book.title,
    book.promise,
    book.slug.replace(/-/g, ' '),
    statusLabel(book.status, t),
  ]
    .join(' ')
    .toLowerCase()
}

function LibraryPage() {
  const { locale } = useParams({ from: '/$locale/books/' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)
  const search = useSearch({ from: '/$locale/books/' })
  const navigate = useNavigate({ from: '/$locale/books/' })

  const query = search.q ?? ''
  // `draft` drives the live client-side filter; the URL ?q= is the shareable
  // seed (from the hero, a bookmark, or back navigation). They start in sync
  // and re-sync whenever the URL query changes underneath us.
  const [draft, setDraft] = useState(query)

  useEffect(() => {
    setDraft(query)
  }, [query])

  useEffect(() => {
    track('page_view', { routeClass: 'library', locale: activeLocale })
  }, [activeLocale])

  // Filter live off the draft (typing filters immediately); the full grid is
  // the SSR/default state when the field is empty.
  const trimmed = draft.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!trimmed) return books
    return books.filter((b) => haystack(b, t).includes(trimmed))
  }, [trimmed, t])

  // Fire finder_no_match once per distinct normalized query that yields nothing.
  const firedFor = useRef<string | null>(null)
  useEffect(() => {
    if (trimmed && filtered.length === 0) {
      const normalized = sanitizeQuery(draft)
      if (normalized && firedFor.current !== normalized) {
        firedFor.current = normalized
        track('finder_no_match', { queryNormalized: normalized, locale: activeLocale })
      }
    } else if (filtered.length > 0) {
      // Reset so a later re-emptying of the same query fires again.
      firedFor.current = null
    }
  }, [trimmed, filtered.length, draft, activeLocale])

  // Persist the current draft to the URL (shareable) on submit / clear.
  function commit(next: string) {
    const clean = next.trim()
    navigate({ search: clean ? { q: clean } : {}, replace: true })
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    commit(draft)
  }

  function clear() {
    setDraft('')
    commit('')
  }

  const count = filtered.length
  const resultsLabel = trimmed
    ? format(count === 1 ? t.library.resultsForOne : t.library.resultsFor, {
        count,
        query: draft.trim(),
      })
    : format(count === 1 ? t.library.resultsCountOne : t.library.resultsCount, {
        count,
      })

  return (
    <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      {/* Header + finder */}
      <section className="pt-14 md:pt-[88px]">
        <h1
          className="text-ink"
          style={{
            fontSize: 'var(--text-headline-lg)',
            fontWeight: 'var(--text-headline-lg--font-weight)',
            lineHeight: 'var(--text-headline-lg--line-height)',
            letterSpacing: 'var(--text-headline-lg--letter-spacing)',
          }}
        >
          {t.library.title}
        </h1>
        <p
          className="mt-3 max-w-[52ch] text-ink-secondary"
          style={{
            fontSize: 'var(--text-body-lg)',
            lineHeight: 'var(--text-body-lg--line-height)',
          }}
        >
          {t.library.intro}
        </p>

        <form onSubmit={onSubmit} role="search" className="mt-8 max-w-[36rem]">
          <label htmlFor="library-finder" className="type-label-caps mb-2 block text-ink-secondary">
            {t.library.searchLabel}
          </label>
          <div className="relative">
            <MagnifyingGlass
              size={17}
              weight="regular"
              aria-hidden="true"
              className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-ink-secondary"
            />
            <input
              id="library-finder"
              name="q"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t.library.searchPlaceholder}
              autoComplete="off"
              className={cn(inputText, 'ps-11', draft && 'pe-11')}
            />
            {draft ? (
              <button
                type="button"
                onClick={clear}
                aria-label={t.library.clearSearch}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-ink-secondary transition-colors hover:text-ink"
              >
                <X size={16} weight="bold" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </form>

        {/* Live result count for screen readers and as a quiet visible fact. */}
        <p className="type-mono-meta mt-5" aria-live="polite">
          {resultsLabel}
        </p>
      </section>

      {/* Grid or no-match. Exactly N cells for N books. */}
      {count > 0 ? (
        <section className="pb-[var(--spacing-section-y)] pt-10">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-11 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((book, i) => (
              <Reveal key={book.slug} as="li" index={Math.min(i, 7)} amount={0.15}>
                <BookCard book={book} locale={activeLocale} t={t} />
              </Reveal>
            ))}
          </ul>
        </section>
      ) : (
        <NoMatch locale={activeLocale} t={t} onClear={clear} query={draft} />
      )}
    </div>
  )
}

/**
 * No-match state: real content, not filler. It names the gap honestly and
 * routes the visitor to the request board so their need can become a book.
 */
function NoMatch({
  locale,
  t,
  onClear,
  query,
}: {
  locale: Locale
  t: Messages
  onClear: () => void
  /** The current finder query, passed to the board as a subject seed. */
  query: string
}) {
  return (
    <section className="pb-[var(--spacing-section-y)] pt-16">
      <div className="max-w-[46rem] rounded-lg border border-hairline bg-surface p-10 md:p-12">
        <h2
          className="text-ink"
          style={{
            fontSize: 'var(--text-headline-md)',
            fontWeight: 'var(--text-headline-md--font-weight)',
            lineHeight: 'var(--text-headline-md--line-height)',
          }}
        >
          {t.library.noMatchTitle}
        </h2>
        <p
          className="mt-3 max-w-[54ch] text-ink-secondary"
          style={{
            fontSize: 'var(--text-body-lg)',
            lineHeight: 'var(--text-body-lg--line-height)',
          }}
        >
          {t.library.noMatchBody}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* Links to the board, seeding the subject field with the finder
              query (the board validates and caps the ?subject= param). */}
          <Link
            to={localePath(locale, '/requests')}
            search={query.trim() ? { subject: query.trim() } : {}}
            className={btnPrimary}
          >
            {t.library.noMatchCta}
          </Link>
          <button type="button" onClick={onClear} className={inkLink}>
            {t.library.clearSearch}
          </button>
        </div>
      </div>
    </section>
  )
}
