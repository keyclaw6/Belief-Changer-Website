import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, CaretLeft, List } from '@phosphor-icons/react'
import type { Book, Chapter } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { format } from '~/i18n'
import { track } from '~/lib/measure'
import { cn } from '~/lib/utils'

/**
 * Reader (M3): book-quality reading and nothing else in the way. The site
 * chrome (nav/footer) stays; this component owns the reading toolbar and the
 * reading surface. The surface carries its own light / sepia / dark comfort
 * palette (persisted in localStorage, functional storage only) independent of
 * the site theme, per DESIGN.md.
 *
 * Typography is the product here: Newsreader at 19px / 1.7, a strict ~66ch
 * measure, paragraph rhythm via generous vertical spacing, a quiet drop of the
 * first line's leading indent (subsequent paragraphs indented, the first flush,
 * the classic book setting). The measure and comfort palettes are the only
 * decisions the surface makes; nothing decorative competes with the prose.
 *
 * Client responsibilities: comfort mode, remembering the reading position per
 * book, and firing read_start (once per book per session) + chapter_view.
 */

const COMFORT_KEY = 'bc-reader-comfort'
const positionKey = (slug: string) => `bc-reading:${slug}`

type Comfort = 'light' | 'sepia' | 'dark'

export function Reader({
  book,
  chapter,
  locale,
  t,
}: {
  book: Book
  chapter: Chapter
  locale: Locale
  t: Messages
}) {
  const total = book.chapters.length
  const prev = book.chapters.find((c) => c.n === chapter.n - 1)
  const next = book.chapters.find((c) => c.n === chapter.n + 1)
  const hasBody = Boolean(chapter.body && chapter.body.length > 0)

  // Comfort mode. Before mount we render a stable default ('light') to avoid an
  // SSR mismatch, then adopt the saved choice (or fall back to the active site
  // theme so a dark-theme reader opens dark).
  const [comfort, setComfort] = useState<Comfort>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(COMFORT_KEY)
      if (saved === 'light' || saved === 'sepia' || saved === 'dark') {
        setComfort(saved)
        return
      }
    } catch {
      /* ignore */
    }
    // No saved choice: mirror the site theme once.
    const dark =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark'
    const systemDark =
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-color-scheme: dark)').matches &&
      document.documentElement.getAttribute('data-theme') === 'system'
    if (dark || systemDark) setComfort('dark')
  }, [])

  function chooseComfort(c: Comfort) {
    setComfort(c)
    try {
      localStorage.setItem(COMFORT_KEY, c)
    } catch {
      /* ignore */
    }
  }

  // Remember the reading position for this book (functional storage only).
  useEffect(() => {
    try {
      localStorage.setItem(positionKey(book.slug), String(chapter.n))
    } catch {
      /* ignore */
    }
  }, [book.slug, chapter.n])

  // Measurement: read_start once per book per session, chapter_view per view.
  const startedRef = useRef<string | null>(null)
  useEffect(() => {
    if (startedRef.current !== book.slug) {
      startedRef.current = book.slug
      track('read_start', { slug: book.slug })
    }
    track('chapter_view', { slug: book.slug, n: chapter.n })
  }, [book.slug, chapter.n])

  const comforts: { value: Comfort; label: string }[] = [
    { value: 'light', label: t.reader.comfortLight },
    { value: 'sepia', label: t.reader.comfortSepia },
    { value: 'dark', label: t.reader.comfortDark },
  ]

  return (
    <div className="reader-surface min-h-[70vh]" data-comfort={mounted ? comfort : 'light'}>
      {/* Reading toolbar. Sits on the reading surface so it recolors with the
          comfort palette, keeping the reading world self-consistent. */}
      <div
        className="border-b"
        style={{ borderColor: 'var(--rs-rule)' }}
      >
        <div className="mx-auto flex w-full max-w-[var(--page-max)] flex-wrap items-center justify-between gap-4 px-[5vw] py-4">
          <Link
            to={localePath(locale, `/books/${book.slug}`)}
            className="inline-flex items-center gap-1.5 no-underline"
            style={{ color: 'var(--rs-ink)', fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
          >
            <CaretLeft size={15} weight="bold" aria-hidden="true" />
            {t.reader.backToBook}
          </Link>

          <div className="flex items-center gap-4">
            {/* Comfort control: restyles the reading surface only. */}
            <div
              role="radiogroup"
              aria-label={t.reader.comfortLabel}
              className="inline-flex overflow-hidden rounded-md border"
              style={{ borderColor: 'var(--rs-rule)' }}
            >
              {comforts.map((c) => {
                // Before mount the surface is 'light' (the SSR default), so
                // show Light as active then; after mount, follow the choice.
                const selected = mounted ? comfort === c.value : c.value === 'light'
                return (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => chooseComfort(c.value)}
                    className="type-ui-sm px-3 py-1.5 transition-colors duration-150"
                    style={
                      selected
                        ? { backgroundColor: 'var(--rs-ink)', color: 'var(--rs-bg)' }
                        : { color: 'var(--rs-ink-2)' }
                    }
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reading column. ~66ch measure, book-quality rhythm. */}
      <article className="mx-auto w-full max-w-[42rem] px-[5vw] pb-24 pt-12 md:pt-16">
        <header>
          <p
            className="type-mono-meta"
            style={{ color: 'var(--rs-ink-2)' }}
          >
            {format(t.reader.chapterOf, { n: chapter.n, total })}
          </p>
          <h1
            className="mt-3"
            style={{
              fontFamily: 'var(--font-reader)',
              fontSize: 'clamp(28px, 3.6vw, 38px)',
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              color: 'var(--rs-ink)',
            }}
          >
            {chapter.title}
          </h1>
          <hr className="mt-8 border-t" style={{ borderColor: 'var(--rs-rule)' }} />
        </header>

        {hasBody ? (
          <div className="reader-prose reader-body mt-8" style={{ color: 'var(--rs-ink)' }}>
            {chapter.body!.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <BeingWritten book={book} locale={locale} t={t} />
        )}

        {/* Chapter navigation: ink links, prev / next. */}
        <nav
          aria-label={t.reader.contents}
          className="mt-16 flex items-center justify-between gap-4 border-t pt-8"
          style={{ borderColor: 'var(--rs-rule)' }}
        >
          {prev ? (
            <Link
              to={localePath(locale, `/books/${book.slug}/read/${prev.n}`)}
              className="inline-flex max-w-[45%] items-center gap-2 no-underline"
              style={{ color: 'var(--rs-ink)', fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
            >
              <ArrowLeft size={16} weight="bold" aria-hidden="true" className="shrink-0" />
              <span className="truncate">{t.reader.prev}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={localePath(locale, `/books/${book.slug}/read/${next.n}`)}
              className="inline-flex max-w-[45%] items-center gap-2 no-underline"
              style={{ color: 'var(--rs-ink)', fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
            >
              <span className="truncate">{t.reader.next}</span>
              <ArrowRight size={16} weight="bold" aria-hidden="true" className="shrink-0" />
            </Link>
          ) : (
            <span />
          )}
        </nav>

        {/* Full chapter list (contents) as a quiet disclosure at the foot. */}
        <ChapterList book={book} current={chapter.n} locale={locale} t={t} />
      </article>
    </div>
  )
}

function BeingWritten({
  book,
  locale,
  t,
}: {
  book: Book
  locale: Locale
  t: Messages
}) {
  return (
    <div className="mt-10 max-w-[54ch]">
      <p
        className="reader-prose"
        style={{ color: 'var(--rs-ink)' }}
      >
        {t.reader.beingWrittenTitle}
      </p>
      <p
        className="mt-4"
        style={{ color: 'var(--rs-ink-2)', fontSize: 'var(--text-body-md)', lineHeight: 1.6 }}
      >
        {t.reader.beingWrittenBody}
      </p>
      <Link
        to={localePath(locale, `/books/${book.slug}`)}
        className="mt-6 inline-block"
        style={{ color: 'var(--rs-ink)', fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
      >
        {t.reader.beingWrittenCta}
      </Link>
    </div>
  )
}

function ChapterList({
  book,
  current,
  locale,
  t,
}: {
  book: Book
  current: number
  locale: Locale
  t: Messages
}) {
  return (
    <details className="mt-14 border-t pt-6" style={{ borderColor: 'var(--rs-rule)' }}>
      <summary
        className="inline-flex cursor-pointer list-none items-center gap-2"
        style={{ color: 'var(--rs-ink)', fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
      >
        <List size={16} weight="regular" aria-hidden="true" />
        {t.reader.chaptersLabel}
      </summary>
      <ol className="mt-4 space-y-1">
        {book.chapters.map((c) => {
          const isCurrent = c.n === current
          return (
            <li key={c.n}>
              <Link
                to={localePath(locale, `/books/${book.slug}/read/${c.n}`)}
                aria-current={isCurrent ? 'true' : undefined}
                className={cn('inline-flex gap-3 no-underline')}
                style={{
                  color: isCurrent ? 'var(--rs-ink)' : 'var(--rs-ink-2)',
                  fontSize: 'var(--text-body-md)',
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                <span className="type-mono-meta w-6 shrink-0 text-end" style={{ color: 'var(--rs-ink-2)' }}>
                  {c.n}
                </span>
                <span>{c.title}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </details>
  )
}
