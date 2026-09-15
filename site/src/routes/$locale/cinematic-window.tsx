import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import type { Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { getBook } from '~/data'
import { CinematicWindow } from '~/components/home/CinematicWindow'

/**
 * Isolated Track A R7 slice: /{locale}/cinematic-window.
 * Not linked from production navigation. SSR owns all copy and the genuine
 * chapter-1 passage; the scene is a static photographic still (the approved
 * plate: plaster + limestone sill + deep-green joinery, decorative semantics)
 * with live DOM copy on the quiet plaster, one unaltered Sugar Trap cover
 * standing on the sill, plus one native "Examine a passage" toggle.
 */
export const Route = createFileRoute('/$locale/cinematic-window')({
  head: () => ({
    links: hreflangAlternates('/cinematic-window').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: CinematicWindowPage,
})

function CinematicWindowPage() {
  const { locale } = useParams({ from: '/$locale/cinematic-window' })
  const activeLocale = locale as Locale
  void getMessages(activeLocale)
  const book = getBook('sugar')!
  return (
    <main>
      <CinematicWindow locale={activeLocale} book={book} />
    </main>
  )
}
