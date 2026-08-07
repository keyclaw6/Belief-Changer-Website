import { useEffect } from 'react'
import { Link, createFileRoute, notFound, useParams } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import { getMessages, format } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates, localePath } from '~/i18n/routing'
import { getBook, experiences as allExperiences } from '~/data'
import { track } from '~/lib/measure'
import { BookCover } from '~/components/BookCover'
import { Hologram } from '~/components/Hologram'
import { StatusTag } from '~/components/StatusTag'
import { BookActions } from '~/components/book/BookActions'
import { BookTabs } from '~/components/book/BookTabs'
import { ImproveForm } from '~/components/book/ImproveForm'
import { BookExperiences } from '~/components/book/BookExperiences'
import { Reveal } from '~/components/Reveal'
import { inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * Book page (M3): the book's home. An asymmetric masthead (cover left, title +
 * promise + version block + actions right) on the white canvas, then the
 * living-book tabs (About / Changelog) on a band, then the improve form on
 * canvas, the experiences excerpt on a band, and a quiet how-it-works
 * cross-link. Zoning alternates canvas and band, so no section dividers are
 * needed between them.
 *
 * The slug is validated in beforeLoad so unknown books 404. read_start is
 * tracked in the reader (reading starts there); download is tracked from the
 * actions. There is no attribution anywhere on the page, ever.
 */
export const Route = createFileRoute('/$locale/books/$slug')({
  beforeLoad: ({ params }) => {
    if (!getBook(params.slug)) throw notFound()
  },
  head: ({ params }) => {
    const book = getBook(params.slug)
    return {
      meta: book
        ? [
            { title: `${book.title} · Belief Changer` },
            { name: 'description', content: book.promise },
          ]
        : [],
      links: hreflangAlternates(`/books/${params.slug}`).map((a) => ({
        rel: 'alternate',
        hrefLang: a.hrefLang,
        href: a.href,
      })),
    }
  },
  component: BookPage,
})

function BookPage() {
  const { locale, slug } = useParams({ from: '/$locale/books/$slug' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)
  const book = getBook(slug)

  useEffect(() => {
    if (book) track('page_view', { routeClass: 'book', locale: activeLocale })
  }, [activeLocale, book])

  if (!book) return null

  const bookExperiences = allExperiences.filter((e) => e.bookSlug === book.slug)
  const hasVersion = book.version > 0

  return (
    <>
      {/* Masthead */}
      <section className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
        <div className="grid gap-10 pb-16 pt-12 md:grid-cols-[minmax(0,340px)_1fr] md:gap-16 md:pt-[72px]">
          {/* Cover: LARGE, titled, hologram hover (this slot later hosts the 3D
              book you can turn). Its ground is the identity. */}
          <Reveal className="mx-auto w-full max-w-[300px] md:mx-0 md:max-w-none">
            <Hologram>
              <BookCover book={book} priority sizes="(max-width: 768px) 70vw, 340px" />
            </Hologram>
          </Reveal>

          <Reveal className="max-w-[46ch]">
            <div className="flex items-center gap-3">
              <StatusTag status={book.status} t={t} />
            </div>
            <h1
              className="mt-4 text-ink"
              style={{
                fontSize: 'var(--text-headline-lg)',
                fontWeight: 'var(--text-headline-lg--font-weight)',
                lineHeight: 'var(--text-headline-lg--line-height)',
                letterSpacing: 'var(--text-headline-lg--letter-spacing)',
              }}
            >
              {book.title}
            </h1>
            <p
              className="mt-3 text-ink-secondary"
              style={{
                fontSize: 'var(--text-body-lg)',
                lineHeight: 'var(--text-body-lg--line-height)',
              }}
            >
              {book.promise}
            </p>

            <div className="mt-6">
              <BookActions book={book} locale={activeLocale} t={t} />
            </div>

            {/* Living-book version block: functional mono facts (copy deck:
                "Version 3 · 12 languages · Improved from reader contributions").
                Split across two mono lines so no line ever carries two dots. */}
            <div className="mt-7 space-y-1">
              {hasVersion ? (
                <>
                  <p className="type-mono-meta text-ink">
                    {format(
                      book.languages === 1
                        ? t.book.versionLanguagesOne
                        : t.book.versionLanguages,
                      { version: book.version, count: book.languages },
                    )}
                  </p>
                  <p className="type-mono-meta">{t.book.improvedFromContributions}</p>
                </>
              ) : (
                <p className="type-mono-meta">{t.book.notPublishedYet}</p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Living-book detail: About / Changelog tabs. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal>
            <h2 className="sr-only">{t.book.versionHeading}</h2>
            <div className="max-w-[68rem]">
              <BookTabs book={book} locale={activeLocale} t={t} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Improve this book. */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[42rem]">
            <ImproveForm slug={book.slug} t={t} />
          </Reveal>
        </div>
      </section>

      {/* Experiences for this book (or the honest empty state). */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[68rem]">
            <BookExperiences experiences={bookExperiences} locale={activeLocale} t={t} />
          </Reveal>
        </div>
      </section>

      {/* Cross-link foot: a lead line + the how-it-works link. Canvas, so it
          alternates with the band experiences section above it. */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <p
            className="text-ink"
            style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
          >
            {t.book.crosslinkLead}
          </p>
          <Link
            to={localePath(activeLocale, '/how-it-works')}
            className={cn(inkLink, 'mt-3 inline-flex items-center gap-1.5')}
          >
            {t.book.howItWorksCrosslink}
            <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
          </Link>
        </div>
      </section>
    </>
  )
}
