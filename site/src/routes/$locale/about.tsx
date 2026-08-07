import { useEffect } from 'react'
import { Link, createFileRoute, useParams } from '@tanstack/react-router'
import { ArrowUpRight } from '@phosphor-icons/react'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates, localePath } from '~/i18n/routing'
import type { Messages } from '~/i18n'
import { track } from '~/lib/measure'
import { Painting } from '~/components/Painting'
import { Reveal } from '~/components/Reveal'
import { inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * About (copy deck 09-about): who is behind this and what it stands for. A Quiet
 * Fact page: the open-window PHOTOGRAPH is the structural image and no paintings
 * appear (one voice per section). The header carries the conviction as a lead
 * line; then the story, the five laws as a hairline-divided list, the honesty
 * note as a bordered block, and a foot with the three cross-links.
 *
 * Layout families, all distinct: an image-anchored header, a prose block, a
 * definition list, a bordered statement, and a foot link row. Eyebrow count: 0.
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
    { term: t.about.lawEveryLanguageTitle, gloss: t.about.lawEveryLanguageBody },
    { term: t.about.lawWarmTitle, gloss: t.about.lawWarmBody },
    { term: t.about.lawLivingTitle, gloss: t.about.lawLivingBody },
  ]

  return (
    <>
      {/* Header, anchored by the open-window photograph (Quiet Fact voice). */}
      <section className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
        <div className="pb-12 pt-14 md:pt-[88px]">
          <Reveal>
            <Painting
              src="/site/photo-open-window.jpg"
              alt={t.about.imageAlt}
              priority
              sizes="(max-width: 1400px) 90vw, 1260px"
              className="max-w-[72rem]"
            />
          </Reveal>
          <Reveal className="mt-11 max-w-[54ch]">
            <div>
              <h1
                className="text-ink"
                style={{
                  fontSize: 'var(--text-headline-lg)',
                  fontWeight: 'var(--text-headline-lg--font-weight)',
                  lineHeight: 'var(--text-headline-lg--line-height)',
                  letterSpacing: 'var(--text-headline-lg--letter-spacing)',
                }}
              >
                {t.about.title}
              </h1>
              <p
                className="mt-5 text-ink-secondary"
                style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
              >
                {t.about.headerBody}
              </p>
              <p
                className="mt-3 text-ink"
                style={{ fontSize: 'var(--text-body-lg)', fontWeight: 500, lineHeight: 'var(--text-body-lg--line-height)' }}
              >
                {t.about.headerConviction}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The story (band), a reading column. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[65ch]">
            <div>
              <h2
                className="text-ink"
                style={{
                  fontSize: 'var(--text-headline-md)',
                  fontWeight: 'var(--text-headline-md--font-weight)',
                  lineHeight: 'var(--text-headline-md--line-height)',
                }}
              >
                {t.about.missionHeading}
              </h2>
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
            </div>
          </Reveal>
        </div>
      </section>

      {/* The laws (canvas), a quiet hairline-divided list. */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal>
            <h2
              className="text-ink"
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
                    'grid gap-1 py-6 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-8' +
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

      {/* The honesty note (band), one bordered statement block. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[46rem] rounded-lg border border-hairline bg-canvas p-9 md:p-11">
            <div>
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
            </div>
          </Reveal>
        </div>
      </section>

      {/* Foot (canvas): built in the open, three cross-links. */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[54ch]">
            <div>
              <p
                className="text-ink"
                style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
              >
                {t.about.footLead}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <FootLink external t={t} label={t.about.openSourceLink} />
                <Link to={localePath(activeLocale, '/contribute')} className={inkLink}>
                  {t.about.contributeLink}
                </Link>
                <Link to={localePath(activeLocale, '/privacy')} className={inkLink}>
                  {t.about.privacyLink}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}

function FootLink({ label, external }: { label: string; external?: boolean; t: Messages }) {
  if (!external) return null
  return (
    <a
      href="https://github.com/belief-changer"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(inkLink, 'inline-flex items-center gap-1.5')}
    >
      {label}
      <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
    </a>
  )
}
