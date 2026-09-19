import { ReadingRoomR11 } from './ReadingRoomR11'
import './reading-room-r13.css'
import type { Book } from '~/data/types'
import type { Locale } from '~/i18n/config'

/**
 * ReadingRoomR13 (Track B final room): the R11 shelf-to-desk transfer
 * machine with one physical-material CSS pass layered over it. This is the
 * branch's actual homepage reading-room experience (mounted in
 * `$locale/index.tsx` right after the trust strip); the isolated
 * `reading-room-r13` route renders this same component for review.
 *
 * Zero behavioral delta: this wrapper owns no state, no timers, no refs. The
 * lift/carry/settle phase machine, the desired-target queue, the FLIP flight
 * of the incoming shelf button, focus rescue and the reduced-motion instant
 * cut are all ReadingRoomR11 verbatim. The only R13 content is
 * reading-room-r13.css (static overrides: pose, thickness, light-true
 * shadows, uneven occupancy). Additional JS over R11: this file (~0.4KB).
 *
 * Identity, honestly scoped: per-title single-mount continuity with a
 * single-cut handoff at commit (see ReadingRoomR11 header), not DOM-node
 * migration. Proven by the capture probes: each title mounted exactly once
 * mid-transfer and at rest, no duplicate selected cover, focus kept.
 */
export function ReadingRoomR13({ locale, books }: { locale: Locale; books: Book[] }) {
  return <ReadingRoomR11 locale={locale} books={books} />
}
