import { assetPath } from '~/lib/deployment'
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
    const gl = canvas.getContext('webgl2')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(gl)
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

export function ShelfStage({ books, locale, onInspectChange }: { books: Book[]; locale: Locale; onInspectChange?: (value: boolean) => void }) {
  const reduce = useReducedMotion()
  const [useOrbit, setUseOrbit] = useState(false)
  const [ready, setReady] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    setReady(false)
    setUseOrbit(!reduce && !connection?.saveData && hasWebGL())
  }, [reduce])

  useEffect(() => {
    if (!useOrbit) return
    const frame = iframeRef.current
    if (!frame) return
    let timeout: ReturnType<typeof setTimeout> | undefined
    const fail = () => { setReady(false); setUseOrbit(false); onInspectChange?.(false) }
    const armTimeout = () => { clearTimeout(timeout); timeout = setTimeout(fail, 20000) }
    const postEnvironment = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      const dark = theme === 'dark' || ((theme == null || theme === 'system') && matchMedia('(prefers-color-scheme: dark)').matches)
      const rect = frame.getBoundingClientRect()
      const visibleHeight = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0))
      const visible = visibleHeight / Math.max(1, Math.min(rect.height, innerHeight)) > 0.1
      frame.contentWindow?.postMessage({ type: 'orbit-theme', dark }, location.origin)
      frame.contentWindow?.postMessage({ type: 'orbit-hero-visibility', visible }, location.origin)
    }
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.contentWindow || !event.data) return
      switch (event.data.type) {
        case 'orbit-ready': clearTimeout(timeout); setReady(true); postEnvironment(); break
        case 'orbit-error': fail(); break
        case 'orbit-state': onInspectChange?.(!['orbit', 'presenting'].includes(event.data.state)); break
        case 'orbit-context-lost': setReady(false); armTimeout(); break
        case 'orbit-scroll-down':
          document.getElementById('hero-finder')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
          break
      }
    }
    const themeObserver = new MutationObserver(postEnvironment)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const visibility = new IntersectionObserver(postEnvironment, { threshold: [0, .1, .5, 1] })
    visibility.observe(frame)
    const scheme = matchMedia('(prefers-color-scheme: dark)')
    scheme.addEventListener('change', postEnvironment)
    window.addEventListener('message', receive)
    frame.addEventListener('load', postEnvironment)
    armTimeout()
    postEnvironment()
    return () => {
      clearTimeout(timeout)
      themeObserver.disconnect(); visibility.disconnect()
      scheme.removeEventListener('change', postEnvironment)
      window.removeEventListener('message', receive)
      frame.removeEventListener('load', postEnvironment)
    }
  }, [useOrbit, locale, reduce, onInspectChange])

  return (
    <div className="relative h-full w-full">
      {!ready ? <div className="absolute inset-0 flex items-center justify-center px-6 py-24"><div className="h-[min(55vh,360px)] w-full"><StaticShelf books={books} locale={locale} /></div></div> : null}
      {useOrbit ? (
        <iframe
          key={locale}
          ref={iframeRef}
          data-orbit-frame="true"
          title={locale === 'ar' ? 'مكتبة الكتب التفاعلية' : locale === 'da' ? 'Det interaktive bibliotek' : 'The Orbit — interactive book library'}
          src={assetPath(`/orbit/index.html?embed=1&locale=${encodeURIComponent(locale)}`)}
          className="absolute inset-0 h-full w-full border-0 bg-canvas"
          style={{ opacity: ready ? 1 : 0, pointerEvents: ready ? 'auto' : 'none' }}
          aria-hidden={!ready}
          tabIndex={ready ? 0 : -1}
          loading="eager"
          onError={() => { setUseOrbit(false); setReady(false) }}
        />
      ) : null}
    </div>
  )
}
