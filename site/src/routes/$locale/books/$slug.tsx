import { createFileRoute, notFound, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { getBook } from '~/data'
import { PagePlaceholder } from '~/components/PagePlaceholder'

// Milestone 1 stub. Milestone 3 builds the full book page (actions, version
// block, changelog tab, improve form, experiences). Validates the slug now so
// unknown books 404 from the first commit.
export const Route = createFileRoute('/$locale/books/$slug')({
  beforeLoad: ({ params }) => {
    if (!getBook(params.slug)) throw notFound()
  },
  component: BookStub,
})

function BookStub() {
  const { locale, slug } = useParams({ from: '/$locale/books/$slug' })
  const t = getMessages(locale as Locale)
  const book = getBook(slug)
  return (
    <PagePlaceholder
      eyebrow={t.nav.library}
      title={book?.title ?? slug}
      note={book?.promise ?? ''}
    />
  )
}
