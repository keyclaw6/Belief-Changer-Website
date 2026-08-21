import { useEffect, useRef, useState } from 'react'
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
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (reduce) {
      setUseOrbit(false)
      return
    }
    setUseOrbit(hasWebGL())
  }, [reduce])

  useEffect(() => {
    if (!useOrbit) return
    // Theme passthrough: the site owns light/dark on <html data-theme>; the
    // iframe does not inherit it. Post the resolved dark flag on mount, on
    // iframe load, on OS scheme change, and when ThemeProvider rewrites
    // data-theme (MutationObserver).
    const el = iframeRef.current
    if (!el) return
    const post = () => {
      if (!el.contentWindow) return
      const attr = document.documentElement.getAttribute('data-theme')
      const dark =
        attr === 'dark' ||
        ((attr === 'system' || attr == null) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      el.contentWindow.postMessage(
        { type: 'orbit-theme', dark },
        window.location.origin,
      )
    }
    post()
    el.addEventListener('load', post, { once: true })
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', post)
    const obs = new MutationObserver(post)
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => {
      el.removeEventListener('load', post)
      mq.removeEventListener('change', post)
      obs.disconnect()
    }
  }, [useOrbit])

  useEffect(() => {
    if (!useOrbit) return
    // Wheel-trap fix: report how much of the hero iframe is on screen so The
    // Orbit releases the wheel (page scrolls past) and pauses idle spin when
    // the hero is mostly out of view.
    const el = iframeRef.current
    if (!el) return
    const post = () => {
      if (!el.contentWindow) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const frac = (Math.min(rect.bottom, vh) - Math.max(rect.top, 0)) / vh
      const visible = Math.max(0, Math.min(1, frac)) > 0.5
      el.contentWindow.postMessage(
        { type: 'orbit-hero-visibility', visible },
        window.location.origin,
      )
    }
    post()
    el.addEventListener('load', post, { once: true })
    window.addEventListener('scroll', post, { passive: true })
    window.addEventListener('resize', post)
    return () => {
      el.removeEventListener('load', post)
      window.removeEventListener('scroll', post)
      window.removeEventListener('resize', post)
    }
  }, [useOrbit])

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
      ref={iframeRef}
      title="The Orbit — Belief Changer library"
      src={src}
      className="h-full w-full border-0 bg-canvas"
      // Orbit owns its own keyboard/wheel; allow autoplay-free WebGL.
      allow="fullscreen"
      loading="eager"
    />
  )
}
