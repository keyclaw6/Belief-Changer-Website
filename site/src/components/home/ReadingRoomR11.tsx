import { useCallback, useEffect, useRef, useState } from 'react'
import './reading-room-r11.css'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { BookCover } from '~/components/BookCover'
import { assetPath } from '~/lib/deployment'
import { cn } from '~/lib/utils'

/**
 * ReadingRoomR11 (Track B slice R11): one bounded mechanism on top of the R10
 * static baseline — shelf book pickup / desk set-down.
 *
 * Isolated to the /{locale}/reading-room-r11 route. R9 (homepage slice) and
 * R10 (static baseline + its route) are untouched; the static geometry, copy,
 * plate, registration and tokens below are copied verbatim from R10 so the
 * reduced-motion path renders byte/pixel-equivalent to R10.
 *
 * Mechanism: choosing a shelf book flies THAT shelf node (FLIP) from its ash
 * slot to the desk. The outgoing desk copy yields (fades down) while the
 * incoming travels; at commit the desk shows the incoming and the shelf shows
 * the outgoing. Exactly one physical node per title at every instant: no
 * clone, no duplicate cover, no vacancy placeholder, no dashed recess.
 *
 * Deterministic phase machine: idle -> lift -> carry -> settle -> idle.
 * LIFT 120ms (incoming breathes up 2px, carried shadow fades in, outgoing
 * starts yielding), CARRY 320ms (incoming travels shelf origin -> desk,
 * growing to desk size), SETTLE 160ms (incoming rests at desk geometry; the
 * commit then hands it to the desk node in one calm cut, R10-style). Total
 * 600ms <= 700ms.
 * A desired-target queue (pendingRef) absorbs rapid selections: clicks during
 * a transfer only record the latest desired slug; transfers never overlap and
 * never interrupt — the queue drains one transfer at a time toward the latest
 * target. transform/opacity only; no GSAP/Lenis/WebGL/video/new deps.
 *
 * Reduced motion: matchMedia instant-cuts to the R10 static state (no
 * transfer object is ever created) and the CSS reduce block pins every
 * transition/animation to none.
 *
 * Focus: shelf covers stay native buttons; focus is never moved or blurred by
 * the machine. If the focused shelf node unmounts at commit (it became the
 * desk book, exactly as in R10), focus is rescued to the newly shelved
 * outgoing book so keyboard users never drop to <body>.
 */

const COPY: Record<
  Locale,
  {
    eyebrow: string
    title: string
    body: string
    shelfLabel: string
    readChapter: string
    selectedAnnounced: string
  }
> = {
  en: {
    eyebrow: 'The reading room',
    title: 'Pick a book up, read a little.',
    body: 'Four small books about everyday habits. Pick one up from the shelf.',
    shelfLabel: 'On the shelf',
    readChapter: 'Read chapter 1',
    selectedAnnounced: 'Selected',
  },
  da: {
    eyebrow: 'Læsestuen',
    title: 'Tag en bog ned, læs lidt.',
    body: 'Fire små bøger om hverdagens vaner. Tag en ned fra hylden.',
    shelfLabel: 'På hylden',
    readChapter: 'Læs kapitel 1',
    selectedAnnounced: 'Valgt',
  },
  ar: {
    eyebrow: 'غرفة القراءة',
    title: 'تناول كتابا واقرأ قليلا.',
    body: 'أربعة كتب صغيرة عن عادات اليوم. تناول واحدا من الرف.',
    shelfLabel: 'على الرف',
    readChapter: 'اقرأ الفصل الأول',
    selectedAnnounced: 'تم اختيار',
  },
}

// Phase durations (ms). Sum = 600 <= 700 budget. Single source of truth for
// both the machine and the R11 contract test.
export const R11_LIFT_MS = 120
export const R11_CARRY_MS = 320
export const R11_SETTLE_MS = 160
export const R11_TOTAL_MS = R11_LIFT_MS + R11_CARRY_MS + R11_SETTLE_MS

type Phase = 'lift' | 'carry' | 'settle'

interface Transfer {
  /** Committed desk book that is yielding. */
  fromSlug: string
  /** Shelf book travelling to the desk. */
  toSlug: string
  phase: Phase
  /** Shelf-origin -> desk-destination delta, px in stage space. */
  dx: number
  dy: number
  /** Origin width / desk width: the incoming grows as it lands. */
  scale: number
}

