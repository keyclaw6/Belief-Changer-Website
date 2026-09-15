import { Link } from '@tanstack/react-router'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { assetPath } from '~/lib/deployment'
import { BookCover } from '~/components/BookCover'
import './cinematic-window-r8.css'

/**
 * CinematicWindowR8: Track A R8 material-belonging spike ("bound volume").
 *
 * R7 proved the atmosphere with the exact frontal cover as a zero-thickness
 * plane. R8 tests ONE thing: do deterministic, textless physical-support
 * layers around/behind the untouched cover make it read as the front face of
 * a bound volume, without weakening the full-frame still.
 *
 * What is built (R7 route/component/css are preserved unchanged):
 * - The same approved photographic plate, same full-bleed figure, same
 *   decorative semantics; the DOM owns all copy and links.
 * - Live editorial copy (H1 = the featured book title, one factual line)
 *   seated right of the plate's left corner shadow band, in the safe plaster
 *   field. No card, no scrim, no baked-in text.
 * - The immutable Sugar Trap cover via BookCover with zero alteration (no
 *   crop, tint, filter, re-light, or transform of the cover node itself),
 *   plus a narrow CSS fore-edge shell (board lip + page block) protruding on
 *   the physical right, exactly one owned contact shadow, and a 2px sill lip
 *   seating the base. Never mirrored in RTL.
 * - The reading action is one ordinary link. No <details> gate, no JS.
 *
 * Static approval first: no drift, parallax, sticky rail, transition, or
 * animation anywhere in this slice. No new dependency.
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

export function CinematicWindowR8({ locale, book }: { locale: Locale; book: Book }) {
  const copy = COPY[locale]
  const sample = book.chapters.find((c) => c.body && c.body.length > 0)
  const readHref = localePath(locale, `/books/${book.slug}/read/${sample?.n ?? 1}`)
  const avif = (w: number) => assetPath(`/responsive/site/a-r7-plate-${w}.avif`)
  const webp = (w: number) => assetPath(`/responsive/site/a-r7-plate-${w}.webp`)

  return (
    <section className="r8-scene" aria-labelledby="r8-title">
      <figure className="r8-stage" aria-describedby="r8-scene-note">
        <picture className="r8-plate" aria-hidden="true">
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
        <div className="r8-copy">
          <h1 id="r8-title" className="r8-title">{book.title}</h1>
          <p className="r8-factual">{copy.factual}</p>
        </div>
        <div className="r8-book">
          <span className="r8-shell" aria-hidden="true">
            <span className="r8-board" />
            <span className="r8-pages" />
          </span>
          <div className="r8-face">
            <BookCover book={book} priority sizes="(max-width: 900px) 44vw, 240px" />
          </div>
          <span className="r8-contact" aria-hidden="true" />
          <span className="r8-sill" aria-hidden="true" />
        </div>
        <span id="r8-scene-note" className="r8-sr">{copy.sceneNote}</span>
      </figure>
      <p className="r8-action">
        <Link className="r8-link" to={readHref}>{copy.read}</Link>
      </p>
    </section>
  )
}
