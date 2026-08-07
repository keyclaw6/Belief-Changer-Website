import { useEffect } from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { track } from '~/lib/measure'
import { Reveal } from '~/components/Reveal'

/**
 * Privacy (owner request): a typography-led privacy document, no imagery. It
 * states the site's measurement contract in plain human language: no tracking,
 * no cookies, no accounts, aggregate event counts only, everything functional
 * kept on the device (DESIGN.md Voice; the About honesty note, expanded).
 *
 * Layout: a single reading column at a 65ch measure. A title and lede, then a
 * run of short quiet sections (headline-md headings, body-md prose), and finally
 * a hairline-bordered block for the formalities (data controller + how to
 * complain), set apart so the legal facts read as a distinct, calm footnote.
 * Sections are separated by whitespace, not boxes; eyebrow count: zero.
 *
 * SSR, hreflang alternates like every other route, and a page_view event with
 * routeClass "privacy". Zero em-dashes; every string comes from the catalog.
 */
export const Route = createFileRoute('/$locale/privacy')({
  head: () => ({
    meta: [{ title: 'Privacy, simplified. · Belief Changer' }],
    links: hreflangAlternates('/privacy').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: PrivacyPage,
})

function PrivacyPage() {
  const { locale } = useParams({ from: '/$locale/privacy' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)

  useEffect(() => {
    track('page_view', { routeClass: 'privacy', locale: activeLocale })
  }, [activeLocale])

  // The document body: short sections in reading order. The formalities are
  // handled separately below because they render as a bordered block.
  const sections: Array<{ heading: string; body: string }> = [
    { heading: t.privacy.linkedTitle, body: t.privacy.linkedBody },
    { heading: t.privacy.typeTitle, body: t.privacy.typeBody },
    { heading: t.privacy.countTitle, body: t.privacy.countBody },
    { heading: t.privacy.deviceTitle, body: t.privacy.deviceBody },
    { heading: t.privacy.thirdPartiesTitle, body: t.privacy.thirdPartiesBody },
    { heading: t.privacy.controlTitle, body: t.privacy.controlBody },
  ]

  return (
    <section className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      <div className="mx-auto max-w-[65ch] pb-24 pt-14 md:pt-[88px]">
        {/* Title + lede. */}
        <Reveal>
          <h1
            className="text-ink"
            style={{
              fontSize: 'var(--text-headline-lg)',
              fontWeight: 'var(--text-headline-lg--font-weight)',
              lineHeight: 'var(--text-headline-lg--line-height)',
              letterSpacing: 'var(--text-headline-lg--letter-spacing)',
            }}
          >
            {t.privacy.title}
          </h1>
          <p
            className="mt-5 text-ink-secondary"
            style={{
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--text-body-lg--line-height)',
            }}
          >
            {t.privacy.lede}
          </p>
        </Reveal>

        {/* The short sections, quiet headings + body-md prose. */}
        <div className="mt-14 grid gap-11">
          {sections.map((s, i) => (
            <Reveal key={s.heading} index={Math.min(i, 7)}>
              <h2
                className="text-ink"
                style={{
                  fontSize: 'var(--text-headline-md)',
                  fontWeight: 'var(--text-headline-md--font-weight)',
                  lineHeight: 'var(--text-headline-md--line-height)',
                }}
              >
                {s.heading}
              </h2>
              <p
                className="mt-3 text-ink-secondary"
                style={{
                  fontSize: 'var(--text-body-md)',
                  lineHeight: 'var(--text-body-md--line-height)',
                }}
              >
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>

        {/* The formalities: a hairline-bordered block set apart from the prose. */}
        <Reveal className="mt-14 rounded-lg border border-hairline p-7 md:p-9">
          <h2
            className="text-ink"
            style={{
              fontSize: 'var(--text-headline-md)',
              fontWeight: 'var(--text-headline-md--font-weight)',
              lineHeight: 'var(--text-headline-md--line-height)',
            }}
          >
            {t.privacy.formalitiesTitle}
          </h2>
          {/* Data controller line. The entity details are a placeholder the
              owner must confirm before launch (see catalog note). */}
          <p
            className="mt-4 text-ink-secondary"
            style={{
              fontSize: 'var(--text-body-md)',
              lineHeight: 'var(--text-body-md--line-height)',
            }}
          >
            <span className="font-semibold text-ink">
              {t.privacy.formalitiesControllerLabel}
            </span>{' '}
            {/* OWNER TO CONFIRM: real legal entity name + registration details
                must replace this placeholder before the site goes live. */}
            {t.privacy.formalitiesControllerValue}
          </p>
          {/* How to complain, with the supervisory authority linked out. */}
          <p
            className="mt-3 text-ink-secondary"
            style={{
              fontSize: 'var(--text-body-md)',
              lineHeight: 'var(--text-body-md--line-height)',
            }}
          >
            {t.privacy.formalitiesComplaintBefore}{' '}
            <a
              href="https://www.datatilsynet.dk"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink underline underline-offset-[3px] decoration-1 transition-opacity duration-150 hover:opacity-70"
            >
              {t.privacy.formalitiesLinkLabel}
            </a>
            {t.privacy.formalitiesComplaintAfter}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
