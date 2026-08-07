import { cn } from '~/lib/utils'

/**
 * Painting: a site image (a Painted-Life oil or a Quiet-Fact photograph) shown
 * STILL and LARGE, at its true 3:2 ratio. Every site image asset in
 * public/site/ is landscape 3:2, so the frame reserves a 3:2 box and the image
 * fills it exactly. Because the box ratio equals the image ratio, nothing is
 * ever cropped: no more object-cover beheadings of the people the paintings
 * were composed around (the v1 bug this rebuild fixes).
 *
 * A 1px hairline-on-image ring defines the edge where the art meets the canvas;
 * the art is never tinted or re-lit. Rounded to lg like every other surface.
 * Motion: none of its own; a parent Reveal may fade it up once. No parallax.
 */
export function Painting({
  src,
  alt,
  priority = false,
  className,
  sizes,
  rounded = true,
}: {
  src: string
  alt: string
  priority?: boolean
  className?: string
  sizes?: string
  rounded?: boolean
}) {
  return (
    <div
      className={cn('relative w-full overflow-hidden', rounded && 'rounded-lg', className)}
      // True 3:2, so the image fills the box with zero cropping and CLS is zero.
      style={{ aspectRatio: '3 / 2' }}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        className={cn(
          'absolute inset-0 h-full w-full object-cover',
          rounded && 'rounded-lg',
          'ring-1 ring-[var(--color-hairline-on-image)]',
        )}
      />
    </div>
  )
}
