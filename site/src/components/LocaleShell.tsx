import type { ReactNode } from 'react'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { ThemeCord } from './ThemeCord'

/**
 * LocaleShell: the persistent layout every localized page renders inside:
 * the pull-cord (fixed to the viewport top-right, the theme switch), a skip
 * link, nav, the page's <main>, and the footer. Uses logical properties
 * throughout so the whole shell mirrors correctly under dir="rtl".
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
      {/* The pull-cord: hangs from the top of the viewport near the right edge,
          in front of the nav. It is the theme switch and the first thing a
          visitor plays with. */}
      <ThemeCord
        labelToDark={t.nav.lightsOff}
        labelToLight={t.nav.lightsOn}
      />

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
