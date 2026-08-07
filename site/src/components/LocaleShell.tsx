import type { ReactNode } from 'react'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { Nav } from './Nav'
import { Footer } from './Footer'

/**
 * LocaleShell: the persistent layout every localized page renders inside:
 * skip link, nav, the page's <main>, footer. The nav and footer receive the
 * active locale and resolved translator. Uses logical properties throughout so
 * the whole shell mirrors correctly under dir="rtl".
 */
export function LocaleShell({
  locale,
  t,
  children,
}: {
  locale: Locale
  t: Messages
  children: ReactNode
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      {/* Skip link: visually hidden until focused (keyboard a11y). */}
      <a
        href="#main"
        className="sr-only rounded-sm bg-action px-4 py-2 text-on-action focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[100]"
      >
        {t.nav.skipToContent}
      </a>

      <Nav locale={locale} t={t} />

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}
