import { createFileRoute, useParams } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import type { Locale } from '~/i18n/config'
import { hreflangAlternates } from '~/i18n/routing'
import { getBook } from '~/data'
import { CinematicWindowR14 } from '~/components/home/CinematicWindowR14'

/**
 * Isolated Track A R14 slice: /{locale}/cinematic-window-r14.
 * QA mirror of the homepage hero. R7 (/{locale}/cinematic-window), R8
 * (/{locale}/cinematic-window-r8), R9 (/{locale}/cinematic-window-r9), and
 * R13 (/{locale}/cinematic-window-r13) are preserved unchanged.
 */
export const Route = createFileRoute('/$locale/cinematic-window-r14')({
  head: () => ({
    links: hreflangAlternates('/cinematic-window-r14').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: CinematicWindowR14Page,
})

function CinematicWindowR14Page() {
  const { locale } = useParams({ from: '/$locale/cinematic-window-r14' })
  const activeLocale = locale as Locale
  void getMessages(activeLocale)
  const book = getBook('sugar')!
  return (
    <main>
      <CinematicWindowR14 locale={activeLocale} book={book} />
    </main>
  )
}
