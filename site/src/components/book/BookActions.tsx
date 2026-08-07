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
 * and Listen (SITE-PLAN §Versions and formats). Books without audio show a
 * small "In production" yellow tag instead of a dead button; the same honesty
 * applies to EPUB. When nothing is readable yet, the primary is omitted rather
 * than faked; the status tag and version block carry that meaning.
 *
 * Read online is a link into the reader, where read_start fires (reading starts
 * there, so the event lives in one place). Download EPUB fires download(slug,
 * 'epub'); the file itself is a documented v1 stub.
 */
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

  return (
    <div className="flex flex-wrap items-center gap-3">
      {canRead ? (
        <Link
          to={localePath(locale, `/books/${book.slug}/read/1`)}
          className={btnPrimary}
        >
          <BookOpen size={17} weight="regular" aria-hidden="true" />
          {t.book.readOnline}
        </Link>
      ) : null}

      {canDownload ? (
        <a
          href="#"
          onClick={(e) => {
            // v1 stub: no real EPUB endpoint yet. Prevent the dead navigation
            // and record the intent; the real download URL wires in later.
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
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className={btnSecondary}
        >
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
