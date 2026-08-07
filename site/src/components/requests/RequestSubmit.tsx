import { useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import type { Messages } from '~/i18n'
import { track } from '~/lib/measure'
import { btnPrimary, inputText, inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * RequestSubmit: the "Ask for a book" flow on /requests (SITE-PLAN §Community
 * mechanics). A short subject input plus an optional experience textarea,
 * labels above each field, helper text below in secondary ink. On submit it
 * swaps to a client-mocked success state, announced via aria-live, that
 * explains the loop honestly ("enough voices and the book gets written").
 *
 * Contract (mocked in v1): POST /api/requests { subject, experience? }. Nothing
 * leaves the device; measurement fires request_submitted with no free text.
 *
 * `seedSubject` lets the library's no-match CTA prefill the subject when it
 * passes a validated ?subject= param; it is only a default, fully editable.
 */

const textarea =
  'w-full rounded-md border border-hairline bg-canvas px-4 py-3 text-ink ' +
  'placeholder:text-ink-secondary resize-y min-h-[104px]'

export function RequestSubmit({
  t,
  seedSubject = '',
}: {
  t: Messages
  seedSubject?: string
}) {
  const [subject, setSubject] = useState(seedSubject)
  const [experience, setExperience] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim()) return
    // Mock POST /api/requests { subject, experience? }. Nothing leaves the
    // device in v1; measurement carries no free text.
    track('request_submitted')
    setSent(true)
  }

  function reset() {
    setSubject('')
    setExperience('')
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
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-hairline bg-surface p-6 md:p-7">
            <CheckCircle
              size={22}
              weight="regular"
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[var(--color-pastel-green-ink)]"
            />
            <div>
              <p className="text-ink" style={{ fontSize: 'var(--text-body-lg)', fontWeight: 500 }}>
                {t.requests.submitSuccessTitle}
              </p>
              <p
                className="mt-2 max-w-[54ch] text-ink-secondary"
                style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
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
            className="mt-3 max-w-[54ch] text-ink-secondary"
            style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
          >
            {t.requests.submitBody}
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-6">
            <div>
              <label
                htmlFor="request-subject"
                className="mb-2 block text-ink"
                style={{ fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
              >
                {t.requests.submitSubjectLabel}
              </label>
              <input
                id="request-subject"
                name="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t.requests.submitSubjectPlaceholder}
                autoComplete="off"
                className={inputText}
                aria-describedby="request-subject-help"
              />
              <p id="request-subject-help" className="mt-2 text-ink-secondary" style={{ fontSize: 'var(--text-ui-sm)' }}>
                {t.requests.submitSubjectHelp}
              </p>
            </div>

            <div>
              <label
                htmlFor="request-experience"
                className="mb-2 flex items-baseline gap-2 text-ink"
                style={{ fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
              >
                {t.requests.submitExperienceLabel}
                <span className="type-mono-meta">{t.requests.submitExperienceOptional}</span>
              </label>
              <textarea
                id="request-experience"
                name="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder={t.requests.submitExperiencePlaceholder}
                className={textarea}
                style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
              />
            </div>

            <button type="submit" className={btnPrimary}>
              {t.requests.submitCta}
            </button>
          </form>
        </>
      ) : null}
    </div>
  )
}
