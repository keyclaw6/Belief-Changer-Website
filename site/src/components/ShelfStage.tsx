import { Link } from '@tanstack/react-router'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { BookCover } from './BookCover'
import { Hologram } from './Hologram'

/**
 * ShelfStage: the hero asset (SITE-PLAN §Shelf slot contract, DESIGN.md
 * §The shelf). It sits on the white canvas with real cover contact shadows and
 * the books' own grounds supplying the color.
 *
 * v1 renders a STATIC, server-rendered cover row from the books fixture: true
 * corners, cover shadows per the rendered reference, each cover a link to its
 * book page. Covers are staggered in height to read as a shelf rather than a
 * grid, and the row is baseline-aligned so the spines meet an implied shelf.
 *
 * ── Phase 3 mount contract (do not implement here) ───────────────────────────
 * A later phase replaces this static row IN PLACE with an interactive 3D shelf
 * module. The contract that phase must honor:
 *   - Same data source: the `books` fixture (later the real catalog), same
 *     order, same slugs; each spine/cover still links to /books/{slug}.
 *   - Same footprint: the 3D canvas mounts into this component's box; nothing
 *     else on the site may assume 3D exists, and the hero copy/layout around it
 *     does not change.
 *   - Progressive enhancement: this static row is the reduced-motion and
 *     no-JS fallback. The 3D module renders only when motion is allowed and the
 *     canvas hydrates; on `prefers-reduced-motion` it collapses back to exactly
 *     this row.
 *   - Wheel-and-arrow hero behavior (spinning the shelf) arrives WITH the 3D
 *     module, never before it; v1 ships no shelf choreography.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// A calm, deterministic height rhythm so the row reads as a shelf, not a grid.
// Four covers: the two tallest in the middle, shorter at the ends.
const HEIGHTS = ['82%', '100%', '94%', '86%']

export function ShelfStage({
  books,
  locale,
}: {
  books: Book[]
  locale: Locale
}) {
  return (
    <div
      // The shelf's own box. The Phase 3 3D canvas mounts here in place.
      className="flex items-end justify-center gap-3 sm:gap-4 md:justify-end"
    >
      {books.map((book, i) => (
        <Link
          key={book.slug}
          to={localePath(locale, `/books/${book.slug}`)}
          aria-label={book.title}
          className="block w-[21%] max-w-[168px] shrink-0 no-underline sm:w-[23%]"
          style={{ height: HEIGHTS[i % HEIGHTS.length] }}
        >
          {/* Hologram hover: this is a browsable list of covers. */}
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
