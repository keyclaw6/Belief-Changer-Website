import { useEffect } from 'react'
import { Link, createFileRoute, useParams } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates, localePath } from '~/i18n/routing'
import type { Messages } from '~/i18n'
import { track } from '~/lib/measure'
import { Reveal } from '~/components/Reveal'
import { btnPrimary, inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * How it works (M4): the method page (SITE-PLAN sitemap). This carries the
 * site's deepest copy, written plainly and warmly: the happiest-option
 * principle, the trap as a belief that lies about the math, knowledge felt in
 * the heart, no willpower and no shame, escape not sacrifice. The method is
 * described, never name-dropped (the words "Easyway", "Allen Carr", "Freedom
 * Model" never appear).
 *
 * The riverside-glide painting anchors the hero as its single voice (imagery
 * manifest; also home beat 3). No photography on this painting-voice page.
 *
 * Layout families, all distinct (≥3): an asymmetric image+text hero, a
 * full-width lead statement, a bordered principle panel, a hairline-divided
 * numbered reading sequence, and a closing cross-link block. Eyebrow count:
 * zero (the headlines carry the structure).
 */
export const Route = createFileRoute('/$locale/how-it-works')({
  head: () => ({
    meta: [{ title: 'How belief change works · Belief Changer' }],
    links: hreflangAlternates('/how-it-works').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: HowItWorksPage,
})

function HowItWorksPage() {
  const { locale } = useParams({ from: '/$locale/how-it-works' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)

  useEffect(() => {
    track('page_view', { routeClass: 'how-it-works', locale: activeLocale })
  }, [activeLocale])

  // The reading sequence after the first two principles: felt in the heart,
  // no willpower, escape. A numbered sequence with sparse dividers.
  const sequence: Array<{ heading: string; body: string }> = [
    { heading: t.howItWorks.knownHeading, body: t.howItWorks.knownBody },
    { heading: t.howItWorks.noWillpowerHeading, body: t.howItWorks.noWillpowerBody },
    { heading: t.howItWorks.escapeHeading, body: t.howItWorks.escapeBody },
  ]

  return (
    <>
      {/* Hero: asymmetric split with the riverside-glide painting. */}
      <section className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
        <div className="grid gap-10 pb-16 pt-14 md:grid-cols-[1fr_minmax(0,440px)] md:items-center md:gap-16 md:pt-[88px]">
          <Reveal className="max-w-[46ch]">
            <h1
              className="text-ink"
              style={{
                fontSize: 'var(--text-headline-lg)',
                fontWeight: 'var(--text-headline-lg--font-weight)',
                lineHeight: 'var(--text-headline-lg--line-height)',
                letterSpacing: 'var(--text-headline-lg--letter-spacing)',
              }}
            >
              {t.howItWorks.title}
            </h1>
            <p
              className="mt-5 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {t.howItWorks.lede}
            </p>
          </Reveal>
          <Reveal>
            <div className="h-60 w-full overflow-hidden rounded-lg sm:h-72 md:h-[24rem]">
              <img
                src="/site/painted-riverside-glide.jpg"
                alt={t.howItWorks.heroImageAlt}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover object-center ring-1 ring-[var(--color-hairline-on-image)]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Principle one: the happiest-option principle, as a full-width lead. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[52rem]">
            <h2
              className="max-w-[20ch] text-ink"
              style={{
                fontSize: 'var(--text-headline-md)',
                fontWeight: 'var(--text-headline-md--font-weight)',
                lineHeight: 'var(--text-headline-md--line-height)',
              }}
            >
              {t.howItWorks.principleHeading}
            </h2>
            <p
              className="mt-5 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {t.howItWorks.principleBody}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Principle two: the trap lies about the math, in a bordered panel. */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[46rem] rounded-lg border border-hairline p-9 md:p-11">
            <h2
              className="max-w-[24ch] text-ink"
              style={{
                fontSize: 'var(--text-headline-md)',
                fontWeight: 'var(--text-headline-md--font-weight)',
                lineHeight: 'var(--text-headline-md--line-height)',
              }}
            >
              {t.howItWorks.trapHeading}
            </h2>
            <p
              className="mt-4 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {t.howItWorks.trapBody}
            </p>
          </Reveal>
        </div>
      </section>

      {/* The rest of the method: a numbered reading sequence, sparse dividers. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <ol className="max-w-[62rem]">
            {sequence.map((item, i) => (
              <Reveal key={item.heading} as="li" index={Math.min(i, 7)}>
                <div
                  className={
                    'grid gap-x-6 gap-y-3 py-8 md:grid-cols-[auto_1fr] md:py-10' +
                    (i > 0 ? ' border-t border-hairline' : '')
                  }
                >
                  <span className="type-mono-meta pt-1 tabular-nums" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="max-w-[54ch]">
                    <h3
                      className="text-ink"
                      style={{
                        fontSize: 'var(--text-headline-md)',
                        fontWeight: 'var(--text-headline-md--font-weight)',
                        lineHeight: 'var(--text-headline-md--line-height)',
                      }}
                    >
                      {item.heading}
                    </h3>
                    <p
                      className="mt-3 text-ink-secondary"
                      style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
                    >
                      {item.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing cross-links to the library and the request board. */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[46ch]">
            <h2
              className="text-ink"
              style={{
                fontSize: 'var(--text-headline-md)',
                fontWeight: 'var(--text-headline-md--font-weight)',
                lineHeight: 'var(--text-headline-md--line-height)',
              }}
            >
              {t.howItWorks.closingHeading}
            </h2>
            <p
              className="mt-4 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {t.howItWorks.closingBody}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link to={localePath(activeLocale, '/books')} className={btnPrimary}>
                {t.howItWorks.ctaLibrary}
              </Link>
              <Link
                to={localePath(activeLocale, '/requests')}
                className={cn(inkLink, 'inline-flex items-center gap-1.5')}
              >
                {t.howItWorks.ctaRequests}
                <ArrowRight size={15} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
