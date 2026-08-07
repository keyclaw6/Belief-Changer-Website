import { useEffect } from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { ArrowUpRight } from '@phosphor-icons/react'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import type { Messages } from '~/i18n'
import { track } from '~/lib/measure'
import { Reveal } from '~/components/Reveal'

/**
 * About (M4): mission, the laws, the honesty note, the open-source note
 * (SITE-PLAN sitemap + measurement contract). This is a Quiet Fact page: the
 * open-window PHOTOGRAPH is the structural image and no paintings appear (one
 * voice per section, imagery law). The honesty note states the aggregate
 * counting approach in plain words, verbatim in spirit with the measurement
 * contract.
 *
 * Layout families, all distinct: an image-anchored mission header, a
 * hairline-divided definition list for the laws (not five equal cards), a
 * single quiet statement block for the honesty note, and an open-source note
 * with an outbound link. Eyebrow count: zero.
 */
export const Route = createFileRoute('/$locale/about')({
  head: () => ({
    links: hreflangAlternates('/about').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: AboutPage,
})

function AboutPage() {
  const { locale } = useParams({ from: '/$locale/about' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)

  useEffect(() => {
    track('page_view', { routeClass: 'about', locale: activeLocale })
  }, [activeLocale])

  const laws: Array<{ term: string; gloss: string }> = [
    { term: t.about.lawFreeTitle, gloss: t.about.lawFreeBody },
    { term: t.about.lawNoSignupTitle, gloss: t.about.lawNoSignupBody },
    { term: t.about.lawNoTrackingTitle, gloss: t.about.lawNoTrackingBody },
    { term: t.about.lawEveryLanguageTitle, gloss: t.about.lawEveryLanguageBody },
    { term: t.about.lawLivingTitle, gloss: t.about.lawLivingBody },
  ]

  return (
    <>
      {/* Mission, anchored by the open-window photograph (Quiet Fact voice). */}
      <section className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
        <div className="grid gap-10 pb-16 pt-14 md:grid-cols-[1fr_minmax(0,420px)] md:items-center md:gap-16 md:pt-[88px]">
          <Reveal className="max-w-[54ch] md:order-1">
            <h1
              className="text-ink"
              style={{
                fontSize: 'var(--text-headline-lg)',
                fontWeight: 'var(--text-headline-lg--font-weight)',
                lineHeight: 'var(--text-headline-lg--line-height)',
                letterSpacing: 'var(--text-headline-lg--letter-spacing)',
              }}
            >
              {t.about.missionHeading}
            </h1>
            <p
              className="mt-5 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {t.about.missionBody1}
            </p>
            <p
              className="mt-4 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {t.about.missionBody2}
            </p>
          </Reveal>
          <Reveal className="md:order-2">
            <div className="h-64 w-full overflow-hidden rounded-lg sm:h-80 md:h-[26rem]">
              <img
                src="/site/photo-open-window.jpg"
                alt={t.about.imageAlt}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover object-center ring-1 ring-[var(--color-hairline-on-image)]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* The laws, as a quiet hairline-divided list on a band. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal>
            <h2
              className="max-w-[22ch] text-ink"
              style={{
                fontSize: 'var(--text-headline-md)',
                fontWeight: 'var(--text-headline-md--font-weight)',
                lineHeight: 'var(--text-headline-md--line-height)',
              }}
            >
              {t.about.lawsHeading}
            </h2>
          </Reveal>
          <Reveal className="mt-8 max-w-[64rem]">
            <dl className="grid">
              {laws.map((law, i) => (
                <div
                  key={law.term}
                  className={
                    'grid gap-1 py-6 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-8' +
                    (i > 0 ? ' border-t border-hairline' : '')
                  }
                >
                  <dt className="text-ink" style={{ fontSize: 'var(--text-body-lg)', fontWeight: 600 }}>
                    {law.term}
                  </dt>
                  <dd
                    className="max-w-[54ch] text-ink-secondary"
                    style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
                  >
                    {law.gloss}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* The honesty note: one quiet statement block on canvas. */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[46rem] rounded-lg border border-hairline bg-surface p-9 md:p-11">
            <h2
              className="text-ink"
              style={{
                fontSize: 'var(--text-headline-md)',
                fontWeight: 'var(--text-headline-md--font-weight)',
                lineHeight: 'var(--text-headline-md--line-height)',
              }}
            >
              {t.about.honestyHeading}
            </h2>
            <p
              className="mt-4 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {t.about.honestyBody}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Open-source note on a band, with an outbound link. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[54ch]">
            <h2
              className="text-ink"
              style={{
                fontSize: 'var(--text-headline-md)',
                fontWeight: 'var(--text-headline-md--font-weight)',
                lineHeight: 'var(--text-headline-md--line-height)',
              }}
            >
              {t.about.openSourceHeading}
            </h2>
            <p
              className="mt-4 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {t.about.openSourceBody}
            </p>
            <OpenSourceLink t={t} />
          </Reveal>
        </div>
      </section>
    </>
  )
}

function OpenSourceLink({ t }: { t: Messages }) {
  return (
    <a
      href="https://github.com/belief-changer"
      target="_blank"
      rel="noreferrer"
      className="mt-5 inline-flex items-center gap-1.5 type-ui-sm font-medium text-ink underline underline-offset-[3px] decoration-1 transition-opacity duration-150 hover:opacity-70"
    >
      {t.about.openSourceLink}
      <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
    </a>
  )
}
