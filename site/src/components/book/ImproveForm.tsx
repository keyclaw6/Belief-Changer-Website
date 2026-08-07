import { useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import type { Messages } from '~/i18n'
import { track } from '~/lib/measure'
import { btnPrimary } from '~/lib/ui'

/**
 * ImproveForm: "Help the next version" (copy deck 04-book-page). THE single
 * field: one generous textarea and one button, with the proposal's exact
 * framing. No checkbox, no extra fields, no consent step; submissions are
 * anonymous by design. On submit it swaps to the exact success line, announced
 * via aria-live.
 *
 * v1 is client-mocked against the documented contract (POST /api/feedback
 * { slug, text }). Measurement carries no free text, only the slug. No
 * attribution is ever collected or shown.
 */

const textarea =
  'w-full rounded-md border border-hairline bg-canvas px-4 py-3.5 text-ink ' +
  'placeholder:text-ink-secondary resize-y min-h-[160px]'

export function ImproveForm({ slug, t }: { slug: string; t: Messages }) {
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    // Mock POST /api/feedback { slug, text }. Nothing leaves the device in v1;
    // measurement carries the slug only, never the free text.
    track('feedback_submitted', { slug })
    setSent(true)
  }

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
        {t.book.improveTitle}
      </h2>

      {/* aria-live region: announces the success swap to assistive tech. */}
      <div aria-live="polite">
        {sent ? (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-hairline bg-surface p-6 md:p-7">
            <CheckCircle
              size={22}
              weight="regular"
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[var(--color-pastel-green-ink)]"
            />
            <p
              className="max-w-[52ch] text-ink"
              style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
            >
              {t.book.improveSuccessBody}
            </p>
          </div>
        ) : null}
      </div>

      {!sent ? (
        <>
          <p
            className="mt-3 max-w-[58ch] text-ink-secondary"
            style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
          >
            {t.book.improveBody}
          </p>

          <form onSubmit={onSubmit} className="mt-7">
            <label htmlFor="improve-text" className="sr-only">
              {t.book.improveFieldLabel}
            </label>
            <textarea
              id="improve-text"
              name="text"
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.book.improvePlaceholder}
              className={textarea}
              style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
            />
            <button type="submit" className={`${btnPrimary} mt-5`}>
              {t.book.improveSubmit}
            </button>
          </form>
        </>
      ) : null}
    </div>
  )
}
