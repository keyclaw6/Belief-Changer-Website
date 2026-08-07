import { useId, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { cn } from '~/lib/utils'

/**
 * BookTabs: the living-book detail, split across two tabs (DESIGN.md
 * Components §Living-book block; SITE-PLAN §Versions and formats): "About this
 * book" and "Changelog". Hand-built accessible tabs (tablist / tab / tabpanel
 * with roving arrow-key focus) restyled entirely with the tokens: an ink
 * underline marks the active tab, hairline rule beneath the row. No default
 * component-library chrome.
 *
 * The Changelog is functional content and appears NOWHERE else on the site
 * (it is not a route). Each entry is version id · date · what · why, in that
 * order; the "only the newest version is downloadable" line and the aggregate
 * "improved from reader contributions" line sit with it. There is never any
 * attribution of any kind.
 *
 * Both panels render their content in the SSR HTML; JS only toggles which is
 * visible, so the changelog is crawlable and works without hydration.
 */
export function BookTabs({
  book,
  locale,
  t,
}: {
  book: Book
  locale: Locale
  t: Messages
}) {
  const [active, setActive] = useState<0 | 1>(0)
  const base = useId()
  const tabRefs = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)]

  const tabs = [t.book.aboutTab, t.book.changelogTab]

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    // Two tabs: either arrow key flips to the other tab and moves focus with it.
    const target: 0 | 1 = active === 0 ? 1 : 0
    setActive(target)
    tabRefs[target]?.current?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={book.title}
        className="flex gap-6 border-b border-hairline"
        onKeyDown={onKeyDown}
      >
        {tabs.map((label, i) => {
          const selected = active === i
          return (
            <button
              key={label}
              ref={tabRefs[i]}
              role="tab"
              id={`${base}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i as 0 | 1)}
              className={cn(
                'relative -mb-px border-b-2 px-1 pb-3 pt-1 type-ui-sm transition-colors duration-150',
                selected
                  ? 'border-ink text-ink'
                  : 'border-transparent text-ink-secondary hover:text-ink',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* About this book */}
      <div
        role="tabpanel"
        id={`${base}-panel-0`}
        aria-labelledby={`${base}-tab-0`}
        hidden={active !== 0}
        className="pt-7"
      >
        <AboutPanel book={book} locale={locale} t={t} />
      </div>

      {/* Changelog */}
      <div
        role="tabpanel"
        id={`${base}-panel-1`}
        aria-labelledby={`${base}-tab-1`}
        hidden={active !== 1}
        className="pt-7"
      >
        <ChangelogPanel book={book} t={t} />
      </div>
    </div>
  )
}

function AboutPanel({
  book,
  locale,
  t,
}: {
  book: Book
  locale: Locale
  t: Messages
}) {
  const readable = book.formats.read === 'available'
  return (
    <div className="max-w-[62ch]">
      <p
        className="text-ink-secondary"
        style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
      >
        {t.home.livingBooksBody}
      </p>

      {/* Table of contents: real function, distinct from the masthead. When the
          book is readable, chapters link into the reader; otherwise they list
          with a quiet being-written note so the shape of the book is honest. */}
      <p className="type-label-caps mt-9 text-ink-secondary">{t.reader.contents}</p>
      <ol className="mt-4">
        {book.chapters.map((c, i) => {
          const hasBody = Boolean(c.body && c.body.length > 0)
          const label = (
            <span className="flex items-baseline gap-3">
              <span className="type-mono-meta w-6 shrink-0 text-end">{c.n}</span>
              <span
                style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
              >
                {c.title}
              </span>
            </span>
          )
          return (
            <li
              key={c.n}
              className={cn('py-3', i > 0 && 'border-t border-hairline')}
            >
              {readable && hasBody ? (
                <Link
                  to={localePath(locale, `/books/${book.slug}/read/${c.n}`)}
                  className="block text-ink no-underline transition-opacity duration-150 hover:opacity-70"
                >
                  {label}
                </Link>
              ) : (
                <span className="block text-ink-secondary">{label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function ChangelogPanel({ book, t }: { book: Book; t: Messages }) {
  if (book.changelog.length === 0) {
    // A book with no published history yet: honest, not empty filler.
    return (
      <p
        className="max-w-[54ch] text-ink-secondary"
        style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
      >
        {t.book.notPublishedYet}
      </p>
    )
  }

  return (
    <div>
      {/* Sparse dividers: one hairline between entries, not a box per row. */}
      <ol className="max-w-[62ch]">
        {book.changelog.map((entry, i) => (
          <li
            key={entry.version}
            className={cn('py-6', i > 0 && 'border-t border-hairline')}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {/* Version id and date are locale-invariant machine facts (Latin
                  digits / month names). Isolate each with <bdi> so their order
                  stays stable inside an RTL (Arabic) paragraph. */}
              <bdi className="type-mono-meta text-ink">{entry.version}</bdi>
              <bdi className="type-mono-meta">{entry.date}</bdi>
            </div>
            <p
              className="mt-2 text-ink"
              style={{ fontSize: 'var(--text-body-md)', fontWeight: 500, lineHeight: 'var(--text-body-md--line-height)' }}
            >
              {entry.what}
            </p>
            <p
              className="mt-1 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
            >
              {entry.why}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-2 space-y-1 border-t border-hairline pt-5">
        <p className="type-mono-meta">{t.book.improvedFromContributions}</p>
        <p className="type-mono-meta">{t.book.onlyNewestDownload}</p>
      </div>
    </div>
  )
}
