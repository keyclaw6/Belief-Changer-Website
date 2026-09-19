import { Link } from '@tanstack/react-router'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { assetPath } from '~/lib/deployment'
import { BookCover } from '~/components/BookCover'
import './cinematic-window-r14.css'

/**
 * CinematicWindowR14: Track A final ("Cinematic Life Outside").
 *
 * One authored physical scene with the immutable Sugar Trap cover as a bound
 * volume standing on the plate's own limestone sill. Still composition, zero
 * client JS: SSR HTML is the final experience (hydration changes nothing).
 *
 * Plates (immutable input, selected by visual review):
 * - desktop: a-r14-master-desktop.png (1536x1024), served as responsive
 *   a-r14-plate renditions; stage aspect 3/2 maps plate fractions 1:1.
 * - mobile: a-r14-master-mobile.png (941x1672), a separately composed
 *   portrait photograph (not a crop); served as a-r14-platem renditions;
 *   stage aspect 941/1672 maps plate fractions 1:1.
 *
 * Seat (reserved in the plates and verified against served pixels):
 * - book face 2:3 at left 27%, top 31%, height 44% (base 75%) on both plates.
 * - ONE honest foreground occluder per plate: the sill's own rounded nosing
 *   (desktop y=0.032x+743, base 768; mobile y=0.031x+1227, base 1254),
 *   verbatim plate RGB with alpha cut along the traced crown. Tuck is
 *   ~12px tapering to a kiss: contact you believe, not an effect you notice.
 *   No other architecture is invented; green joinery stays behind the book.
 * - Deterministic shell (fore-edge boards + page block, physical right only),
 *   one owned contact shadow peeking past the volume onto the seat, no
 *   filter/tint/relight/transform on the cover face, no sill-lip line (the
 *   real nosing is the lip), no parallax, no animation of any kind.
 *
 * Copy lives in the plates' calm plaster field as live DOM (no card, no
 * scrim): the book title plus one factual line, and one reading action below
 * the stage. Dark theme keeps the authored daylight photograph (dimming it
 * would fake a night scene); only surrounding chrome darkens. The stage is
 * pinned ltr so RTL never mirrors the physical scene or cover; only copy
 * alignment follows the document direction.
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
      'A bound book standing upright on a pale limestone sill against limewashed plaster, a deep-green window frame beside it, a quiet tree-lined street beyond the glass.',
    read: 'Read the sample chapter',
  },
  da: {
    factual: 'Gratis at læse. Ingen tilmelding. Ingen sporing.',
    sceneNote:
      'En indbundet bog står oprejst på en lys stenkarm op ad kalket puds, en mørkegrøn vinduesramme ved siden, en stille træbeklædt gade bag ruden.',
    read: 'Læs uddraget',
  },
  ar: {
    factual: 'مجاني للقراءة. بلا تسجيل. بلا تتبع.',
    sceneNote: 'كتاب مجلد واقف على عتبة حجرية فاتحة أمام جدار مغطى بالجير، وإطار نافذة أخضر داكن بجانبه، وشارع هادئ تصطف عليه الأشجار خلف الزجاج.',
    read: 'اقرأ الفصل الكامل',
  },
}

const PLATE_W = 1536
const PLATE_H = 1024

export function CinematicWindowR14({ locale, book }: { locale: Locale; book: Book }) {
  const copy = COPY[locale]
  const sample = book.chapters.find((c) => c.body && c.body.length > 0)
  const readHref = localePath(locale, `/books/${book.slug}/read/${sample?.n ?? 1}`)
  const plate = (w: number, ext: 'avif' | 'webp') =>
    assetPath(`/responsive/site/a-r14-plate-${w}.${ext}`)
  const platem = (w: number, ext: 'avif' | 'webp') =>
    assetPath(`/responsive/site/a-r14-platem-${w}.${ext}`)
  const fore = assetPath('/responsive/site/a-r14-fore.webp')
  const forem = assetPath('/responsive/site/a-r14-forem.webp')

  return (
    <section className="r14-scene" aria-labelledby="r14-title">
      <figure className="r14-stage" aria-describedby="r14-scene-note">
        <picture className="r14-plate" aria-hidden="true">
          <source
            media="(max-width: 900px)"
            type="image/avif"
            srcSet={`${platem(480, 'avif')} 480w, ${platem(768, 'avif')} 768w, ${platem(941, 'avif')} 941w`}
            sizes="100vw"
          />
          <source
            media="(max-width: 900px)"
            type="image/webp"
            srcSet={`${platem(480, 'webp')} 480w, ${platem(768, 'webp')} 768w, ${platem(941, 'webp')} 941w`}
            sizes="100vw"
          />
          <source
            type="image/avif"
            srcSet={`${plate(768, 'avif')} 768w, ${plate(1280, 'avif')} 1280w, ${plate(1536, 'avif')} 1536w`}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={`${plate(768, 'webp')} 768w, ${plate(1280, 'webp')} 1280w, ${plate(1536, 'webp')} 1536w`}
            sizes="100vw"
          />
          <img
            src={plate(1280, 'webp')}
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={PLATE_W}
            height={PLATE_H}
          />
        </picture>
        <div className="r14-copy">
          <h1 id="r14-title" className="r14-title">{book.title}</h1>
          <p className="r14-factual">{copy.factual}</p>
        </div>
        <div className="r14-book">
          <span className="r14-shell" aria-hidden="true">
            <span className="r14-board" />
            <span className="r14-pages" />
          </span>
          <div className="r14-face">
            <BookCover book={book} priority sizes="(max-width: 900px) 52vw, 280px" />
          </div>
          <span className="r14-contact" aria-hidden="true" />
        </div>
        <picture className="r14-fore" aria-hidden="true">
          <source media="(max-width: 900px)" srcSet={forem} />
          <img
            className="r14-fore-img"
            src={fore}
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="low"
            decoding="async"
            draggable={false}
            width={380}
            height={80}
          />
        </picture>
        <span id="r14-scene-note" className="r14-sr">{copy.sceneNote}</span>
      </figure>
      <p className="r14-action">
        <Link className="r14-link" to={readHref}>{copy.read}</Link>
      </p>
    </section>
  )
}
