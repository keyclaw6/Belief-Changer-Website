import { Link } from '@tanstack/react-router'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { ShelfStage } from '~/components/ShelfStage'
import { HeroAsk } from '~/components/HeroAsk'

/**
 * Hero (beat 0): the words on the left, the shelf stage on the right, on the
 * white canvas at full viewport height. The pull-cord hangs top-right (rendered
 * by the shell). Below the finder, quiet tappable examples; a down-arrow rests
 * near the bottom center. Copy is the deck verbatim; the hero keeps the word
 * "trap" (its one earned place).
 *
 * The shelf is today a static row of titled covers with hologram hover; later
 * the 3D shelf. Copy stays first in the DOM so the CTA is never buried under the
 * asset on mobile. Still, at scale: no side entries, generous whitespace.
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
  // The tappable examples: each seeds the library finder with the word. "more"
  // simply opens the full library.
  const examples: Array<{ label: string; q?: string }> = [
    { label: t.home.exampleScrolling, q: 'scrolling' },
    { label: t.home.exampleSugar, q: 'sugar' },
    { label: t.home.exampleSmoking, q: 'smoking' },
    { label: t.home.exampleOverthinking, q: 'overthinking' },
    { label: t.home.exampleAlcohol, q: 'alcohol' },
    { label: t.home.exampleMore },
  ]

  return (
    <header className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      <div className="grid min-h-[calc(100dvh-var(--nav-height))] items-center gap-11 pb-16 pt-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
        {/* Text column */}
        <div className="max-w-[30ch]">
          <h1
            className="text-ink"
            style={{
              // Scaled so the long editorial headline settles to ~3 lines at
              // desktop rather than towering; still large and calm.
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

          {/* Quiet tappable examples. Middle dots are metadata-only, so these
              are laid out as wrapping links with whitespace, not a dot chain. */}
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

        {/* Asset column: the shelf. Reserves height so first paint is steady. */}
        <div className="h-[280px] sm:h-[340px] md:h-[400px]">
          <ShelfStage books={shelfBooks} locale={locale} />
        </div>
      </div>
    </header>
  )
}
