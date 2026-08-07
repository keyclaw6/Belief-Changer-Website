import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { PagePlaceholder } from '~/components/PagePlaceholder'

// Milestone 1 stub. Milestone 3 builds the full How-it-works page.
export const Route = createFileRoute('/$locale/how-it-works')({
  component: HowItWorksStub,
})

function HowItWorksStub() {
  const { locale } = useParams({ from: '/$locale/how-it-works' })
  const t = getMessages(locale as Locale)
  return (
    <PagePlaceholder
      eyebrow={t.nav.howItWorks}
      title={t.home.method.beat1Title}
      note={t.home.reframe.sentence3}
    />
  )
}
