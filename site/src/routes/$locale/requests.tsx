import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { PagePlaceholder } from '~/components/PagePlaceholder'

// Milestone 1 stub. Milestone 4 builds the ranked request board + vote flow.
export const Route = createFileRoute('/$locale/requests')({
  component: RequestsStub,
})

function RequestsStub() {
  const { locale } = useParams({ from: '/$locale/requests' })
  const t = getMessages(locale as Locale)
  return (
    <PagePlaceholder
      eyebrow={t.footer.requestABook}
      title={t.requests.title}
      note={t.requests.intro}
    />
  )
}
