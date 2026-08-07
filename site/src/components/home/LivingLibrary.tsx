import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import type { Experience, RequestRow } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { format } from '~/i18n'
import { StatusTag } from '~/components/StatusTag'
import { Reveal } from '~/components/Reveal'
import { inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * LivingLibrary (home, canvas): three quiet columns (copy deck 01-home).
 *   1. Living books.  Readers improve every book; versions are public; the
 *      newest is what you get.
 *   2. The next book is chosen by you.  The top three vote-leaders with counts,
 *      then "Add your voice" to the board.
 *   3. Experiences.  One anonymous excerpt, then "Read more".
 *
 * Structure is hairline-and-whitespace: three columns divided by a top rule on
 * their heading, real fixture data (mono vote counts), one middle dot max per
 * line. No cards-in-cards, no eyebrows.
 */
export function LivingLibrary({
  locale,
  t,
  requests,
  experiences,
}: {
  locale: Locale
  t: Messages
  requests: RequestRow[]
  experiences: Experience[]
}) {
  const top = [...requests].sort((a, b) => b.votes - a.votes).slice(0, 3)
  const excerpt = experiences[0]

  return (
    <section className="bg-canvas">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-3">
          {/* Column 1: living books. */}
          <Reveal as="div" index={0}>
            <div className="border-t border-hairline pt-6">
              <h2
                className="text-ink"
                style={{
                  fontSize: 'var(--text-headline-md)',
                  fontWeight: 'var(--text-headline-md--font-weight)',
                  lineHeight: 'var(--text-headline-md--line-height)',
                }}
              >
                {t.home.livingBooksTitle}
              </h2>
              <p
                className="mt-3 text-ink-secondary"
                style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
              >
                {t.home.livingBooksBody}
              </p>
            </div>
          </Reveal>

          {/* Column 2: the next book (top three vote leaders). */}
          <Reveal as="div" index={1}>
            <div className="border-t border-hairline pt-6">
              <h2
                className="text-ink"
                style={{
                  fontSize: 'var(--text-headline-md)',
                  fontWeight: 'var(--text-headline-md--font-weight)',
                  lineHeight: 'var(--text-headline-md--line-height)',
                }}
              >
                {t.home.nextBookTitle}
              </h2>
              <ul className="mt-4 space-y-3">
                {top.map((row) => (
                  <li key={row.id} className="flex items-baseline justify-between gap-4">
                    <span
                      className="min-w-0 flex-1 text-ink"
                      style={{ fontSize: 'var(--text-body-md)', lineHeight: 1.4 }}
                    >
                      {row.subject}
                    </span>
                    <span className="type-mono-meta shrink-0">
                      {format(
                        row.votes === 1 ? t.requests.voiceCountOne : t.requests.voiceCount,
                        { count: row.votes.toLocaleString() },
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to={localePath(locale, '/requests')}
                className={cn(inkLink, 'mt-5 inline-flex items-center gap-1.5')}
              >
                {t.home.nextBookCta}
                <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
              </Link>
            </div>
          </Reveal>

          {/* Column 3: an experience excerpt. */}
          <Reveal as="div" index={2}>
            <div className="border-t border-hairline pt-6">
              <h2
                className="text-ink"
                style={{
                  fontSize: 'var(--text-headline-md)',
                  fontWeight: 'var(--text-headline-md--font-weight)',
                  lineHeight: 'var(--text-headline-md--line-height)',
                }}
              >
                {t.home.livingExperiencesTitle}
              </h2>
              {excerpt ? (
                <blockquote
                  className="mt-4 text-ink-secondary [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5] overflow-hidden"
                  style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
                >
                  {excerpt.text}
                </blockquote>
              ) : null}
              <Link
                to={localePath(locale, '/experiences')}
                className={cn(inkLink, 'mt-5 inline-flex items-center gap-1.5')}
              >
                {t.home.livingExperiencesLink}
                <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
