/**
 * measure.ts: privacy-first measurement.
 *
 * Contract (docs/SITE-PLAN.md, Measurement contract):
 *   - track(event, props) logs to the console in dev and is a NO-OP in prod.
 *   - No identifiers. No unique-visitor counting. Nothing is stored on or read
 *     from the device for measurement. Device storage is functional ONLY
 *     (theme, locale, reading position, voted flags).
 *   - Free-text queries are sanitized client-side (cap 80 chars, strip emails
 *     and digit runs) BEFORE any future send.
 *
 * There is no network call in v1. When a collector is introduced it will be a
 * single fire-and-forget POST to the endpoint documented below; until then this
 * module only logs in development so builders can see events firing.
 *
 * FUTURE ENDPOINT (not implemented in v1):
 *   POST /api/measure
 *   body: { event: EventName, props: Record<string, string | number>, ts: number }
 *   - No cookies, no auth, no client identifier is ever attached.
 */

// The exact event vocabulary from SITE-PLAN. Adding an event means adding it
// here first so the analytics surface stays a closed, reviewable set.
export type EventName =
  | 'page_view'
  | 'read_start'
  | 'chapter_view'
  | 'download'
  | 'vote_cast'
  | 'request_submitted'
  | 'feedback_submitted'
  | 'experience_submitted'
  | 'finder_no_match'

export type TrackProps = Record<string, string | number | undefined>

const isDev = import.meta.env.DEV

/**
 * sanitizeQuery: apply the SITE-PLAN rules to any free-text value before it is
 * measured: cap at 80 chars, strip email-like tokens, strip runs of 4+ digits.
 * Exposed so callers (e.g. the library finder) can normalize a query once and
 * pass the result as `queryNormalized`.
 */
export function sanitizeQuery(input: string): string {
  return input
    .replace(/\S+@\S+\.\S+/g, '') // strip emails
    .replace(/\d{4,}/g, '') // strip long digit runs
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

/**
 * track: record a product event. Dev: console.debug. Prod: no-op (until the
 * documented collector exists). Never throws; measurement must never break a
 * user flow.
 */
export function track(event: EventName, props: TrackProps = {}): void {
  try {
    // Drop undefined props so payloads stay clean and comparable.
    const clean: Record<string, string | number> = {}
    for (const [k, v] of Object.entries(props)) {
      if (v !== undefined) clean[k] = v
    }

    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug('[measure]', event, clean)
      return
    }

    // Production: intentionally a no-op in v1. When the collector lands, send a
    // single navigator.sendBeacon / fetch keepalive POST here with { event,
    // props: clean, ts: Date.now() } and nothing else. No identifiers.
  } catch {
    // Swallow: measurement is best-effort and must never surface to the user.
  }
}
