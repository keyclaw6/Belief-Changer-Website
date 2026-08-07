import { useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import type { Messages } from '~/i18n'
import { track } from '~/lib/measure'
import { btnPrimary, inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * RequestSubmit: "Ask for a book we have not written" (copy deck 07-requests).
 * One generous textarea (the subject naturally comes first in their own words)
 * and one button. On submit it swaps to the exact success line, announced via
 * aria-live.
 *
 * Contract (mocked in v1): POST /api/requests { text }. Nothing leaves the
 * device; measurement fires request_submitted with no free text.
 *
 * `seedSubject` lets the library's no-match CTA prefill the field when it passes
 * a validated ?subject= param; it is only an editable default.
 */

const textarea =
  'w-full rounded-md border border-hairline bg-canvas px-4 py-3.5 text-ink ' +
  'placeholder:text-ink-secondary resize-y min-h-[140px]'

export function RequestSubmit({
  t,
  seedSubject = '',
}: {
  t: Messages
  seedSubject?: string
}) {
  const [text, setText] = useState(seedSubject)
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    // Mock POST /api/requests { text }. Nothing leaves the device in v1;
    // measurement carries no free text.
    track('request_submitted')
    setSent(true)
  }

  function reset() {
    setText('')
    setSent(false)
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
        {t.requests.submitTitle}
      </h2>

      {/* aria-live region announces the success swap to assistive tech. */}
      <div aria-live="polite">
        {sent ? (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-hairline bg-canvas p-6 md:p-7">
            <CheckCircle
              size={22}
              weight="regular"
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[var(--color-pastel-green-ink)]"
            />
            <div>
              <p
                className="max-w-[52ch] text-ink"
                style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
              >
                {t.requests.submitSuccessBody}
              </p>
              <button type="button" onClick={reset} className={cn(inkLink, 'mt-4 inline-block')}>
                {t.requests.submitAnother}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {!sent ? (
        <>
          <p
            className="mt-3 max-w-[56ch] text-ink-secondary"
            style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
          >
            {t.requests.submitBody}
          </p>

          <form onSubmit={onSubmit} className="mt-7">
            <label htmlFor="request-text" className="sr-only">
              {t.requests.submitFieldLabel}
            </label>
            <textarea
              id="request-text"
              name="text"
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.requests.submitPlaceholder}
              autoComplete="off"
              className={textarea}
              style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
            />
            <button type="submit" className={`${btnPrimary} mt-5`}>
              {t.requests.submitCta}
            </button>
          </form>
        </>
      ) : null}
    </div>
  )
}
