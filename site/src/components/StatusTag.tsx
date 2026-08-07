import type { BookStatus } from '~/data/types'
import type { Messages } from '~/i18n'
import { cn } from '~/lib/utils'

/**
 * StatusTag: the ONLY place the four pastel semantics appear (DESIGN.md Colors,
 * Components §Status tags). Pill radius is reserved for these small tags. Tiny
 * label-caps type. Pastels never leak onto sections, buttons, or subject chips.
 *
 *   published        -> green   (available)
 *   being-written    -> yellow  (in progress)
 *   gathering-voices -> yellow  (in progress)
 *   in-translation   -> blue    (informational)
 *
 * A separate `tone="in-production"` covers the audio-not-ready case on book
 * pages (yellow), and `tone="info"` covers the pastel-blue "not yet in your
 * language" note. Red is reserved for errors/destructive confirmation and is
 * not surfaced by this component.
 */

type Tone = 'green' | 'yellow' | 'blue'

const TONE_CLASS: Record<Tone, string> = {
  green: 'bg-[var(--color-pastel-green-bg)] text-[var(--color-pastel-green-ink)]',
  yellow:
    'bg-[var(--color-pastel-yellow-bg)] text-[var(--color-pastel-yellow-ink)]',
  blue: 'bg-[var(--color-pastel-blue-bg)] text-[var(--color-pastel-blue-ink)]',
}

const STATUS_TONE: Record<BookStatus, Tone> = {
  published: 'green',
  'being-written': 'yellow',
  'gathering-voices': 'yellow',
  'in-translation': 'blue',
}

/** Resolve the localized label for a book status from the copy deck. */
export function statusLabel(status: BookStatus, t: Messages): string {
  switch (status) {
    case 'published':
      return t.status.published
    case 'being-written':
      return t.status.beingWritten
    case 'gathering-voices':
      return t.status.gatheringVoices
    case 'in-translation':
      return t.status.inTranslation
  }
}

const base =
  'type-label-caps inline-flex items-center rounded-pill px-[10px] py-[4px] text-[10.5px] leading-none whitespace-nowrap'

/** Status tag driven by a book status. */
export function StatusTag({
  status,
  t,
  className,
}: {
  status: BookStatus
  t: Messages
  className?: string
}) {
  return (
    <span className={cn(base, TONE_CLASS[STATUS_TONE[status]], className)}>
      {statusLabel(status, t)}
    </span>
  )
}

/** A tag with an explicit tone + label, for the in-production / info cases. */
export function ToneTag({
  tone,
  children,
  className,
}: {
  tone: Tone
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn(base, TONE_CLASS[tone], className)}>{children}</span>
  )
}
