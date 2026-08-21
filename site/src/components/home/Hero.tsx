import { Link } from '@tanstack/react-router'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { ShelfStage } from '~/components/ShelfStage'
import { HeroAsk } from '~/components/HeroAsk'

/**
 * Hero (beat 0): stacked Quiet Editorial composition —
 *   1. Full-bleed Orbit stage (below the site nav)
 *   2. Headline + finder band on the white canvas
 *
 * The shelf is The Orbit (iframe) when motion/WebGL allow; otherwise the static
 * cover row. Copy stays below the stage so the CTA is never buried under the
 * 3D asset on mobile. Trust strip and later beats follow unchanged.
 */
export function Hero({
  locale,
  t,
  shelfBooks,
}: {
  locale: Locale
  t: Messages
  shelfBooks: Book[]
}) {
  const examples: Array<{ label: string; q?: string }> = [
    { label: t.home.exampleScrolling, q: 'scrolling' },
    { label: t.home.exampleSugar, q: 'sugar' },
    { label: t.home.exampleSmoking, q: 'smoking' },
    { label: t.home.exampleOverthinking, q: 'overthinking' },
    { label: t.home.exampleAlcohol, q: 'alcohol' },
    { label: t.home.exampleMore },
  ]

  return (
    <header className="w-full">
      {/* Full-viewport-width Orbit stage: real space for the ring. */}
      <div className="h-[70dvh] min-h-[280px] w-full bg-canvas md:h-[calc(100dvh-var(--nav-height))]">
        <ShelfStage books={shelfBooks} locale={locale} />
      </div>

      {/* Finder band below the stage */}
      <div
        id="hero-finder"
        className="mx-auto w-full max-w-[var(--page-max)] scroll-mt-[calc(var(--nav-height)+12px)] px-[5vw] pb-16 pt-12 md:pt-16"
      >
        <div className="max-w-[36ch]">
          <h1
            className="text-ink"
            style={{
              fontSize: 'clamp(32px, 3.4vw, 46px)',
              fontWeight: 'var(--text-display-xl--font-weight)',
              lineHeight: 1.12,
              letterSpacing: 'var(--text-display-xl--letter-spacing)',
            }}
          >
            {t.home.heroHeadline}
          </h1>
          <p
            className="mt-5 max-w-[42ch] text-ink-secondary"
            style={{
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--text-body-lg--line-height)',
            }}
          >
            {t.home.heroSubtext}
          </p>
          <div className="mt-7 w-full max-w-[34rem]">
            <HeroAsk
              locale={locale}
              placeholder={t.home.askPlaceholder}
              submitLabel={t.home.primaryCta}
              fieldLabel={t.home.askFieldLabel}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="sr-only">{t.home.examplesLabel}</span>
            {examples.map((ex) => (
              <Link
                key={ex.label}
                to={localePath(locale, '/books')}
                search={ex.q ? { q: ex.q } : {}}
                className="type-ui-sm text-ink-secondary underline decoration-1 underline-offset-[3px] transition-opacity duration-150 hover:opacity-70"
              >
                {ex.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
