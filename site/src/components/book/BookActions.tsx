import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { BookOpen, DownloadSimple, Headphones } from '@phosphor-icons/react'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { track } from '~/lib/measure'
import { ToneTag } from '~/components/StatusTag'
import { btnPrimary, btnSecondary } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * BookActions: Read online (the single ink primary), Download EPUB (secondary),
 * and Listen. Books without audio show a small "In production" tag instead of a
 * dead button. When nothing is readable yet, the primary is omitted.
 *
 * Reader upgrade (05-reader): when a reading position for this book exists on
 * the device, "Read online" becomes "Continue reading" and links to the
 * remembered chapter. The position is read after mount (functional storage
 * only), so SSR and the first client render agree, then the label settles.
 */
const positionKey = (slug: string) => `bc-reading:${slug}`

export function BookActions({
  book,
  locale,
  t,
}: {
  book: Book
  locale: Locale
  t: Messages
}) {
  const canRead = book.formats.read === 'available'
  const canDownload = book.formats.epub === 'available'
  const audio = book.formats.audio

  // Remembered reading position (client only). null until read after mount.
  const [resumeChapter, setResumeChapter] = useState<number | null>(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(positionKey(book.slug))
      const n = raw ? Number(raw) : NaN
      if (Number.isInteger(n) && book.chapters.some((c) => c.n === n && c.body?.length)) {
        setResumeChapter(n)
      }
    } catch {
      /* ignore */
    }
  }, [book.slug, book.chapters])

  const readTo = resumeChapter ?? 1
  const readLabel = resumeChapter ? t.book.continueReading : t.book.readOnline

  return (
    <div className="flex flex-wrap items-center gap-3">
      {canRead ? (
        <Link to={localePath(locale, `/books/${book.slug}/read/${readTo}`)} className={btnPrimary}>
          <BookOpen size={17} weight="regular" aria-hidden="true" />
          {readLabel}
        </Link>
      ) : null}

      {canDownload ? (
        <a
          href="#"
          onClick={(e) => {
            // v1 stub: no real EPUB endpoint yet. Record the intent.
            e.preventDefault()
            track('download', { slug: book.slug, format: 'epub' })
          }}
          className={btnSecondary}
        >
          <DownloadSimple size={17} weight="regular" aria-hidden="true" />
          {t.book.downloadEpub}
        </a>
      ) : null}

      {/* Audio: a live Listen link, an "In production" tag, or nothing. */}
      {audio === 'available' ? (
        <a href="#" onClick={(e) => e.preventDefault()} className={btnSecondary}>
          <Headphones size={17} weight="regular" aria-hidden="true" />
          {t.book.listen}
        </a>
      ) : audio === 'in-production' ? (
        <span className={cn('inline-flex items-center gap-2 py-3.5')}>
          <span className="type-ui-sm inline-flex items-center gap-1.5 text-ink-secondary">
            <Headphones size={16} weight="regular" aria-hidden="true" />
            {t.book.listen}
          </span>
          <ToneTag tone="yellow">{t.status.inProduction}</ToneTag>
        </span>
      ) : null}
    </div>
  )
}
