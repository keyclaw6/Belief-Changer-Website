import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { PagePlaceholder } from '~/components/PagePlaceholder'

// Milestone 1 stub. Milestone 3 builds the full Library (finder + grid).
export const Route = createFileRoute('/$locale/books/')({
  component: LibraryStub,
})

function LibraryStub() {
  const { locale } = useParams({ from: '/$locale/books/' })
  const t = getMessages(locale as Locale)
  return (
    <PagePlaceholder
      eyebrow={t.nav.library}
      title={t.library.title}
      note={t.library.intro}
    />
  )
}
