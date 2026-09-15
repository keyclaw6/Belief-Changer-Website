import { Link } from '@tanstack/react-router'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { assetPath } from '~/lib/deployment'
import { BookCover } from '~/components/BookCover'
import './cinematic-window.css'

/**
 * CinematicWindow: Track A R7 slice ("photographic still").
 *
 * R6 proved the static endpoint with a synthetic CSS aperture world. R7 tests
 * ONE thing: can the real accepted cover and live DOM copy inhabit the
 * approved photographic plate (overcast plaster + limestone sill + deep-green
 * joinery/backstop, quiet street/tree beyond) convincingly as a still.
 *
 * What is built:
 * - The photographic plate is the dominant world directly below the header
 *   (full-bleed figure, no panel/card). Optimized AVIF/WebP derivatives of
 *   /tmp/bc-image-plates/a-r7-corrected.png; the source PNG stays outside the
 *   repo. Image semantics are decorative (alt="", aria-hidden); the DOM owns
 *   all copy and links.
 * - Live editorial copy (H1 = the featured book title, one factual line) sits
 *   directly on the genuinely quiet plaster area, modest scale, no card, no
 *   scrim, no baked-in text.
 * - The immutable Sugar Trap cover renders via BookCover with zero alteration
 *   (no crop, tint, filter, re-light, or transform) standing upright on the
 *   sill, registered to the green backstop/stone surface, with one restrained
 *   contact matte outside the cover face. Never mirrored in RTL.
 * - One explicit live-DOM <details> action, "Examine a passage", below the
 *   stage on the canvas ground (unchanged R6 mechanism: native toggle, zero
 *   JS, immediate, works JS-off and under reduced motion).
 *
 * Static approval first: no drift, parallax, sticky rail, transition, or
 * animation anywhere in this slice. No new dependency.
 *
 * Layout: the stage is pinned to physical direction (ltr) so the camera
 * handedness is identical in LTR and RTL; only the text containers re-assert
 * rtl under html[dir="rtl"]. Mobile <=900px is a dedicated portrait
 * composition (full-height crop keeping plaster + backstop + joinery + sill,
 * retuned copy/book placement), not a shrunk desktop. Dark theme changes only
 * the surrounding UI; the daylight plate, the on-plate copy ink, and the cover
 * are fixed. Reduced motion is the identical static still.
 */

type Copy = {
  factual: string
  sceneNote: string
  examine: string
  source: string
  qualification: string
  read: string
}

const COPY: Record<Locale, Copy> = {
  en: {
    factual: 'Free to read. No signup. No tracking.',
    sceneNote:
      'A book standing upright on a pale limestone sill against deep-green joinery, limewashed plaster at the side, a quiet tree-lined street beyond the glass.',
    examine: 'Examine a passage',
    source: 'The Sugar Trap, chapter 1. Sample text from the book.',
    qualification: 'An excerpt, not a promise. The full sample chapter reads in about four minutes.',
    read: 'Read the sample chapter',
  },
  da: {
    factual: 'Gratis at læse. Ingen tilmelding. Ingen sporing.',
    sceneNote:
      'En bog står oprejst på en lys stenkarm op ad mørkegrønne rammer, kalket puds ved siden, en stille træbeklædt gade bag ruden.',
    examine: 'Undersøg et uddrag',
    source: 'The Sugar Trap, kapitel 1. Uddrag af bogen. Citeret på engelsk.',
    qualification: 'Et uddrag, ikke et løfte. Hele uddraget læses på cirka fire minutter.',
    read: 'Læs uddraget',
  },
  ar: {
    factual: 'مجاني للقراءة. بلا تسجيل. بلا تتبع.',
    sceneNote: 'كتاب واقف على عتبة حجرية فاتحة أمام نجارة خضراء داكنة، وجدار مغطى بالجير، وشارع هادئ تصطف عليه الأشجار خلف الزجاج.',
    examine: 'افحص مقطعا',
    source: 'The Sugar Trap، الفصل الأول. نص عيّنة من الكتاب. مقتبس بالإنجليزية.',
    qualification: 'مقتطف وليس وعدا. قراءة الفصل الكامل تستغرق نحو أربع دقائق.',
    read: 'اقرأ الفصل الكامل',
  },
}

const PLATE_WIDTH = 1672
const PLATE_HEIGHT = 941

export function CinematicWindow({ locale, book }: { locale: Locale; book: Book }) {
  const copy = COPY[locale]
  const sample = book.chapters.find((c) => c.body && c.body.length > 0)
  const readHref = localePath(locale, `/books/${book.slug}/read/${sample?.n ?? 1}`)
  // The genuine passage: the first two paragraphs of the existing sample
  // chapter body, verbatim, in the source language. Never invented.
  const passage = (sample?.body ?? []).slice(0, 2)
  const avif = (w: number) => assetPath(`/responsive/site/a-r7-plate-${w}.avif`)
  const webp = (w: number) => assetPath(`/responsive/site/a-r7-plate-${w}.webp`)

  return (
    <section className="r7-scene" aria-labelledby="r7-title">
      <figure className="r7-stage" aria-describedby="r7-scene-note">
        <picture className="r7-plate" aria-hidden="true">
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
        <div className="r7-copy">
          <h1 id="r7-title" className="r7-title">{book.title}</h1>
          <p className="r7-factual">{copy.factual}</p>
        </div>
        <div className="r7-book">
          <BookCover book={book} priority sizes="(max-width: 900px) 44vw, 240px" />
          <span className="r7-contact" aria-hidden="true" />
        </div>
        <span id="r7-scene-note" className="r7-sr">{copy.sceneNote}</span>
      </figure>
      <details className="r7-examine">
        <summary className="r7-examine-label">{copy.examine}</summary>
        <div className="r7-passage">
          <blockquote className="r7-quote">
            {passage.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </blockquote>
          <p className="r7-source">{copy.source}</p>
          <p className="r7-qual">{copy.qualification}</p>
          <p className="r7-links">
            <Link className="r7-link" to={readHref}>{copy.read}</Link>
          </p>
        </div>
      </details>
    </section>
  )
}
