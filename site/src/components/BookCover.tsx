import type { Book } from '~/data/types'
import { cn } from '~/lib/utils'

/**
 * BookCover: the photorealistic cover, rendered with the site's cover
 * treatment (DESIGN.md Components §Book cards, §The shelf, and the rendered
 * reference): true right angles (2px only, never a soft radius), the
 * two-layer cover shadow, and an optional 1px hairline on very light grounds so
 * the cover's edge stays defined against a white canvas.
 *
 * The image is NEVER cropped, tinted, or re-lit. Covers keep their own ground;
 * that ground is the identity of the card and the richest color on the page.
 *
 * `priority` marks the above-the-fold hero covers for eager loading; everything
 * else lazy-loads.
 */

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
}: {
  book: Book
  className?: string
  priority?: boolean
  sizes?: string
}) {
  const needsHairline = isLightGround(book.groundHex)
  return (
    <img
      src={book.cover}
      alt={book.title}
      loading={priority ? 'eager' : 'lazy'}
      // Covers are portrait; the real assets are 2:3. Reserving the ratio keeps
      // CLS at zero while the image decodes.
      className={cn(
        'block h-auto w-full rounded-[2px] object-contain',
        needsHairline && 'ring-1 ring-[var(--color-hairline-on-image)]',
        className,
      )}
      style={{ aspectRatio: '2 / 3', boxShadow: 'var(--shadow-cover)' }}
      sizes={sizes}
      // decoding async keeps the main thread free during hydration.
      decoding="async"
    />
  )
}
