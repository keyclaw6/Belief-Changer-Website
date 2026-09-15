import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { assetPath } from '~/lib/deployment'
import { BookCover } from '~/components/BookCover'
import './cinematic-window-r13.css'

/**
 * CinematicWindowR13: Track A R13 plate-aware belonging spike ("one leaf").
 *
 * R8 banked the best static composition (approved plate + live DOM copy +
 * the immutable Sugar Trap cover as a bound volume: fore-edge shell, one
 * owned contact shadow, CSS sill lip). R9's rigid whole-scene drift is a
 * visual KILL: it moves everything as one camera, so it can never reveal
 * depth. R13 tests ONE thing on top of the banked still: can one tiny,
 * genuine plate-aware foreground occluder make the book belong to the sill?
 *
 * Mechanism (the only honest leaf this plate supports):
 * - The book is re-seated DOWN to the sill's rounded nosing (base at plate
 *   y ~704, left/height unchanged), standing a few cm behind the edge: its
 *   near corner kisses the roll, the far side stands back over the surface.
 * - ONE plate-derived foreground cutout (verbatim pixels of the served
 *   plate, alpha-cut along the nosing's own roll-top contour, full-canvas
 *   so it registers by construction) overlaps the book's base by ~11px at
 *   the near corner, tapering to a kiss at the far side. Plate, shell,
 *   cover, copy: unchanged and untouched.
 * - Inspection drift moves ONLY the foreground leaf (±6px X, ±3px Y,
 *   eased, fine-pointer, no-preference, scroll-independent): the occluding
 *   edge breathes 1–4px over the book base (visible parallax truth) while
 *   the feathered surround smears invisibly over identical plate pixels.
 *   Plate, book, and copy never move: there is no shared-camera gimmick.
 * - Static poster everywhere else: touch/coarse pointers, no-hover,
 *   reduced motion, and pre-hydration SSR all render the registered still
 *   (JS bails; CSS pins transform none under reduced motion).
 *
 * What is deliberately NOT built: generated replacement scenes, cover
 * derivatives, any crop/tint/filter/relight/mask on the cover node,
 * Three.js, GSAP, Lenis, depth-map runtimes, video, scroll-scrub,
 * global zoom. If the cutout cannot stay registered, it is removed and
 * R13 is reported KILL, not faked.
 */

type Copy = {
  factual: string
  sceneNote: string
  read: string
}

const COPY: Record<Locale, Copy> = {
  en: {
    factual: 'Free to read. No signup. No tracking.',
    sceneNote:
      'A bound book standing upright on a pale limestone sill against deep-green joinery, limewashed plaster at the side, a quiet tree-lined street beyond the glass.',
    read: 'Read the sample chapter',
  },
  da: {
    factual: 'Gratis at læse. Ingen tilmelding. Ingen sporing.',
    sceneNote:
      'En indbundet bog står oprejst på en lys stenkarm op ad mørkegrønne rammer, kalket puds ved siden, en stille træbeklædt gade bag ruden.',
    read: 'Læs uddraget',
  },
  ar: {
    factual: 'مجاني للقراءة. بلا تسجيل. بلا تتبع.',
    sceneNote: 'كتاب مجلد واقف على عتبة حجرية فاتحة أمام نجارة خضراء داكنة، وجدار مغطى بالجير، وشارع هادئ تصطف عليه الأشجار خلف الزجاج.',
    read: 'اقرأ الفصل الكامل',
  },
}

const PLATE_WIDTH = 1672
const PLATE_HEIGHT = 941

/** Foreground-leaf drift ceilings in px (differential parallax, leaf only). */
export const R13_STRIP_MAX_X = 6
export const R13_STRIP_MAX_Y = 3

export function CinematicWindowR13({ locale, book }: { locale: Locale; book: Book }) {
  const copy = COPY[locale]
  const sample = book.chapters.find((c) => c.body && c.body.length > 0)
  const readHref = localePath(locale, `/books/${book.slug}/read/${sample?.n ?? 1}`)
  const avif = (w: number) => assetPath(`/responsive/site/a-r7-plate-${w}.avif`)
  const webp = (w: number) => assetPath(`/responsive/site/a-r7-plate-${w}.webp`)
  const fore = (w: number) => assetPath(`/responsive/site/a-r13-fore-${w}.webp`)
  const stageRef = useRef<HTMLElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    const strip = stripRef.current
    if (!stage || !strip) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let raf = 0
    let active = false
    const render = () => {
      cx += (tx - cx) * 0.12
      cy += (ty - cy) * 0.12
      if (Math.abs(tx - cx) < 0.05) cx = tx
      if (Math.abs(ty - cy) < 0.05) cy = ty
      // Leaf-only parallax: plate, book, and copy stay pinned. The
      // foreground occluder alone breathes over the book base.
      strip.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`
      if (cx !== tx || cy !== ty) {
        raf = requestAnimationFrame(render)
      } else {
        active = false
      }
    }
    const kick = () => {
      if (!active) {
        active = true
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(render)
      }
    }
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      tx = Math.max(-0.5, Math.min(0.5, nx)) * 2 * R13_STRIP_MAX_X
      ty = Math.max(-0.5, Math.min(0.5, ny)) * 2 * R13_STRIP_MAX_Y
      kick()
    }
    const onLeave = () => {
      tx = 0
      ty = 0
      kick()
    }
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <section className="r13-scene" aria-labelledby="r13-title">
      <figure ref={stageRef} className="r13-stage" aria-describedby="r13-scene-note">
        <picture className="r13-plate" aria-hidden="true">
          <source
            type="image/avif"
            srcSet={`${avif(768)} 768w, ${avif(1280)} 1280w, ${avif(1672)} 1672w`}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={`${webp(768)} 768w, ${webp(1280)} 1280w, ${webp(1672)} 1672w`}
            sizes="100vw"
          />
          <img
            src={webp(1280)}
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={PLATE_WIDTH}
            height={PLATE_HEIGHT}
          />
        </picture>
        <div className="r13-copy">
          <h1 id="r13-title" className="r13-title">{book.title}</h1>
          <p className="r13-factual">{copy.factual}</p>
        </div>
        <div className="r13-book">
          <span className="r13-shell" aria-hidden="true">
            <span className="r13-board" />
            <span className="r13-pages" />
          </span>
          <div className="r13-face">
            <BookCover book={book} priority sizes="(max-width: 900px) 44vw, 240px" />
          </div>
          <span className="r13-contact" aria-hidden="true" />
          <span className="r13-sill" aria-hidden="true" />
        </div>
        <div ref={stripRef} className="r13-strip" aria-hidden="true">
          <img
            className="r13-strip-img"
            srcSet={`${fore(768)} 768w, ${fore(1280)} 1280w, ${fore(1672)} 1672w`}
            sizes="100vw"
            src={fore(1280)}
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="low"
            decoding="async"
            draggable={false}
            width={PLATE_WIDTH}
            height={PLATE_HEIGHT}
          />
        </div>
        <span id="r13-scene-note" className="r13-sr">{copy.sceneNote}</span>
      </figure>
      <p className="r13-action">
        <Link className="r13-link" to={readHref}>{copy.read}</Link>
      </p>
    </section>
  )
}
