import { useEffect } from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { ArrowUpRight } from '@phosphor-icons/react'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { track } from '~/lib/measure'
import { Painting } from '~/components/Painting'
import { Reveal } from '~/components/Reveal'
import { btnPrimary, inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * Contribute (NEW route, copy deck 10-contribute): the invitation. Not a
 * careers page, not a community-platform pitch: the founder asking, plainly,
 * for a few dedicated people. It reads like a letter, at a 65ch measure, with
 * the way-out painting above it.
 *
 * The email address and repository link are the two owner decisions this page
 * waits on; both are one-line swaps, marked clearly as placeholders in code.
 */

// OWNER TO CONFIRM before launch: the real contact address and repository URL.
const REPO_URL = 'https://github.com/belief-changer' // PLACEHOLDER
const MAILTO = 'mailto:hello@example.org' // PLACEHOLDER (address to be confirmed)

export const Route = createFileRoute('/$locale/contribute')({
  head: () => ({
    meta: [{ title: 'Contribute · Belief Changer' }],
    links: hreflangAlternates('/contribute').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: ContributePage,
})

function ContributePage() {
  const { locale } = useParams({ from: '/$locale/contribute' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)
  const c = t.contribute

  useEffect(() => {
    track('page_view', { routeClass: 'contribute', locale: activeLocale })
  }, [activeLocale])

  const roles = [c.role1, c.role2, c.role3]

  return (
    <section className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      <div className="pb-[var(--spacing-section-y)] pt-14 md:pt-[88px]">
        {/* The open way above the letter (wide, still, never cropped). */}
        <Reveal>
          <Painting
            src="/site/painted-way-out.png"
            alt={c.imageAlt}
            priority
            sizes="(max-width: 1400px) 90vw, 1260px"
            className="mx-auto max-w-[72rem]"
          />
        </Reveal>

        {/* The letter, at a reading measure. */}
        <Reveal className="mx-auto mt-12 max-w-[65ch]">
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
              {c.title}
            </h1>
            <p
              className="mt-6 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {c.body1}
            </p>
            <p
              className="mt-4 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {c.body2}
            </p>

            <p
              className="mt-8 text-ink"
              style={{ fontSize: 'var(--text-body-lg)', fontWeight: 600, lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {c.rolesHeading}
            </p>
            <ul className="mt-4">
              {roles.map((role, i) => (
                <li
                  key={i}
                  className={
                    'max-w-[62ch] py-5 text-ink-secondary' +
                    (i > 0 ? ' border-t border-hairline' : '')
                  }
                  style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
                >
                  {role}
                </li>
              ))}
            </ul>

            <p
              className="mt-8 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {c.body3}
            </p>
            <p
              className="mt-4 text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {c.body4}
            </p>

            {/* Repo (primary) + mailto (link). Both placeholder hrefs, marked
                in code as owner decisions. */}
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                {c.repoCta}
              </a>
              <a href={MAILTO} className={cn(inkLink, 'inline-flex items-center gap-1.5')}>
                {c.mailtoLink}
                <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
