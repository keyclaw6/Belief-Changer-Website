import { useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import type { Messages } from '~/i18n'
import { track } from '~/lib/measure'
import { btnPrimary } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * ImproveForm: "Help the next version" (SITE-PLAN §Community mechanics, copy
 * deck). Three guided prompts plus an optional free-text field, a small guide
 * explaining that specific, personal, belief-level feedback helps most, and one
 * optional "may publish as an anonymous experience" toggle. Labels sit above
 * inputs; helper text below; the form is fully anonymous.
 *
 * v1 is fully client-mocked against the documented contract
 * (POST /api/feedback { slug, lostAt?, beliefStanding?, whatHappened?,
 * freeText?, mayPublish }). Submit swaps to a success state that explains the
 * pipeline, announced via aria-live so assistive tech hears the change. It
 * fires feedback_submitted (and experience_submitted when the reader consents
 * to publish). No attribution is ever collected or shown.
 */

const textarea =
  'w-full rounded-md border border-hairline bg-canvas px-4 py-3 text-ink ' +
  'placeholder:text-ink-secondary resize-y min-h-[92px]'

function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-ink"
        style={{ fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={textarea}
        style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
      />
    </div>
  )
}

export function ImproveForm({ slug, t }: { slug: string; t: Messages }) {
  const [lostAt, setLostAt] = useState('')
  const [beliefStanding, setBeliefStanding] = useState('')
  const [whatHappened, setWhatHappened] = useState('')
  const [freeText, setFreeText] = useState('')
  const [mayPublish, setMayPublish] = useState(false)
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Mock the documented POST /api/feedback contract; nothing leaves the device
    // in v1. Measurement carries no free text, only the slug and coarse kind.
    track('feedback_submitted', { slug, kind: mayPublish ? 'with-consent' : 'private' })
    if (mayPublish) track('experience_submitted', { slug })
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
            <div>
              <p className="text-ink" style={{ fontSize: 'var(--text-body-lg)', fontWeight: 500 }}>
                {t.book.improveSuccessTitle}
              </p>
              <p
                className="mt-2 max-w-[54ch] text-ink-secondary"
                style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
              >
                {t.book.improveSuccessBody}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {!sent ? (
        <>
          <p
            className="mt-3 max-w-[56ch] text-ink-secondary"
            style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
          >
            {t.book.improveGuide}
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-6">
            <Field
              id="improve-lost"
              label={t.book.improvePromptLostYou}
              value={lostAt}
              onChange={setLostAt}
            />
            <Field
              id="improve-belief"
              label={t.book.improvePromptBeliefStanding}
              value={beliefStanding}
              onChange={setBeliefStanding}
            />
            <Field
              id="improve-happened"
              label={t.book.improvePromptWhatHappened}
              value={whatHappened}
              onChange={setWhatHappened}
            />
            <Field
              id="improve-free"
              label={t.book.improveFreeText}
              value={freeText}
              onChange={setFreeText}
            />

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={mayPublish}
                onChange={(e) => setMayPublish(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-ink)]"
              />
              <span
                className="text-ink-secondary"
                style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
              >
                {t.book.improveConsent}
              </span>
            </label>

            <button type="submit" className={cn(btnPrimary)}>
              {t.book.improveSubmit}
            </button>
          </form>
        </>
      ) : null}
    </div>
  )
}
