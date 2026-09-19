import { useEffect } from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { books, requests, experiences, getBook } from '~/data'
import { track } from '~/lib/measure'
import { CinematicWindowR14 } from '~/components/home/CinematicWindowR14'
import { TrustStrip } from '~/components/home/TrustStrip'
import { HomeBeats } from '~/components/home/HomeBeats'
import { LibrarySection } from '~/components/home/LibrarySection'
import { Marquee } from '~/components/home/Marquee'
import { LivingLibrary } from '~/components/home/LivingLibrary'

/**
 * Homepage (Track A final: Cinematic Life Outside).
 * Opens with the authored physical scene (R14): the Sugar Trap volume
 * standing on its limestone sill, live copy in the calm plaster field, one
 * reading action. Everything downstream of the hero is unchanged: trust
 * strip, story beats, library grid, marquee, living library, footer shell.
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

  const heroBook = getBook('sugar')!

  return (
    <>
      <CinematicWindowR14 locale={activeLocale} book={heroBook} />
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
