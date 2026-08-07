import { useEffect } from 'react'
import { createFileRoute, useParams, useSearch } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { requests } from '~/data'
import { track } from '~/lib/measure'
import { Reveal } from '~/components/Reveal'
import { RequestBoard } from '~/components/requests/RequestBoard'
import { RequestSubmit } from '~/components/requests/RequestSubmit'

/**
 * Request board (M4): vote the next book into existence (SITE-PLAN §Community
 * mechanics). A short, honest intro explains the loop, then the ranked list
 * (votes desc) with one-tap voting and published rows linking to their book,
 * then the "ask for a book" submit flow on a band.
 *
 * Zoning alternates canvas and band; adjacent sections differ in color so no
 * dividers are needed between them. Layout families used, all distinct:
 * a stacked editorial header, a bordered ranked list (divide-y), and a form
 * panel. Eyebrow count on the page: zero.
 *
 * The library's no-match CTA can seed the subject field through a validated
 * ?subject= param; it is capped and trimmed here before it reaches the form.
 */

interface RequestsSearch {
  subject?: string
}

export const Route = createFileRoute('/$locale/requests')({
  validateSearch: (search: Record<string, unknown>): RequestsSearch => {
    // Accept a short, plain subject seed only; cap length and drop anything
    // that is not a non-empty string so the form never trusts the URL blindly.
    const raw = typeof search.subject === 'string' ? search.subject.trim() : ''
    return raw ? { subject: raw.slice(0, 120) } : {}
  },
  head: () => ({
    links: hreflangAlternates('/requests').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: RequestsPage,
})

function RequestsPage() {
  const { locale } = useParams({ from: '/$locale/requests' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)
  const search = useSearch({ from: '/$locale/requests' })

  useEffect(() => {
    track('page_view', { routeClass: 'requests', locale: activeLocale })
  }, [activeLocale])

  return (
    <>
      {/* Header + honest loop explanation, then the ranked board. */}
      <section className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
        <div className="pb-16 pt-14 md:pt-[88px]">
          <Reveal>
            <h1
              className="max-w-[20ch] text-ink"
              style={{
                fontSize: 'var(--text-headline-lg)',
                fontWeight: 'var(--text-headline-lg--font-weight)',
                lineHeight: 'var(--text-headline-lg--line-height)',
                letterSpacing: 'var(--text-headline-lg--letter-spacing)',
              }}
            >
              {t.requests.title}
            </h1>
            <p
              className="mt-4 max-w-[56ch] text-ink-secondary"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {t.requests.loopExplainer}
            </p>
          </Reveal>

          <Reveal className="mt-10">
            <RequestBoard rows={requests} locale={activeLocale} t={t} />
          </Reveal>
        </div>
      </section>

      {/* Ask for a book. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal className="max-w-[42rem]">
            <RequestSubmit t={t} seedSubject={search.subject ?? ''} />
          </Reveal>
        </div>
      </section>
    </>
  )
}
