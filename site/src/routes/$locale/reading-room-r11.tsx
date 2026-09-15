import { createFileRoute, useParams } from '@tanstack/react-router'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { books } from '~/data'
import { ReadingRoomR11 } from '~/components/home/ReadingRoomR11'

/**
 * Reading-room R11 spike route (Track B, bounded experiment).
 *
 * Isolation: this page renders NOTHING but the R11 room stage. No hero,
 * no trust strip, no beats, no library grid, no marquee, no banded
 * sections of any kind, so the room plate starts immediately below the
 * site header and the plate itself is the layout. The homepage R9 slice
 * and the R10 route are untouched by this route.
 */
export const Route = createFileRoute('/$locale/reading-room-r11')({
  head: () => ({
    meta: [{ title: 'Reading room R11 · Belief Changer' }],
    links: hreflangAlternates('/reading-room-r11').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: ReadingRoomR11Page,
})

function ReadingRoomR11Page() {
  const { locale } = useParams({ from: '/$locale/reading-room-r11' })
  const activeLocale = locale as Locale

  // Same four titles as the R10 spike so R11 reuses the exact shelf-to-desk
  // selection logic against the same collection.
  const shelfBooks = [
    books.find((b) => b.slug === 'sugar'),
    books.find((b) => b.slug === 'scrolling'),
    books.find((b) => b.slug === 'smoking'),
    books.find((b) => b.slug === 'alcohol'),
  ].filter((b): b is NonNullable<typeof b> => Boolean(b))

  return <ReadingRoomR11 locale={activeLocale} books={shelfBooks} />
}
