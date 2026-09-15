import { ReadingRoomR11 } from './ReadingRoomR11'
import './reading-room-r13.css'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'

/**
 * ReadingRoomR13 (Track B slice R13): the R11 same-node shelf-to-desk machine
 * with one physical-material CSS pass layered over it.
 *
 * Zero behavioral delta: this wrapper owns no state, no timers, no refs. The
 * lift/carry/settle phase machine, the desired-target queue, the FLIP travel
 * of the shelf node itself, focus rescue and the reduced-motion instant cut
 * are all ReadingRoomR11 verbatim. The only R13 content is
 * reading-room-r13.css (static overrides: pose, thickness, light-true
 * shadows, uneven occupancy). Additional JS over R11: this file (~0.4KB).
 */
export function ReadingRoomR13({ locale, books }: { locale: Locale; books: Book[] }) {
  return <ReadingRoomR11 locale={locale} books={books} />
}
