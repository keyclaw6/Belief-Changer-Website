import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { assetPath } from '~/lib/deployment'
import { BookCover } from '~/components/BookCover'
import './cinematic-window-r9.css'

/**
 * CinematicWindowR9: Track A R9 shared-camera spike ("one camera").
 *
 * R8 proved the still: the approved plate + live DOM copy + the immutable
 * Sugar Trap cover as a bound volume (fore-edge shell, one owned contact
 * shadow, 2px sill lip). R9 tests ONE thing on top of that still: can the
 * cheapest honest shared-camera drift make the book, sill, and room read as
 * one camera, without reopening seams, holes, halo, or base contact?
 *
 * Mechanism (deliberately the cheapest that stays honest):
 * - The whole stage interior (plate + copy + book assembly) lives on ONE
 *   rigid `.r9-rig`. Fine-pointer X position eases the entire rig ±14px
 *   (~1% of a 1440 stage, ceiling 3%) via a single rAF-lerped
 *   `translate3d(x, 0, 0)`. Everything moves together, so front-face
 *   registration, shell overlap, and base contact cannot open by
 *   construction: there are no independently sliding layers.
 * - The stage overflow-clips the rig, which overscans by 18px per side, so
 *   drift never exposes an edge. The reveal at the frame edges reads as a
 *   camera looking around inside a window (the route's namesake).
 * - No depth estimator, no cutout planes, no Canvas/WebGL, no Three/GSAP/
 *   Lenis/motion, no gyro, no scroll coupling: CSS/DOM planes prove the
 *   mechanism with zero new dependencies and zero new image assets.
 * - The cover node itself is never transformed, filtered, cropped, tinted,
 *   or re-lit (transform sits on the ancestor rig; `.r9-face img` keeps
 *   filter/transform none and its shadow neutralized, exactly like R8).
 * - Static poster everywhere else: touch/coarse pointers, no-hover, reduced
 *   motion, and pre-hydration SSR all render the identical R8-grade still.
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

/** Single-axis drift ceiling in px. ~1% of a 1440 stage; hard ceiling is 3%. */
export const R9_DRIFT_MAX = 14
/** Rig overscan per side in px. Must exceed R9_DRIFT_MAX so no edge exposes. */
export const R9_OVERSCAN = 18

export function CinematicWindowR9({ locale, book }: { locale: Locale; book: Book }) {
  const copy = COPY[locale]
  const sample = book.chapters.find((c) => c.body && c.body.length > 0)
  const readHref = localePath(locale, `/books/${book.slug}/read/${sample?.n ?? 1}`)
  const avif = (w: number) => assetPath(`/responsive/site/a-r7-plate-${w}.avif`)
  const webp = (w: number) => assetPath(`/responsive/site/a-r7-plate-${w}.webp`)
  const stageRef = useRef<HTMLElement>(null)
  const rigRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    const rig = rigRef.current
    if (!stage || !rig) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return
    let target = 0
    let current = 0
    let raf = 0
    let active = false
    const render = () => {
      current += (target - current) * 0.08
      if (Math.abs(target - current) < 0.05) current = target
      // Single axis, transform-only. Y stays 0 by construction.
      rig.style.transform = `translate3d(${current.toFixed(2)}px, 0, 0)`
      if (current !== target) {
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
      if (r.width === 0) return
      const nx = (e.clientX - r.left) / r.width - 0.5
      const clamped = Math.max(-0.5, Math.min(0.5, nx))
      target = clamped * 2 * R9_DRIFT_MAX
      kick()
    }
    const onLeave = () => {
      target = 0
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
    <section className="r9-scene" aria-labelledby="r9-title">
      <figure ref={stageRef} className="r9-stage" aria-describedby="r9-scene-note">
        <div ref={rigRef} className="r9-rig">
          <picture className="r9-plate" aria-hidden="true">
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
          <div className="r9-copy">
            <h1 id="r9-title" className="r9-title">{book.title}</h1>
            <p className="r9-factual">{copy.factual}</p>
          </div>
          <div className="r9-book">
            <span className="r9-shell" aria-hidden="true">
              <span className="r9-board" />
              <span className="r9-pages" />
            </span>
            <div className="r9-face">
              <BookCover book={book} priority sizes="(max-width: 900px) 44vw, 240px" />
            </div>
            <span className="r9-contact" aria-hidden="true" />
            <span className="r9-sill" aria-hidden="true" />
          </div>
        </div>
        <span id="r9-scene-note" className="r9-sr">{copy.sceneNote}</span>
      </figure>
      <p className="r9-action">
        <Link className="r9-link" to={readHref}>{copy.read}</Link>
      </p>
    </section>
  )
}
