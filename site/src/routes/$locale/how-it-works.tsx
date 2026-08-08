import { useEffect } from 'react'
import { Link, createFileRoute, useParams } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates, localePath } from '~/i18n/routing'
import type { Messages } from '~/i18n'
import { track } from '~/lib/measure'
import { Painting } from '~/components/Painting'
import { Reveal } from '~/components/Reveal'
import { btnPrimary, inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * How it works (v2): the method in full, the deep long-form essay (copy deck
 * 02-how-it-works, verbatim). A smart, skeptical reader should leave
 * understanding exactly why this works when what they tried did not. Scandinavian
 * register: direct, unhyped, educational. The method is described, never
 * name-dropped (no "Easyway", "Allen Carr", "Freedom Model").
 *
 * Structure: an opening, then eight chapters set as a reading column, with four
 * wide still paintings breaking the essay between chapters (clear choices, the
 * knot, the first morning, free books). Canvas and warm band alternate so the long read
 * has a quiet two-tone rhythm; the images run wide and still (never cropped).
 * A closing band carries the two cross-links. Eyebrow count: zero.
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

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="max-w-[24ch] text-ink"
      style={{
        fontSize: 'var(--text-headline-md)',
        fontWeight: 'var(--text-headline-md--font-weight)',
        lineHeight: 'var(--text-headline-md--line-height)',
      }}
    >
      {children}
    </h2>
  )
}

function Para({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <p
      className={cn(first ? 'mt-5' : 'mt-4', 'text-ink-secondary')}
      style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)', textWrap: 'pretty' }}
    >
      {children}
    </p>
  )
}

/** A chapter block: heading + body paragraphs, in a reading column. */
function Chapter({
  heading,
  paras,
}: {
  heading: string
  paras: string[]
}) {
  return (
    <Reveal className="mx-auto max-w-[65ch]">
      <div>
        <Heading>{heading}</Heading>
        {paras.map((p, i) => (
          <Para key={i} first={i === 0}>
            {p}
          </Para>
        ))}
      </div>
    </Reveal>
  )
}

/** A wide still painting breaking the essay, at true 3:2, never cropped. */
function EssayImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Reveal className="mx-auto max-w-[72rem]">
      <Painting src={src} alt={alt} sizes="(max-width: 1400px) 90vw, 1200px" />
    </Reveal>
  )
}

function HowItWorksPage() {
  const { locale } = useParams({ from: '/$locale/how-it-works' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)
  const h = t.howItWorks

  useEffect(() => {
    track('page_view', { routeClass: 'how-it-works', locale: activeLocale })
  }, [activeLocale])

  return (
    <>
      {/* Opening (canvas). */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] pb-[var(--spacing-section-y)] pt-14 md:pt-[88px]">
          <Reveal className="mx-auto max-w-[65ch]">
            <div>
              <h1
                className="text-ink"
                style={{
                  fontSize: 'var(--text-display-xl)',
                  fontWeight: 'var(--text-display-xl--font-weight)',
                  lineHeight: 'var(--text-display-xl--line-height)',
                  letterSpacing: 'var(--text-display-xl--letter-spacing)',
                }}
              >
                {h.title}
              </h1>
              <p
                className="mt-6 text-ink-secondary"
                style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
              >
                {h.lede}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Chapter 1 + clear choices (band). */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Chapter heading={h.ch1Heading} paras={[h.ch1Body1, h.ch1Body2, h.ch1Body3]} />
          <div className="mt-12">
            <EssayImage src="/site/painted-clear-choices.png" alt={h.ch1ImageAlt} />
          </div>
        </div>
      </section>

      {/* Chapter 2 (canvas). */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Chapter heading={h.ch2Heading} paras={[h.ch2Body1, h.ch2Body2, h.ch2Body3]} />
        </div>
      </section>

      {/* Chapter 3 + the knot (band). */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Chapter heading={h.ch3Heading} paras={[h.ch3Body1, h.ch3Body2]} />
          <div className="mt-12">
            <EssayImage src="/site/painted-knot.jpg" alt={h.ch3ImageAlt} />
          </div>
        </div>
      </section>

      {/* Chapter 4 (canvas). */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Chapter heading={h.ch4Heading} paras={[h.ch4Body1, h.ch4Body2, h.ch4Body3]} />
        </div>
      </section>

      {/* Chapter 5 (band). */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Chapter heading={h.ch5Heading} paras={[h.ch5Body1, h.ch5Body2, h.ch5Body3, h.ch5Body4]} />
        </div>
      </section>

      {/* Chapter 6 + the first morning (canvas). */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Chapter heading={h.ch6Heading} paras={[h.ch6Body1, h.ch6Body2]} />
          <div className="mt-12">
            <EssayImage src="/site/painted-first-morning.png" alt={h.ch6ImageAlt} />
          </div>
        </div>
      </section>

      {/* Chapter 7 (band). */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Chapter heading={h.ch7Heading} paras={[h.ch7Body1, h.ch7Body2, h.ch7Body3]} />
        </div>
      </section>

      {/* Chapter 8 + free books (canvas). */}
      <section className="bg-canvas">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Chapter heading={h.ch8Heading} paras={[h.ch8Body1, h.ch8Body2]} />
          <div className="mt-12">
            <EssayImage src="/site/painted-free-book-cabinet.png" alt={h.ch8ImageAlt} />
          </div>
        </div>
      </section>

      {/* Closing (band): the two cross-links. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="mx-auto max-w-[65ch]">
            <div>
              <h2
                className="text-ink"
                style={{
                  fontSize: 'var(--text-headline-lg)',
                  fontWeight: 'var(--text-headline-lg--font-weight)',
                  lineHeight: 'var(--text-headline-lg--line-height)',
                  letterSpacing: 'var(--text-headline-lg--letter-spacing)',
                }}
              >
                {h.closingHeading}
              </h2>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link to={localePath(activeLocale, '/books')} className={btnPrimary}>
                  {h.ctaLibrary}
                </Link>
                <Link
                  to={localePath(activeLocale, '/requests')}
                  className={cn(inkLink, 'inline-flex items-center gap-1.5')}
                >
                  {h.ctaRequests}
                  <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
