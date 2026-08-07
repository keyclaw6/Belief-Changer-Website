import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { ShelfStage } from '~/components/ShelfStage'
import { HeroAsk } from '~/components/HeroAsk'

/**
 * Hero: asymmetric split (DESIGN.md Layout §Hero). Text column left
 * (left-aligned): headline (2 lines), subtext (under 20 words), ask input +
 * the single ink primary button. Asset right: the ShelfStage cover row. No
 * centered manifesto. Copy is the canonical deck verbatim.
 *
 * The text sits on the white canvas; the shelf is the only color. Grid is
 * 1.05fr / 0.95fr per the rendered reference, collapsing to a single column
 * (shelf above copy would bury the CTA, so copy stays first) under md.
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
  return (
    <header className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      <div className="grid items-center gap-11 pb-16 pt-14 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:pb-[72px] md:pt-[88px]">
        {/* Text column */}
        <div className="max-w-[34ch]">
          <h1
            className="text-ink"
            style={{
              fontSize: 'clamp(34px, 4.4vw, 58px)',
              fontWeight: 'var(--text-display-xl--font-weight)',
              lineHeight: 'var(--text-display-xl--line-height)',
              letterSpacing: 'var(--text-display-xl--letter-spacing)',
            }}
          >
            {t.home.heroHeadline}
          </h1>
          <p
            className="mt-4 max-w-[44ch] text-ink-secondary"
            style={{
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--text-body-lg--line-height)',
            }}
          >
            {t.home.heroSubtext}
          </p>
          <div className="mt-7 max-w-[30rem]">
            <HeroAsk
              locale={locale}
              placeholder={t.home.askPlaceholder}
              submitLabel={t.home.primaryCta}
              fieldLabel={t.home.askFieldLabel}
            />
          </div>
        </div>

        {/* Asset column: the shelf. Reserves height so first paint is steady. */}
        <div className="h-[260px] sm:h-[300px] md:h-[340px]">
          <ShelfStage books={shelfBooks} locale={locale} />
        </div>
      </div>
    </header>
  )
}
