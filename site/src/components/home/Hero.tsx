import { useState } from 'react'
import './hero.css'
import { Link } from '@tanstack/react-router'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { ShelfStage } from '~/components/ShelfStage'
import { HeroAsk } from '~/components/HeroAsk'

/** Atmospheric hero: server-rendered headline above the live orbit, with the
 * finder below. Reading mode fades the headline without shifting layout.
 * The static linked shelf remains the no-WebGL/reduced-motion enhancement base.
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
  const [inspecting, setInspecting] = useState(false)
  const copy = {
    en: ['A little clarity.', 'A different life.', 'Free books for the beliefs that hold you back.', 'THE BELIEF CHANGER LIBRARY'],
    da: ['Lidt mere klarhed.', 'Et anderledes liv.', 'Gratis bøger om de overbevisninger, der holder dig tilbage.', 'BELIEF CHANGER BIBLIOTEKET'],
    ar: ['قليل من الوضوح.', 'حياة مختلفة.', 'كتب مجانية عن المعتقدات التي تعيقك.', 'مكتبة BELIEF CHANGER'],
  }[locale]
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
      <div className="atmospheric-hero" data-inspecting={inspecting}>
        <div className="atmospheric-hero__heading" aria-hidden={inspecting}>
          <p className="atmospheric-hero__eyebrow">{copy[3]}</p>
          <h1><span>{copy[0]}</span>{' '}<span>{copy[1]}</span></h1>
          <p className="atmospheric-hero__subtitle">{copy[2]}</p>
        </div>
        <ShelfStage books={shelfBooks} locale={locale} onInspectChange={setInspecting} />
      </div>

      {/* Finder band below the stage */}
      <div
        id="hero-finder"
        className="mx-auto w-full max-w-[var(--page-max)] scroll-mt-[calc(var(--nav-height)+12px)] px-[5vw] pb-16 pt-12 md:pt-16"
      >
        <div className="max-w-[36ch]">
          <h2
            className="text-ink"
            style={{
              fontSize: 'clamp(32px, 3.4vw, 46px)',
              fontWeight: 'var(--text-display-xl--font-weight)',
              lineHeight: 1.12,
              letterSpacing: 'var(--text-display-xl--letter-spacing)',
            }}
          >
            {t.home.heroHeadline}
          </h2>
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
