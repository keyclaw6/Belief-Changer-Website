import { createFileRoute, redirect } from '@tanstack/react-router'
import { DEFAULT_LOCALE } from '~/i18n/config'

/**
 * Root path "/". Every real page lives under /{locale}/, so the bare root
 * permanently redirects to the default locale home. A later milestone may
 * negotiate the locale from Accept-Language here; for now it is a stable,
 * SSR-safe redirect to /en/.
 */
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/$locale', params: { locale: DEFAULT_LOCALE } })
  },
})
