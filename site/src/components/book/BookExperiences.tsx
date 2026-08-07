import type { Experience } from '~/data/types'
import type { Messages } from '~/i18n'

/**
 * BookExperiences: the experiences excerpt for this specific book (SITE-PLAN
 * book page spec). When the book has experiences, up to two are shown as
 * quote cards, clamped to a glance. When it has none, the honest empty state
 * from the copy deck stands as real content: "No experiences for this book yet.
 * Yours could be the first." No invented testimonials, no fake counts.
 */
export function BookExperiences({
  experiences,
  t,
}: {
  experiences: Experience[]
  t: Messages
}) {
  const items = experiences.slice(0, 2)

  return (
    <div>
      <h2
        className="text-ink"
        style={{
          fontSize: 'var(--text-headline-md)',
          fontWeight: 'var(--text-headline-md--font-weight)',
          lineHeight: 'var(--text-headline-md--line-height)',
        }}
      >
        {t.book.experiencesHeading}
      </h2>

      {items.length > 0 ? (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {items.map((exp) => (
            <li key={exp.id}>
              <figure className="flex h-full flex-col rounded-lg border border-hairline bg-canvas p-6">
                <blockquote
                  className="flex-1 text-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:6] overflow-hidden"
                  style={{
                    fontSize: 'var(--text-body-md)',
                    lineHeight: 'var(--text-body-md--line-height)',
                  }}
                >
                  {exp.text}
                </blockquote>
                <figcaption className="type-mono-meta mt-4">{exp.month}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      ) : (
        <p
          className="mt-4 max-w-[48ch] text-ink-secondary"
          style={{
            fontSize: 'var(--text-body-lg)',
            lineHeight: 'var(--text-body-lg--line-height)',
          }}
        >
          {t.book.experiencesEmpty}
        </p>
      )}
    </div>
  )
}
