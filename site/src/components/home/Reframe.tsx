import type { Messages } from '~/i18n'
import { Reveal } from '~/components/Reveal'

/**
 * Reframe: the three plain sentences (copy deck verbatim), a quiet band section
 * (SITE-PLAN homepage flow §3). This is the argument the whole site rests on,
 * so it is set as a stacked editorial statement, not a card grid: three lines
 * at headline weight, the final sentence carried in full ink as the payoff, the
 * first two in a slightly quieter ink so the eye lands on the resolution.
 *
 * No eyebrow: the section's job is the three sentences alone. The homepage
 * carries no section eyebrows at all, well under the eyebrow-rationing ceiling.
 */
export function Reframe({ t }: { t: Messages }) {
  const lines = [
    { text: t.home.reframe.sentence1, strong: false },
    { text: t.home.reframe.sentence2, strong: false },
    { text: t.home.reframe.sentence3, strong: true },
  ]
  return (
    <section className="bg-band">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
        <div className="max-w-[46rem] space-y-4">
          {lines.map((line, i) => (
            <Reveal key={i} as="div" index={i}>
              <p
                className={line.strong ? 'text-ink' : 'text-ink-secondary'}
                style={{
                  fontSize: 'var(--text-headline-md)',
                  fontWeight: 'var(--text-headline-md--font-weight)',
                  lineHeight: 'var(--text-headline-md--line-height)',
                }}
              >
                {line.text}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
