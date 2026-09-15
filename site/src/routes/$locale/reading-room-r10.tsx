import { createFileRoute, useParams } from '@tanstack/react-router'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { books } from '~/data'
import { ReadingRoomR10 } from '~/components/home/ReadingRoomR10'

/**
 * Reading-room R10 spike route (Track B, bounded experiment).
 *
 * Isolation: this page renders NOTHING but the R10 room stage. No hero,
 * no trust strip, no beats, no library grid, no marquee, no banded
 * sections of any kind, so the room plate starts immediately below the
 * site header and the plate itself is the layout. The homepage R9 slice
 * is untouched by this route.
 */
export const Route = createFileRoute('/$locale/reading-room-r10')({
  head: () => ({
    meta: [{ title: 'Reading room R10 · Belief Changer' }],
    links: hreflangAlternates('/reading-room-r10').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: ReadingRoomR10Page,
})

function ReadingRoomR10Page() {
  const { locale } = useParams({ from: '/$locale/reading-room-r10' })
  const activeLocale = locale as Locale

  // Same four titles as the homepage shelf so the spike reuses the exact
  // R9 shelf-to-desk selection logic against the same collection.
  const shelfBooks = [
    books.find((b) => b.slug === 'sugar'),
    books.find((b) => b.slug === 'scrolling'),
    books.find((b) => b.slug === 'smoking'),
    books.find((b) => b.slug === 'alcohol'),
  ].filter((b): b is NonNullable<typeof b> => Boolean(b))

  return <ReadingRoomR10 locale={activeLocale} books={shelfBooks} />
}
