import { useEffect, useRef, useState } from 'react'

/**
 * FlickerText: a tired-neon-sign "404" heading for the 404 page.
 *
 * The behavior is a lazy, electrical flicker, hand-rolled with no animation
 * library (DESIGN.md: motion is barely there, motivated, or cut). It reads the
 * string "404" as the page h1, in DM Sans 600 at display scale, ink color.
 *
 * Progressive enhancement is load-bearing (matches Reveal's discipline):
 *   - The SSR output and the first client render are FULLY VISIBLE. No glyph is
 *     dimmed before hydration, so there is no flash and no layout shift, ever.
 *   - Only opacity changes; the glyphs never move or resize. Each glyph keeps
 *     its box whether lit or dipped, so the heading's metrics are constant.
 *
 * The flicker itself, armed only after mount and only when motion is allowed:
 *   - At a randomized interval between 1.5s and 4s, one glyph (occasionally two,
 *     ~25% of ticks) dips to ~0.25 opacity for 70-160ms, like a loose tube.
 *   - Roughly a third of ticks are a double-blink: dip, restore for ~120ms, then
 *     a brief second dip, so it stutters the way real failing neon does.
 *   - About every 10-12s the whole word does one soft blink to ~0.55 for ~90ms.
 *   - Every timer is randomized inside its range, so the pattern never loops.
 *
 * Accessibility:
 *   - The <h1> carries aria-label="404"; the per-glyph spans are aria-hidden, so
 *     assistive tech reads a single clean "404" and never the flicker mechanics.
 *   - prefers-reduced-motion: completely static. No timers are ever scheduled;
 *     the component just renders the visible glyphs and does nothing else.
 *
 * Transitions are electrical, not animated: a <=60ms opacity ease so a dip snaps
 * rather than glides. The reduced-motion CSS in globals.css also zeroes any
 * transition, but the JS gate below is what guarantees "no timers at all".
 */

const TEXT = '404'
const GLYPHS = TEXT.split('')

/** Dimmed opacity for a single-glyph electrical dip. */
const DIP_OPACITY = 0.25
/** Dimmed opacity for the soft whole-word blink. */
const WORD_DIP_OPACITY = 0.55

/** Uniform random float in [min, max). */
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/** Uniform random integer in [min, max]. */
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1))
}

/** Detect the reduced-motion preference on the client (no timers if true). */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function FlickerText({ className }: { className?: string }) {
  // Per-glyph opacity. Initial (and SSR) state is fully lit, so nothing dims
  // before hydration and there is never a flash of a dark glyph.
  const [opacities, setOpacities] = useState<number[]>(() =>
    GLYPHS.map(() => 1),
  )

  // All live timers, tracked so every one is cleared on unmount.
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  useEffect(() => {
    if (prefersReducedMotion()) return

    let cancelled = false

    // Track a timeout so cleanup can clear it, and self-remove when it fires.
    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        timers.current.delete(id)
        if (!cancelled) fn()
      }, ms)
      timers.current.add(id)
      return id
    }

    // Set one glyph's opacity (guarded against post-unmount writes).
    const setGlyph = (i: number, value: number) => {
      if (cancelled) return
      setOpacities((prev) => {
        if (prev[i] === value) return prev
        const next = prev.slice()
        next[i] = value
        return next
      })
    }

    // Set every glyph to one value (used for the whole-word blink).
    const setAll = (value: number) => {
      if (cancelled) return
      setOpacities((prev) => {
        if (prev.every((o) => o === value)) return prev
        return prev.map(() => value)
      })
    }

    // One electrical dip on a single glyph: down for 70-160ms, then back up.
    const dipOnce = (i: number, after: () => void) => {
      setGlyph(i, DIP_OPACITY)
      schedule(() => {
        setGlyph(i, 1)
        after()
      }, rand(70, 160))
    }

    // A tick: pick 1 glyph (or 2 at ~25%), single-dip or (~1/3) double-blink.
    const tick = () => {
      const two = GLYPHS.length > 1 && Math.random() < 0.25
      const doubleBlink = Math.random() < 0.34

      // Choose the target glyph(s) without repeating within the same tick.
      const first = randInt(0, GLYPHS.length - 1)
      let second = -1
      if (two) {
        second = randInt(0, GLYPHS.length - 1)
        if (second === first) second = (first + 1) % GLYPHS.length
      }

      const runOn = (i: number) => {
        if (doubleBlink) {
          // Dip, restore for ~120ms, then a brief second dip.
          dipOnce(i, () => {
            schedule(() => {
              setGlyph(i, DIP_OPACITY)
              schedule(() => setGlyph(i, 1), rand(60, 110))
            }, rand(100, 140))
          })
        } else {
          dipOnce(i, () => {})
        }
      }

      runOn(first)
      if (second >= 0) runOn(second)

      // Queue the next tick at a fresh randomized interval (1.5s - 4s).
      schedule(tick, rand(1500, 4000))
    }

    // The occasional soft whole-word blink, on its own ~10-12s cadence.
    const wordBlink = () => {
      setAll(WORD_DIP_OPACITY)
      schedule(() => {
        setAll(1)
        schedule(wordBlink, rand(10000, 12000))
      }, rand(80, 100))
    }

    // Stagger the two loops so their first fires do not land together.
    schedule(tick, rand(1500, 4000))
    schedule(wordBlink, rand(10000, 12000))

    return () => {
      cancelled = true
      for (const id of timers.current) clearTimeout(id)
      timers.current.clear()
    }
  }, [])

  return (
    <h1
      aria-label={TEXT}
      className={className}
      style={{
        // Display-xl role, clamped down for small screens so it never overflows.
        fontFamily: 'var(--font-sans)',
        fontSize: 'clamp(4.5rem, 18vw, 9rem)',
        fontWeight: 'var(--text-display-xl--font-weight)',
        lineHeight: 1,
        letterSpacing: 'var(--text-display-xl--letter-spacing)',
        // A fixed line-box height means a dipped glyph never nudges layout.
        display: 'inline-flex',
      }}
    >
      {GLYPHS.map((g, i) => (
        <span
          // Stable per-position key; the string is a fixed literal.
          key={`${g}-${i}`}
          aria-hidden="true"
          className="text-ink"
          style={{
            opacity: opacities[i],
            // Electrical, not animated: a snap, well under the 60ms ceiling.
            transition: 'opacity 55ms ease',
            // Tabular-ish stability: each glyph holds its own box.
            display: 'inline-block',
          }}
        >
          {g}
        </span>
      ))}
    </h1>
  )
}
