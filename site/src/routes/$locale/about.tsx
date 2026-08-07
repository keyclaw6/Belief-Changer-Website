import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { PagePlaceholder } from '~/components/PagePlaceholder'

// Milestone 1 stub. Milestone 4 builds the full About page (mission, the laws,
// the honesty note about aggregate counting, open source).
export const Route = createFileRoute('/$locale/about')({
  component: AboutStub,
})

function AboutStub() {
  const { locale } = useParams({ from: '/$locale/about' })
  const t = getMessages(locale as Locale)
  return (
    <PagePlaceholder
      eyebrow={t.footer.about}
      title={t.about.title}
      note={t.home.reframe.sentence1}
    />
  )
}