export function ReadingRoomR11({ locale, books }: { locale: Locale; books: Book[] }) {
  const copy = COPY[locale]
  if (books.length === 0) return null
  const fallback = books.find((b) => b.slug === 'scrolling') ?? books[0]!
  const [selectedSlug, setSelectedSlug] = useState(fallback.slug)
  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const selected = books.find((b) => b.slug === selectedSlug) ?? fallback
  // The ash shelf holds the other titles only: never the selected one, so
  // the selected book exists as exactly one physical node on the desk.
  const shelf = books.filter((b) => b.slug !== selected.slug).slice(0, 3)

  const stageRef = useRef<HTMLDivElement>(null)
  const deskRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef(new Map<string, HTMLButtonElement>())
  const timers = useRef<number[]>([])
  const pendingRef = useRef<string | null>(null)
  const transferRef = useRef<Transfer | null>(null)
  const selectedRef = useRef(selectedSlug)
  selectedRef.current = selectedSlug
  transferRef.current = transfer
  useEffect(() => () => {
    for (const t of timers.current) window.clearTimeout(t)
  }, [])

  const reducedMotion = useCallback(() => {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  /** Focus rescue: if commit unmounted the focused node, land on the newly
   *  shelved outgoing book instead of dropping to <body>. */
  const rescueFocus = useCallback((outgoingSlug: string) => {
    if (document.activeElement === document.body) {
      btnRefs.current.get(outgoingSlug)?.focus()
    }
  }, [])

  const commit = useCallback(
    (toSlug: string, fromSlug: string) => {
      setSelectedSlug(toSlug)
      setTransfer(null)
      transferRef.current = null
      // The Read link + SR status retarget on commit via selectedSlug.
      requestAnimationFrame(() => rescueFocus(fromSlug))
      const next = pendingRef.current
      pendingRef.current = null
      if (next && next !== toSlug) {
        // Drain the queue toward the latest desired target.
        requestAnimationFrame(() => startTransfer(next))
      }
    },
    // startTransfer is stable via refs; defined below with function hoisting
    // through ref indirection to keep the queue drain deterministic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const startTransfer = useCallback(
    (toSlug: string) => {
      const fromSlug = selectedRef.current
      if (toSlug === fromSlug || transferRef.current) {
        // Already there, or a transfer is flying: queue the latest desire.
        if (toSlug !== fromSlug) pendingRef.current = toSlug
        return
      }
      if (reducedMotion()) {
        setSelectedSlug(toSlug)
        return
      }
      const stage = stageRef.current
      const btn = btnRefs.current.get(toSlug)
      const desk = deskRef.current
      if (!stage || !btn || !desk) {
        setSelectedSlug(toSlug)
        return
      }
      const s = stage.getBoundingClientRect()
      const o = btn.getBoundingClientRect()
      const d = desk.getBoundingClientRect()
      if (o.width === 0 || d.width === 0) {
        setSelectedSlug(toSlug)
        return
      }
      const dx = o.left + o.width / 2 - (d.left + d.width / 2)
      const dy = o.top + o.height / 2 - (d.top + d.height / 2)
      const scale = o.width / d.width
      timers.current.push(
        window.setTimeout(() => setTransfer((t) => (t ? { ...t, phase: 'carry' } : t)), R11_LIFT_MS),
        window.setTimeout(() => setTransfer((t) => (t ? { ...t, phase: 'settle' } : t)), R11_LIFT_MS + R11_CARRY_MS),
        window.setTimeout(() => commit(toSlug, fromSlug), R11_TOTAL_MS),
      )
      setTransfer({ fromSlug, toSlug, phase: 'lift', dx, dy, scale })
    },
    [commit, reducedMotion],
  )

  // Keep commit's queue-drain pointed at the latest startTransfer.
  const startRef = useRef(startTransfer)
  startRef.current = startTransfer
  const requestSelect = useCallback((slug: string) => {
    if (transferRef.current) {
      if (slug !== selectedRef.current) pendingRef.current = slug
      return
    }
    startRef.current(slug)
  }, [])

  const readHref = localePath(locale, `/books/${selected.slug}/read/1`)
  const flying = transfer

  return (
    <section aria-labelledby="reading-room-r11-title" className="reading-room-r11">
      {/* The room stage: the photographic plate IS the layout. Copy, shelf
          and desk all live inside this rect; nothing sits above it. */}
      <div ref={stageRef} className="reading-room-r11__stage">
        <picture className="reading-room-r11__plate" aria-hidden="true">
          <source
            type="image/avif"
            srcSet={`${assetPath('/site/reading-room-r9-960.avif')} 960w, ${assetPath('/site/reading-room-r9-1536.avif')} 1536w`}
            sizes="(max-width: 640px) 100vw, 100vw"
          />
          <source
            type="image/webp"
            srcSet={`${assetPath('/site/reading-room-r9-960.webp')} 960w, ${assetPath('/site/reading-room-r9-1536.webp')} 1536w`}
            sizes="(max-width: 640px) 100vw, 100vw"
          />
          <img
            src={assetPath('/site/reading-room-r9-1536.webp')}
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={1536}
            height={1024}
            className="reading-room-r11__plate-img"
          />
        </picture>

        {/* Live DOM copy in the quiet plaster negative space. No card, no
            scrim, no baked text: ink straight on the chalk wall. */}
        <div className="reading-room-r11__copy">
          <p className="reading-room-r11__eyebrow">{copy.eyebrow}</p>
          <h1 id="reading-room-r11-title" className="reading-room-r11__title">
            {copy.title}
          </h1>
          <p className="reading-room-r11__body">{copy.body}</p>
          <p className="reading-room-r11__actions">
            <Link to={readHref} className={cn('reading-room-r11__read')}>
              {copy.readChapter}
              <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
            </Link>
          </p>
        </div>

        {/* Ash shelf: the other titles only, upright, feet on the board.
            Covers are the direct keyboard controls. camera-fixed: physical
            left registration, never mirrored. The travelling node is the
            shelf button itself (FLIP), so focus never leaves its control. */}
        <ul className="reading-room-r11__shelf" aria-label={copy.shelfLabel}>
          {shelf.map((book, i) => {
            const isFlying = flying?.toSlug === book.slug
            const f = flying && isFlying ? flying : null
            return (
              <li key={book.slug} className={`reading-room-r11__slot reading-room-r11__slot--${i + 1}`}>
                <button
                  type="button"
                  aria-label={book.title}
                  ref={(el) => {
                    if (el) btnRefs.current.set(book.slug, el)
                    else btnRefs.current.delete(book.slug)
                  }}
                  onClick={() => requestSelect(book.slug)}
                  className={cn('reading-room-r11__shelf-btn', f && `reading-room-r11__shelf-btn--${f.phase}`)}
                  data-flying={f ? f.phase : undefined}
                  style={
                    f
                      ? ({
                          '--r11-dx': `${f.dx.toFixed(1)}px`,
                          '--r11-dy': `${f.dy.toFixed(1)}px`,
                          '--r11-scale': f.scale.toFixed(4),
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <BookCover book={book} sizes="(max-width: 640px) 15vw, 9vw" />
                  {/* Carried shadow: a static soft ellipse whose opacity only
                      ramps with the lift. transform/opacity only, never
                      filter/box-shadow animation. */}
                  <span className="reading-room-r11__fly-shadow" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>

        {/* Desk landing area: the one bound book rests here. During a
            transfer the outgoing yields (fades down) while the incoming
            travels; the desk retargets at commit. */}
        <div
          ref={deskRef}
          key={selected.slug}
          className={cn('reading-room-r11__deskbook', flying && 'reading-room-r11__deskbook--yielding')}
          role="img"
          aria-label={selected.title}
        >
          <BookCover
            book={selected}
            priority
            sizes="(max-width: 640px) 30vw, 15vw"
            className="reading-room-r11__book-face"
          />
          {/* Neutral fore-edge page block: adjacent element, never
              cover pixels. */}
          <span className="reading-room-r11__edge" aria-hidden="true" />
        </div>

        {/* Screen-reader-only selection announcement. The visible readout
            is gone; AT users still hear the consequence of choosing. */}
        <p className="reading-room-r11__srstatus" role="status">
          {copy.selectedAnnounced}: {selected.title}
        </p>
      </div>
    </section>
  )
}
