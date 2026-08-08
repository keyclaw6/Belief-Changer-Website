import {
  Outlet,
  createFileRoute,
  notFound,
  useParams,
} from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { isLocale, type Locale } from '~/i18n/config'
import { LocaleShell } from '~/components/LocaleShell'

/**
 * Locale layout route: /{locale}. Validates the locale segment (unknown locales
 * 404 rather than silently falling back), then renders the persistent shell
 * (nav + footer) around the page Outlet. Each leaf route owns its path-specific
 * hreflang alternates.
 */
export const Route = createFileRoute('/$locale')({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.locale)) {
      throw notFound()
    }
    return { locale: params.locale as Locale }
  },
  component: LocaleLayout,
})

function LocaleLayout() {
  const { locale } = useParams({ from: '/$locale' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)

  return (
    <LocaleShell locale={activeLocale} t={t}>
      <Outlet />
    </LocaleShell>
  )
}
