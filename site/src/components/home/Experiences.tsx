import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import type { Experience } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { Reveal } from '~/components/Reveal'
import { inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * Experiences: two or three anonymous excerpts plus the link to the board
 * (SITE-PLAN homepage flow §7). A quote grid on the band, white cards on warm
 * bone. Excerpts are clamped to a glance (three lines) so the section stays a
 * snippet, not a wall of testimony; the full text lives on the board.
 *
 * The imagery manifest assigns painted-together-after-rain to this strip; it
 * leads the section as a single calm anchor so painting and text never share a
 * viewport moment (imagery law: one voice per section). No invented names or
 * numbers appear; these are anonymous, month-coarse, mock samples from the
 * fixture.
 */
export function Experiences({
  locale,
  t,
  experiences,
}: {
  locale: Locale
  t: Messages
  experiences: Experience[]
}) {
  const items = experiences.slice(0, 3)
  return (
    <section className="bg-band">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
        {/* Assigned Voice-1 painting leads the section as a single calm anchor
            (imagery manifest). Slim band so it never crowds the quotes below. */}
        <Reveal>
          <div className="mb-12 h-44 w-full overflow-hidden rounded-lg sm:h-56 md:h-64">
            <img
              src="/site/painted-together-after-rain.jpg"
              alt={t.experiences.imageAlt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center ring-1 ring-[var(--color-hairline-on-image)]"
            />
          </div>
        </Reveal>
        <Reveal>
          <h2
            className="max-w-[18ch] text-ink"
            style={{
              fontSize: 'var(--text-headline-lg)',
              fontWeight: 'var(--text-headline-lg--font-weight)',
              lineHeight: 'var(--text-headline-lg--line-height)',
              letterSpacing: 'var(--text-headline-lg--letter-spacing)',
            }}
          >
            {t.home.experiencesHeading}
          </h2>
          <p
            className="mt-3 max-w-[48ch] text-ink-secondary"
            style={{
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--text-body-lg--line-height)',
            }}
          >
            {t.home.experiencesBody}
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((exp, i) => (
            <Reveal key={exp.id} as="li" index={i}>
              <figure className="flex h-full flex-col rounded-lg border border-hairline bg-canvas p-7">
                <blockquote
                  className="flex-1 text-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5] overflow-hidden"
                  style={{
                    fontSize: 'var(--text-body-md)',
                    lineHeight: 'var(--text-body-md--line-height)',
                  }}
                >
                  {exp.text}
                </blockquote>
                <figcaption className="type-mono-meta mt-5">
                  {exp.month}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>

        <Reveal as="div" className="mt-8">
          <Link
            to={localePath(locale, '/experiences')}
            className={cn(inkLink, 'inline-flex items-center gap-1.5')}
          >
            {t.home.experiencesLink}
            <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
