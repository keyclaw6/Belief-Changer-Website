/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useMatches,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { assetPath } from '~/lib/deployment'
import globalCss from '~/styles/globals.css?url'
import { themeInitScript } from '~/lib/theme'
import { ThemeProvider, useTheme } from '~/lib/theme-context'
import { DEFAULT_LOCALE, LOCALE_DIR, isLocale, type Locale } from '~/i18n/config'
import { DestinationPortal } from '~/components/DestinationPortal'
import { NotFound } from '~/components/NotFound'

/**
 * Root route. Owns the HTML document shell, the <head> (meta, title, the global
 * stylesheet, the no-flash theme init script), and the <html lang>/<dir>
 * attributes. lang and dir are derived from the active locale segment so the
 * document mirrors correctly under RTL from the very first server render.
 *
 * Theme: React owns it. ThemeProvider holds the choice; <html data-theme> is
 * rendered by React from that state (with suppressHydrationWarning, since the
 * init script sets the real value before hydration). This is the proper fix for
 * the v1 bug where React and a toggle button fought over the same attribute.
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Belief Changer' },
      {
        name: 'description',
        content:
          'Free books that change the belief behind the behavior. In your language, free forever, no signup, no catch.',
      },
      { name: 'color-scheme', content: 'light dark' },
      ...(import.meta.env.PREVIEW_STATIC ? [{ name: 'robots', content: 'noindex,nofollow' }] : []),
    ],
    links: [
      // Global stylesheet: tokens, Tailwind layers, self-hosted @font-face.
      { rel: 'stylesheet', href: globalCss },
      // Preload the primary Latin face to steady first paint. DM Sans ships as
      // one variable woff2 shared across weights (see scripts/fetch-fonts.mjs),
      // so a single preload covers 400/500/600.
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: assetPath('/fonts/dmsans-400-normal-latin.woff2'),
        crossOrigin: 'anonymous',
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  // Derive the active locale from the first path segment so <html lang>/<dir>
  // are correct on the server. Falls back to the default locale off-tree.
  const matches = useMatches()
  const params = (matches[matches.length - 1]?.params ?? {}) as {
    locale?: string
  }
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
  const dir = LOCALE_DIR[locale]

  return (
    <ThemeProvider>
      <HtmlShell locale={locale} dir={dir}>
        {children}
      </HtmlShell>
    </ThemeProvider>
  )
}

/**
 * HtmlShell consumes the theme context so React renders data-theme on <html>.
 * suppressHydrationWarning tolerates the difference between the server render
 * ("system") and whatever the init script painted before hydration.
 */
function HtmlShell({
  locale,
  dir,
  children,
}: {
  locale: Locale
  dir: 'ltr' | 'rtl'
  children: ReactNode
}) {
  const { attr } = useTheme()
  return (
    <html lang={locale} dir={dir} data-theme={attr} suppressHydrationWarning>
      <head>
        {/* No-flash theme: set data-theme before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <DestinationPortal />
        <Scripts />
      </body>
    </html>
  )
}
