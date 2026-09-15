import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import type { Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { getBook } from '~/data'
import { CinematicWindowR13 } from '~/components/home/CinematicWindowR13'

/**
 * Isolated Track A R13 slice: /{locale}/cinematic-window-r13.
 * Not linked from production navigation. R7 (/{locale}/cinematic-window),
 * R8 (/{locale}/cinematic-window-r8), and R9
 * (/{locale}/cinematic-window-r9) are preserved unchanged; this route tests
 * ONE thing on top of the banked R8 still: a single genuine plate-aware
 * foreground occluder (verbatim nosing pixels, registered by construction)
 * with leaf-only inspection parallax, making the re-seated book belong to
 * the sill.
 */
export const Route = createFileRoute('/$locale/cinematic-window-r13')({
  head: () => ({
    links: hreflangAlternates('/cinematic-window-r13').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: CinematicWindowR13Page,
})

function CinematicWindowR13Page() {
  const { locale } = useParams({ from: '/$locale/cinematic-window-r13' })
  const activeLocale = locale as Locale
  void getMessages(activeLocale)
  const book = getBook('sugar')!
  return (
    <main>
      <CinematicWindowR13 locale={activeLocale} book={book} />
    </main>
  )
}
