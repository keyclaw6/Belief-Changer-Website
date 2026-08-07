import { useEffect } from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { books, requests, experiences } from '~/data'
import { track } from '~/lib/measure'
import { Hero } from '~/components/home/Hero'
import { TrustStrip } from '~/components/home/TrustStrip'
import { Reframe } from '~/components/home/Reframe'
import { MethodBeats } from '~/components/home/MethodBeats'
import { LivingBooks } from '~/components/home/LivingBooks'
import { NextBook } from '~/components/home/NextBook'
import { Experiences } from '~/components/home/Experiences'

/**
 * Homepage (M2). The beats run in SITE-PLAN's locked order:
 *   1. Hero (asymmetric split + ShelfStage + ask finder seed)
 *   2. Trust strip (4 hairline columns)
 *   3. The reframe (3 canonical sentences, band)
 *   4. How escape works (3 method beats + Voice-1 paintings)
 *   5. Living books (mono facts, hairline structure, band)
 *   6. The next book (top-3 vote leaders + vote CTA)
 *   7. Reader experiences (anonymous excerpts + board link, band)
 *   8. Footer (from the shell)
 *
 * Section zoning alternates canvas and band; because each adjacent pair differs
 * in color, no hairline dividers are needed between sections (DESIGN.md: rules
 * separate sections only where two same-color sections meet). Layout families
 * used, all distinct: asymmetric-split hero, hairline-column strip, stacked
 * editorial statement, image+text beats (capped at two consecutive splits, the
 * third breaks to a full-width stack), a bordered cover-row of living books, a
 * ranked board list, and a quote grid. Eyebrow count: zero.
 */
export const Route = createFileRoute('/$locale/')({
  head: () => ({
    links: hreflangAlternates('/').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: HomePage,
})

function HomePage() {
  const { locale } = useParams({ from: '/$locale/' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)

  useEffect(() => {
    track('page_view', { routeClass: 'home', locale: activeLocale })
  }, [activeLocale])

  // Shelf: a representative row led by the published books, with one
  // being-written title so the shelf is honest about what is still coming.
  const shelfBooks = [
    books.find((b) => b.slug === 'sugar'),
    books.find((b) => b.slug === 'scrolling'),
    books.find((b) => b.slug === 'smoking'),
    books.find((b) => b.slug === 'alcohol'),
  ].filter((b): b is NonNullable<typeof b> => Boolean(b))

  // Living books: only titles that actually have a version (published or in
  // translation), so every mono fact on this row is real.
  const livingBooks = books.filter((b) => b.version > 0)

  return (
    <>
      <Hero locale={activeLocale} t={t} shelfBooks={shelfBooks} />
      <TrustStrip t={t} />
      <Reframe t={t} />
      <MethodBeats t={t} />
      <LivingBooks locale={activeLocale} t={t} books={livingBooks} />
      <NextBook locale={activeLocale} t={t} requests={requests} />
      <Experiences locale={activeLocale} t={t} experiences={experiences} />
    </>
  )
}
