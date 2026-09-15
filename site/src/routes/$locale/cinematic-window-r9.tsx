import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import type { Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { getBook } from '~/data'
import { CinematicWindowR9 } from '~/components/home/CinematicWindowR9'

/**
 * Isolated Track A R9 slice: /{locale}/cinematic-window-r9.
 * Not linked from production navigation. R7 (/{locale}/cinematic-window)
 * and R8 (/{locale}/cinematic-window-r8) are preserved unchanged; this
 * route tests ONE thing on top of the same approved plate and the same
 * bound-volume still: a rigid shared-camera drift (±14px single-axis X on
 * one rig, fine-pointer desktop only) that keeps book, sill, and room as
 * one camera instead of independently sliding layers.
 */
export const Route = createFileRoute('/$locale/cinematic-window-r9')({
  head: () => ({
    links: hreflangAlternates('/cinematic-window-r9').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: CinematicWindowR9Page,
})

function CinematicWindowR9Page() {
  const { locale } = useParams({ from: '/$locale/cinematic-window-r9' })
  const activeLocale = locale as Locale
  void getMessages(activeLocale)
  const book = getBook('sugar')!
  return (
    <main>
      <CinematicWindowR9 locale={activeLocale} book={book} />
    </main>
  )
}
