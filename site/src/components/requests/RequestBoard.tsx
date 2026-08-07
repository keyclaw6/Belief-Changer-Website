import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, Plus } from '@phosphor-icons/react'
import type { RequestRow } from '~/data/types'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { format } from '~/i18n'
import { StatusTag } from '~/components/StatusTag'
import { track } from '~/lib/measure'
import { cn } from '~/lib/utils'

/**
 * RequestBoard: the interactive ranked list on /requests (SITE-PLAN §Community
 * mechanics). Ordered by votes descending. Each row carries a mono rank, the
 * first-person subject, a status tag, the vote count in mono, and a one-tap
 * "Add your voice" that increments optimistically. A localStorage flag records
 * that this device already voted for a subject so the UX does not offer the vote
 * twice (functional storage only, no identity). Published rows link to their
 * book instead of showing a vote button.
 *
 * Data-rich styling per DESIGN.md: one bordered container with sparse hairline
 * dividers (divide-y between rows), never border-t + border-b on every row.
 * Rendered exactly once per fixture row. The homepage NextBook mirror is
 * display-only; the interaction lives here.
 *
 * Contract (mocked in v1): POST /api/votes { subjectId }. Nothing leaves the
 * device; the vote is optimistic and the flag is local.
 */

const VOTE_STORE_KEY = 'bc-voted'

/** Read the set of subject ids this device has already voted for. */
function readVoted(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(VOTE_STORE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? new Set(arr.filter((v) => typeof v === 'string')) : new Set()
  } catch {
    return new Set()
  }
}

/** Persist the voted-flag set (functional storage only, never measurement). */
function writeVoted(ids: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VOTE_STORE_KEY, JSON.stringify([...ids]))
  } catch {
    // Storage may be unavailable (private mode); the vote still works in-session.
  }
}

export function RequestBoard({
  rows,
  locale,
  t,
}: {
  rows: RequestRow[]
  locale: Locale
  t: Messages
}) {
  const ranked = useMemo(
    () => [...rows].sort((a, b) => b.votes - a.votes),
    [rows],
  )

  // Optimistic vote deltas keyed by subject id, plus the set of voted ids.
  // Initialized empty so the server and first client render agree (the flags
  // are read after mount to keep SSR deterministic).
  const [deltas, setDeltas] = useState<Record<string, number>>({})
  const [voted, setVoted] = useState<Set<string>>(() => new Set())

  // Hydrate the voted flags after mount so SSR and the first client render
  // agree (empty), then the local flags apply and already-voted rows show the
  // "voice added" state without an extra tap.
  useEffect(() => {
    setVoted(readVoted())
  }, [])

  function castVote(row: RequestRow) {
    if (voted.has(row.id)) return
    // Optimistic increment.
    setDeltas((d) => ({ ...d, [row.id]: (d[row.id] ?? 0) + 1 }))
    const next = new Set(voted)
    next.add(row.id)
    setVoted(next)
    writeVoted(next)
    // Mocked POST /api/votes { subjectId }. Measurement carries only the id.
    track('vote_cast', { subjectId: row.id })
  }

  return (
    <div className="max-w-[52rem]">
      <h2 className="sr-only">{t.requests.rankedHeading}</h2>
      <ol className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-canvas">
        {ranked.map((row, i) => {
          const count = row.votes + (deltas[row.id] ?? 0)
          const countLabel = format(
            count === 1 ? t.requests.voteCountOne : t.requests.voteCount,
            { count: count.toLocaleString() },
          )
          const hasVoted = voted.has(row.id)
          const published = row.status === 'published' && row.bookSlug

          return (
            <li
              key={row.id}
              className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 px-5 py-[18px] sm:grid-cols-[auto_1fr_auto] sm:gap-x-5 sm:px-6"
            >
              {/* Rank in mono, aligned like a numbered list. */}
              <span className="type-mono-meta w-6 text-end tabular-nums" aria-hidden="true">
                {i + 1}
              </span>

              {/* Subject + status tag. */}
              <div className="min-w-0">
                <p
                  className="text-ink"
                  style={{ fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
                >
                  {row.subject}
                </p>
                <span className="mt-2 flex items-center gap-3">
                  <StatusTag status={row.status} t={t} />
                  <span className="type-mono-meta">{countLabel}</span>
                </span>
              </div>

              {/* Action: published rows link to the book; everything else gets
                  the one-tap vote (or a quiet "voice added" once used). Spans
                  the full width on the narrowest layout, sits at the row end on
                  wider ones. */}
              <div className="col-span-2 sm:col-span-1 sm:justify-self-end">
                {published ? (
                  <Link
                    to={localePath(locale, `/books/${row.bookSlug}`)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-hairline px-4 py-2 type-ui-sm font-medium text-ink no-underline transition-colors duration-150 hover:bg-surface"
                  >
                    {t.requests.readTheBook}
                    <ArrowRight size={14} weight="bold" aria-hidden="true" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => castVote(row)}
                    disabled={hasVoted}
                    aria-label={format(
                      hasVoted ? t.requests.votedAria : t.requests.voteAria,
                      { subject: row.subject },
                    )}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-sm px-4 py-2 type-ui-sm font-medium transition-colors duration-150',
                      hasVoted
                        ? 'cursor-default border border-transparent text-ink-secondary'
                        : 'border border-ink text-ink hover:bg-ink hover:text-on-action active:scale-[0.98]',
                    )}
                  >
                    {hasVoted ? (
                      <>
                        <Check size={14} weight="bold" aria-hidden="true" />
                        {t.requests.voted}
                      </>
                    ) : (
                      <>
                        <Plus size={14} weight="bold" aria-hidden="true" />
                        {t.requests.addYourVoice}
                      </>
                    )}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
