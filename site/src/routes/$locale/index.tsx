import { useEffect } from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { books, requests, experiences } from '~/data'
import { track } from '~/lib/measure'
import { Hero } from '~/components/home/Hero'
import { TrustStrip } from '~/components/home/TrustStrip'
import { HomeBeats } from '~/components/home/HomeBeats'
import { LibrarySection } from '~/components/home/LibrarySection'
import { Marquee } from '~/components/home/Marquee'
import { LivingLibrary } from '~/components/home/LivingLibrary'

/**
 * Homepage (v2). The story in five beats, plainly told (proposal 01-home):
 *   0. Hero (words + shelf stage + finder + examples), full viewport
 *   Trust strip (four hairline columns)
 *   1-5. The five story beats: large still paintings, canvas/band alternating
 *   The library grid (titled covers, hologram hover)
 *   The marquee (the single sanctioned motion) + the mission line
 *   The living library (three quiet columns)
 *   Footer (from the shell)
 *
 * Section zoning alternates canvas and band, so adjacent sections differ and no
 * hairline dividers are needed between them. Layout families are distinct:
 * asymmetric hero, hairline-column strip, image+text story beats (broken by a
 * full-width breakout so no three splits run consecutively), a cover grid, a
 * drifting marquee, and a three-column living-library. Eyebrow count: zero.
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

  return (
    <>
      <Hero locale={activeLocale} t={t} shelfBooks={shelfBooks} />
      <TrustStrip t={t} />
      <HomeBeats locale={activeLocale} t={t} />
      <LibrarySection locale={activeLocale} t={t} books={books} />
      <Marquee t={t} />
      <LivingLibrary
        locale={activeLocale}
        t={t}
        requests={requests}
        experiences={experiences}
      />
    </>
  )
}
