import { createFileRoute, useParams } from '@tanstack/react-router'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { books } from '~/data'
import { ReadingRoomR13 } from '~/components/home/ReadingRoomR13'

/**
 * Reading-room R13 spike route (Track B, bounded experiment).
 *
 * Isolation: this page renders NOTHING but the R13 room stage (the R11
 * same-node machine + the R13 material CSS layer). No hero, no trust strip,
 * no beats, no library grid, no marquee, no banded sections of any kind, so
 * the room plate starts immediately below the site header. The homepage R9
 * slice, the R10 route and the R11 route are untouched by this route.
 */
export const Route = createFileRoute('/$locale/reading-room-r13')({
  head: () => ({
    meta: [{ title: 'Reading room R13 · Belief Changer' }],
    links: hreflangAlternates('/reading-room-r13').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: ReadingRoomR13Page,
})

function ReadingRoomR13Page() {
  const { locale } = useParams({ from: '/$locale/reading-room-r13' })
  const activeLocale = locale as Locale

  // Same four titles as the R10/R11 spikes so R13 stages the exact same
  // collection through the same selection logic.
  const shelfBooks = [
    books.find((b) => b.slug === 'sugar'),
    books.find((b) => b.slug === 'scrolling'),
    books.find((b) => b.slug === 'smoking'),
    books.find((b) => b.slug === 'alcohol'),
  ].filter((b): b is NonNullable<typeof b> => Boolean(b))

  return <ReadingRoomR13 locale={activeLocale} books={shelfBooks} />
}
