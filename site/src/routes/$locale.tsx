import {
  Outlet,
  createFileRoute,
  notFound,
  useParams,
} from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { hreflangAlternates } from '~/i18n/routing'
import { isLocale, type Locale } from '~/i18n/config'
import { LocaleShell } from '~/components/LocaleShell'

/**
 * Locale layout route: /{locale}. Validates the locale segment (unknown locales
 * 404 rather than silently falling back), then renders the persistent shell
 * (nav + footer) around the page Outlet. hreflang alternates for the locale
 * root are emitted here; child routes extend head with their own path-specific
 * alternates in later milestones.
 */
export const Route = createFileRoute('/$locale')({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.locale)) {
      throw notFound()
    }
    return { locale: params.locale as Locale }
  },
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : undefined
    if (!locale) return {}
    // Path-relative hrefs in dev; a production origin is wired in a later pass.
    const alternates = hreflangAlternates('/')
    return {
      links: alternates.map((a) => ({
        rel: 'alternate',
        hrefLang: a.hrefLang,
        href: a.href,
      })),
    }
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
