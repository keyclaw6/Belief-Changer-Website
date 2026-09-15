import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import type { Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { getBook } from '~/data'
import { CinematicWindowR8 } from '~/components/home/CinematicWindowR8'

/**
 * Isolated Track A R8 slice: /{locale}/cinematic-window-r8.
 * Not linked from production navigation. R7
 * (/{locale}/cinematic-window) is preserved unchanged; this route tests ONE
 * thing on top of the same approved plate: deterministic, textless
 * physical-support layers (fore-edge shell, one owned contact shadow, a 2px
 * sill lip) around the unaltered Sugar Trap cover, repositioned live copy in
 * the safe plaster field, and the reading action as one ordinary link.
 */
export const Route = createFileRoute('/$locale/cinematic-window-r8')({
  head: () => ({
    links: hreflangAlternates('/cinematic-window-r8').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: CinematicWindowR8Page,
})

function CinematicWindowR8Page() {
  const { locale } = useParams({ from: '/$locale/cinematic-window-r8' })
  const activeLocale = locale as Locale
  void getMessages(activeLocale)
  const book = getBook('sugar')!
  return (
    <main>
      <CinematicWindowR8 locale={activeLocale} book={book} />
    </main>
  )
}
