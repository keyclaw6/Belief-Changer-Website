import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useReducedMotion } from 'motion/react'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { BookCover } from './BookCover'
import { Hologram } from './Hologram'

/**
 * ShelfStage: the hero asset (SITE-PLAN §Shelf slot contract, DESIGN.md
 * §The shelf). Progressive enhancement:
 *   - SSR + reduced-motion + no-WebGL: static BookCover row (same as v1).
 *   - Motion allowed + WebGL: The Orbit iframe fills this footprint.
 *
 * Panel "Read the book" links are owned by `/orbit/index.html` (locale query →
 * `/{locale}/books/{slug}`, target=_top when embed=1).
 */

const HEIGHTS = ['82%', '100%', '94%', '86%']

function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}

function StaticShelf({ books, locale }: { books: Book[]; locale: Locale }) {
  return (
    <div className="flex h-full items-end justify-center gap-3 sm:gap-4">
      {books.map((book, i) => (
        <Link
          key={book.slug}
          to={localePath(locale, `/books/${book.slug}`)}
          aria-label={book.title}
          className="block w-[21%] max-w-[168px] shrink-0 no-underline sm:w-[23%]"
          style={{ height: HEIGHTS[i % HEIGHTS.length] }}
        >
          <Hologram className="h-full">
            <BookCover
              book={book}
              priority={i < 4}
              sizes="(max-width: 640px) 23vw, 168px"
            />
          </Hologram>
        </Link>
      ))}
    </div>
  )
}

export function ShelfStage({
  books,
  locale,
}: {
  books: Book[]
  locale: Locale
}) {
  const reduce = useReducedMotion()
  // SSR + first paint: static row. Upgrade to Orbit only after mount when
  // motion is allowed and WebGL is available (avoids hydration mismatch).
  const [useOrbit, setUseOrbit] = useState(false)

  useEffect(() => {
    if (reduce) {
      setUseOrbit(false)
      return
    }
    setUseOrbit(hasWebGL())
  }, [reduce])

  useEffect(() => {
    if (!useOrbit) return
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (
        event.data &&
        typeof event.data === 'object' &&
        event.data.type === 'orbit-scroll-down'
      ) {
        document
          .getElementById('hero-finder')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [useOrbit])

  if (!useOrbit) {
    return <StaticShelf books={books} locale={locale} />
  }

  const src = `/orbit/index.html?embed=1&locale=${encodeURIComponent(locale)}`

  return (
    <iframe
      title="The Orbit — Belief Changer library"
      src={src}
      className="h-full w-full border-0 bg-canvas"
      // Orbit owns its own keyboard/wheel; allow autoplay-free WebGL.
      allow="fullscreen"
      loading="eager"
    />
  )
}
