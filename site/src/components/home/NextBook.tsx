import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import type { RequestRow } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { format } from '~/i18n'
import { StatusTag } from '~/components/StatusTag'
import { Reveal } from '~/components/Reveal'
import { inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * NextBook: the top three vote-leaders from the request board plus the vote CTA
 * (SITE-PLAN homepage flow §6). A ranked list on the white canvas: each row is
 * a first-person subject, its status tag (the pastel semantics), and the vote
 * count in mono. Rows group with sparse hairline dividers inside one bordered
 * container (never border-t + border-b on every row).
 *
 * The homepage list is display-only; the one-tap vote interaction lives on the
 * full request board, which "Add your voice" links to. Published subjects link
 * to their book so the ranking doubles as a route into the library.
 */
export function NextBook({
  locale,
  t,
  requests,
}: {
  locale: Locale
  t: Messages
  requests: RequestRow[]
}) {
  // Top three by votes; the board owns the full ranked list.
  const top = [...requests].sort((a, b) => b.votes - a.votes).slice(0, 3)

  return (
    <section className="bg-canvas">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
        <Reveal>
          <h2
            className="max-w-[20ch] text-ink"
            style={{
              fontSize: 'var(--text-headline-lg)',
              fontWeight: 'var(--text-headline-lg--font-weight)',
              lineHeight: 'var(--text-headline-lg--line-height)',
              letterSpacing: 'var(--text-headline-lg--letter-spacing)',
            }}
          >
            {t.home.requestHeading}
          </h2>
          <p
            className="mt-3 max-w-[52ch] text-ink-secondary"
            style={{
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--text-body-lg--line-height)',
            }}
          >
            {t.home.requestBody}
          </p>
        </Reveal>

        <Reveal as="div" className="mt-9 max-w-[52rem]">
          <ul className="overflow-hidden rounded-lg border border-hairline bg-canvas">
            {top.map((row, i) => {
              const label = format(t.requests.voteCount, { count: row.votes.toLocaleString() })
              const inner = (
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-[18px]">
                  <span
                    className="min-w-0 flex-1 text-ink"
                    style={{ fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
                  >
                    {row.subject}
                  </span>
                  <span className="flex items-center gap-4">
                    <StatusTag status={row.status} t={t} />
                    <span className="type-mono-meta w-[92px] text-end">{label}</span>
                  </span>
                </div>
              )
              return (
                <li
                  key={row.id}
                  className={i > 0 ? 'border-t border-hairline' : undefined}
                >
                  {row.bookSlug ? (
                    <Link
                      to={localePath(locale, `/books/${row.bookSlug}`)}
                      className="block no-underline transition-colors duration-150 hover:bg-surface"
                    >
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              )
            })}
          </ul>
        </Reveal>

        <Reveal as="div" className="mt-8">
          <Link
            to={localePath(locale, '/requests')}
            className={cn(inkLink, 'inline-flex items-center gap-1.5')}
          >
            {t.home.requestCta}
            <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
