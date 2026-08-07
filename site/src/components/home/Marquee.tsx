import type { Messages } from '~/i18n'
import { marqueeQuotes } from '~/data/marquee'

/**
 * Marquee (home only): the single sanctioned motion exception (00-global.md). A
 * horizontal band of short, anonymous reader lines drifting slowly and lazily
 * (72s loop, pauses on hover/focus, fully static under reduced motion). The
 * quotes are MOCK data flagged in src/data/marquee.ts.
 *
 * The band renders the quotes twice inside the track so the CSS drift (-50%)
 * loops seamlessly. The duplicate copy is aria-hidden so assistive tech reads
 * each line once. Quotes are set in real typographic quotes; items are divided
 * by a thin vertical hairline (not a middle-dot chain, which is rationed to
 * metadata). Beneath the band, the centered mission line (copy deck).
 */
function Track({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden ? 'true' : undefined}
      className="flex shrink-0 items-center"
    >
      {marqueeQuotes.map((q, i) => (
        <li key={i} className="flex items-center">
          <span
            className="whitespace-nowrap px-8 text-ink-secondary"
            style={{ fontSize: 'var(--text-body-lg)', lineHeight: 1.4 }}
          >
            &ldquo;{q}&rdquo;
          </span>
          <span aria-hidden="true" className="h-5 w-px shrink-0 bg-hairline" />
        </li>
      ))}
    </ul>
  )
}

export function Marquee({ t }: { t: Messages }) {
  return (
    <section className="bg-band" aria-label={t.home.marqueeLabel}>
      <div className="py-[var(--spacing-section-y)]">
        {/* The drifting band. Full-bleed within the section, soft-masked at the
            edges so lines fade in and out rather than cutting hard. */}
        <div
          className="marquee relative"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            maskImage:
              'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <div className="marquee-track">
            <Track />
            <Track hidden />
          </div>
        </div>

        {/* The mission line, centered beneath the band. */}
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
          <p
            className="mx-auto mt-14 max-w-[52ch] text-center text-ink-secondary"
            style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
          >
            {t.home.marqueeMission}
          </p>
        </div>
      </div>
    </section>
  )
}
