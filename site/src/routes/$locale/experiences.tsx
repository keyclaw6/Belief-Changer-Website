import { useEffect } from 'react'
import { Link, createFileRoute, useParams, useSearch } from '@tanstack/react-router'
import { getMessages, format } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates, localePath } from '~/i18n/routing'
import { experiences as allExperiences, getBook, books } from '~/data'
import type { Experience } from '~/data/types'
import type { Messages } from '~/i18n'
import { track } from '~/lib/measure'
import { Reveal } from '~/components/Reveal'
import { Painting } from '~/components/Painting'
import { ExperienceFilter, type FilterBook } from '~/components/experiences/ExperienceFilter'
import { ExperienceSubmit } from '~/components/experiences/ExperienceSubmit'

/**
 * Experience board (M4): what these books did for real people (SITE-PLAN
 * §Community mechanics). The together-after-rain painting anchors the header as
 * the section's single emotional voice (imagery manifest; no photography on
 * this page). Below it, anonymous experience cards, filterable by book through
 * a URL-driven ?book= param so the FULL list renders server-side first and any
 * filtered view is shareable. Then the share flow on a band.
 *
 * Cards are anonymous: each shows which book it is about (linking to the book),
 * the excerpt, and a coarse month. No names, no counts, no fine dates. The
 * empty state for a filtered book with none is honest content, not filler.
 *
 * Layout families, all distinct: an image-anchored editorial header, a filter
 * bar, a card grid, and a form panel. Eyebrow count: zero.
 */

interface ExperiencesSearch {
  book?: string
}

export const Route = createFileRoute('/$locale/experiences')({
  validateSearch: (search: Record<string, unknown>): ExperiencesSearch => {
    // Accept only a slug that names a real book; anything else clears the
    // filter so a bad ?book= value renders the full list, never an empty page.
    const raw = typeof search.book === 'string' ? search.book : ''
    return raw && getBook(raw) ? { book: raw } : {}
  },
  head: () => ({
    links: hreflangAlternates('/experiences').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: ExperiencesPage,
})

/** Books that actually have at least one experience, for the filter options. */
function booksWithExperiences(): FilterBook[] {
  const slugs = new Set(allExperiences.map((e) => e.bookSlug))
  return books
    .filter((b) => slugs.has(b.slug))
    .map((b) => ({ slug: b.slug, title: b.title }))
}

function ExperiencesPage() {
  const { locale } = useParams({ from: '/$locale/experiences' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)
  const search = useSearch({ from: '/$locale/experiences' })
  // Resolve the active filter only to a book that actually exists, so a stale
  // or hand-typed ?book= value always falls back to the full list (never an
  // empty page). This mirrors the validateSearch guard and holds on SSR.
  const activeBook = search.book && getBook(search.book) ? search.book : null

  useEffect(() => {
    track('page_view', { routeClass: 'experiences', locale: activeLocale })
  }, [activeLocale])

  const filtered: Experience[] = activeBook
    ? allExperiences.filter((e) => e.bookSlug === activeBook)
    : allExperiences

  const count = filtered.length
  const activeTitle = activeBook ? getBook(activeBook)?.title ?? '' : ''
  const countLabel = activeBook
    ? format(count === 1 ? t.experiences.countForBookOne : t.experiences.countForBook, {
        count,
        book: activeTitle,
      })
    : format(count === 1 ? t.experiences.countAllOne : t.experiences.countAll, { count })

  const filterBooks = booksWithExperiences()

  return (
    <>
      {/* Image-anchored header: the painting is the section's single voice. */}
      <section className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
        <div className="pb-12 pt-14 md:pt-[88px]">
          <Reveal>
            <Painting
              src="/site/painted-together-after-rain.jpg"
              alt={t.experiences.imageAlt}
              priority
              sizes="(max-width: 1400px) 90vw, 1260px"
              className="mb-11 max-w-[72rem]"
            />
          </Reveal>
          <Reveal>
            <h1
              className="max-w-[20ch] text-ink"
              style={{
                fontSize: 'var(--text-headline-lg)',
                fontWeight: 'var(--text-headline-lg--font-weight)',
                lineHeight: 'var(--text-headline-lg--line-height)',
                letterSpacing: 'var(--text-headline-lg--letter-spacing)',
              }}
            >
              {t.experiences.title}
            </h1>
            <p
              className="mt-4 max-w-[58ch] text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {t.experiences.intro}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Filter + cards (or the honest empty state). */}
      <section className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
        <div className="pb-16">
          <Reveal>
            <ExperienceFilter
              books={filterBooks}
              active={activeBook}
              locale={activeLocale}
              t={t}
            />
          </Reveal>

          {/* Live count for screen readers and as a quiet visible fact. */}
          <p className="type-mono-meta mt-6" aria-live="polite">
            {countLabel}
          </p>

          <h2 className="sr-only">{t.experiences.listHeading}</h2>
          {count > 0 ? (
            <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((exp, i) => (
                <Reveal key={exp.id} as="li" index={Math.min(i, 7)}>
                  <ExperienceCard exp={exp} locale={activeLocale} t={t} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState book={activeTitle} locale={activeLocale} t={t} />
          )}
        </div>
      </section>

      {/* Share what happened. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[42rem]">
            <ExperienceSubmit books={books} t={t} />
          </Reveal>
        </div>
      </section>
    </>
  )
}

/** One anonymous experience card: which book, the text, a coarse month. */
function ExperienceCard({
  exp,
  locale,
  t,
}: {
  exp: Experience
  locale: Locale
  t: Messages
}) {
  const book = getBook(exp.bookSlug)
  return (
    <figure className="flex h-full flex-col rounded-lg border border-hairline bg-canvas p-7">
      {book ? (
        <Link
          to={localePath(locale, `/books/${book.slug}`)}
          className="type-label-caps text-ink-secondary no-underline transition-colors duration-150 hover:text-ink"
        >
          {format(t.experiences.aboutBook, { book: book.title })}
        </Link>
      ) : null}
      <blockquote
        className="mt-4 flex-1 text-ink"
        style={{
          fontSize: 'var(--text-body-md)',
          lineHeight: 'var(--text-body-md--line-height)',
        }}
      >
        {exp.text}
      </blockquote>
      <figcaption className="type-mono-meta mt-5">{exp.month}</figcaption>
    </figure>
  )
}

/** Honest empty state for a filtered book with no experiences yet. */
function EmptyState({
  book,
  locale,
  t,
}: {
  book: string
  locale: Locale
  t: Messages
}) {
  return (
    <div className="mt-8 max-w-[46rem] rounded-lg border border-hairline bg-surface p-10 md:p-12">
      <p
        className="max-w-[48ch] text-ink"
        style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
      >
        {book
          ? format(t.experiences.emptyFiltered, { book })
          : t.experiences.empty}
      </p>
      <Link
        to={localePath(locale, '/experiences')}
        search={{}}
        className="mt-5 inline-block type-ui-sm font-medium text-ink underline underline-offset-[3px] decoration-1 transition-opacity duration-150 hover:opacity-70"
      >
        {t.experiences.clearFilter}
      </Link>
    </div>
  )
}
