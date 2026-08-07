/**
 * PagePlaceholder: a calm, on-brand "this page is coming" surface used by the
 * Milestone 1 route stubs so every link in the shell resolves to a real,
 * SSR-rendered page. Later milestones replace each stub route's component with
 * the real page. Kept token-driven and quiet; no fake content, no filler.
 */
export function PagePlaceholder({
  eyebrow,
  title,
  note,
}: {
  eyebrow: string
  title: string
  note: string
}) {
  return (
    <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      <section className="py-[var(--spacing-section-y)]">
        <p className="type-label-caps text-ink-secondary">{eyebrow}</p>
        <h1
          className="mt-4 max-w-[20ch] text-ink"
          style={{
            fontSize: 'var(--text-headline-lg)',
            fontWeight: 'var(--text-headline-lg--font-weight)',
            lineHeight: 'var(--text-headline-lg--line-height)',
            letterSpacing: 'var(--text-headline-lg--letter-spacing)',
          }}
        >
          {title}
        </h1>
        <p
          className="mt-5 max-w-[52ch] text-ink-secondary"
          style={{
            fontSize: 'var(--text-body-lg)',
            lineHeight: 'var(--text-body-lg--line-height)',
          }}
        >
          {note}
        </p>
      </section>
    </div>
  )
}
