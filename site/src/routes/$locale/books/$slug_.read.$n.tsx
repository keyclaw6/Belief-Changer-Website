import { createFileRoute, notFound, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { getBook } from '~/data'
import { Reader } from '~/components/reader/Reader'

/**
 * Reader route: /{locale}/books/{slug}/read/{n} (M3). SSR-renders the chapter
 * content from the sample-chapters fixture (scrolling / sugar have real prose;
 * every other book's chapters render a dignified "being written" state). The
 * Reader component owns comfort modes, reading position, and the read_start /
 * chapter_view events.
 *
 * The slug and chapter number are validated in beforeLoad: an unknown book or a
 * chapter number outside the book's chapter list 404s, so the reader never
 * renders an empty shell.
 */
export const Route = createFileRoute('/$locale/books/$slug_/read/$n')({
  beforeLoad: ({ params }) => {
    const book = getBook(params.slug)
    if (!book) throw notFound()
    const n = Number(params.n)
    if (!Number.isInteger(n) || !book.chapters.some((c) => c.n === n)) {
      throw notFound()
    }
  },
  head: ({ params }) => {
    const book = getBook(params.slug)
    const n = Number(params.n)
    const chapter = book?.chapters.find((c) => c.n === n)
    return {
      meta: book
        ? [{ title: `${chapter?.title ?? book.title} · ${book.title}` }]
        : [],
      links: hreflangAlternates(`/books/${params.slug}/read/${params.n}`).map(
        (a) => ({ rel: 'alternate', hrefLang: a.hrefLang, href: a.href }),
      ),
    }
  },
  component: ReaderPage,
})

function ReaderPage() {
  const { locale, slug, n } = useParams({
    from: '/$locale/books/$slug_/read/$n',
  })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)
  const book = getBook(slug)
  const chapter = book?.chapters.find((c) => c.n === Number(n))

  if (!book || !chapter) return null

  return <Reader book={book} chapter={chapter} locale={activeLocale} t={t} />
}
