import { assetPath } from '~/lib/deployment'
import { responsiveImage } from '~/lib/responsive-image'
import type { Book } from '~/data/types'
import { cn } from '~/lib/utils'

/**
 * BookCover: a book, rendered as a book. The photorealistic cover art carries
 * its own ground and the site's richest color; over it we render the book's
 * TITLE as live text in the upper negative space (the art was composed for
 * exactly this) plus the small letterspaced BELIEF CHANGER series mark at the
 * foot. Target look: assets/covers/proofs/with-text-*.png.
 *
 * The title is set in Newsreader, the one sanctioned place a serif appears
 * outside the reader (DESIGN.md, 00-global.md): the cover IS the book, so it
 * gets book typography. Per-book ink (charcoal on light grounds, bone on dark)
 * comes from the manifest via the book's overlayInk.
 *
 * Because a cover renders at many sizes (a ~150px hero spine, a ~300px grid
 * card, a large book-page cover), the overlay type is sized in container-query
 * width units (`cqw`) against the cover's own box, so the title fills the same
 * fraction of the artwork at every size, exactly like the printed proof. Any
 * language works, since it is live text.
 *
 * The art itself is NEVER cropped (object-contain, true 2:3), tinted, or re-lit.
 * On very light grounds a 1px hairline keeps the cover edge defined on white.
 */

/** Resolve the manifest ink name to a hex (charcoal #2F3437, bone #F5F1E8). */
function inkHex(ink: Book['overlayInk']): string {
  return ink === 'bone' ? '#F5F1E8' : '#2F3437'
}

// Grounds at or above this perceived lightness get a hairline edge on white.
// Sampled from covers-manifest.json ground hexes: the dove/bone covers (sugar
// #DBD9D8, porn #CEC7BC, complaining #E1C5A0) need it; the saturated ones do
// not. We compute luminance so this holds if the fixtures change.
function isLightGround(hex: string): boolean {
  const m = hex.replace('#', '')
  if (m.length !== 6) return false
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.78
}

export function BookCover({
  book,
  className,
  priority = false,
  sizes,
  showTitle = true,
}: {
  book: Book
  className?: string
  priority?: boolean
  sizes?: string
  /** Render the live-text title + series mark. On by default (site-wide rule). */
  showTitle?: boolean
}) {
  const image = responsiveImage(book.cover)
  const needsHairline = isLightGround(book.groundHex)
  const ink = inkHex(book.overlayInk)

  return (
    <div
      className={cn('relative block', className)}
      // Establish a container so the overlay type can scale in cqw against the
      // cover's own width at any render size.
      style={{ containerType: 'inline-size', aspectRatio: '2 / 3' }}
    >
      <picture>
        {image.srcSet ? <source type="image/webp" srcSet={image.srcSet} sizes={sizes || '(max-width: 640px) 45vw, 320px'} /> : null}
      <img
        src={assetPath(book.cover)}
        alt=""
        aria-hidden="true"
        loading={priority ? 'eager' : 'lazy'}
        className={cn(
          'block h-full w-full rounded-[2px] object-contain',
          needsHairline && 'ring-1 ring-[var(--color-hairline-on-image)]',
        )}
        style={{ boxShadow: 'var(--shadow-cover)' }}
        sizes={sizes || '(max-width: 640px) 45vw, 320px'}
        width={image.width}
        height={image.height}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
      </picture>

      {showTitle ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col items-center rounded-[2px]"
        >
          {/* Title in the upper negative space, matching the proof's placement:
              sits a little above the vertical middle, generous line-height for
              two-word wraps ("The Sugar Trap"). Newsreader, per-book ink. */}
          <div
            className="flex flex-1 items-start justify-center px-[9%] text-center"
            style={{ paddingTop: '20%' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-reader)',
                fontWeight: 400,
                color: ink,
                fontSize: '15.5cqw',
                lineHeight: 1.06,
                letterSpacing: '-0.005em',
                textWrap: 'balance',
              }}
            >
              {book.title}
            </span>
          </div>

          {/* Series mark at the foot: small, wide letterspacing, DM Sans caps. */}
          <span
            className="pb-[8%] text-center uppercase"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              color: ink,
              fontSize: '3.4cqw',
              letterSpacing: '0.34em',
              // Nudge the tracked caps so they stay optically centered (the
              // trailing letterspace pushes the block right otherwise).
              textIndent: '0.34em',
              opacity: 0.85,
            }}
          >
            Belief Changer
          </span>
        </div>
      ) : null}
    </div>
  )
}
