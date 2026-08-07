import { useState } from 'react'
import { CheckCircle, CaretDown } from '@phosphor-icons/react'
import type { Book } from '~/data/types'
import type { Messages } from '~/i18n'
import { track } from '~/lib/measure'
import { btnPrimary, inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * ExperienceSubmit: the share-your-experience flow on /experiences (SITE-PLAN
 * §Community mechanics; conceptually the same consent path as the book page's
 * improve form). A book picker, a "what happened" textarea, and an explicit
 * "publish anonymously" confirmation whose language makes the framing plain:
 * no name, no account, no way to trace it back. Labels above; helper below.
 *
 * Contract (mocked in v1): POST /api/experiences { slug, whatHappened,
 * mayPublish }. Nothing leaves the device; measurement fires
 * experience_submitted with the slug only, no free text. Success is announced
 * via aria-live and explains that public text passes a quiet review first.
 */

const textarea =
  'w-full rounded-md border border-hairline bg-canvas px-4 py-3 text-ink ' +
  'placeholder:text-ink-secondary resize-y min-h-[120px]'

export function ExperienceSubmit({
  books,
  t,
}: {
  books: Book[]
  t: Messages
}) {
  const [slug, setSlug] = useState('')
  const [text, setText] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!slug) {
      setError(t.experiences.bookRequired)
      return
    }
    if (!text.trim()) return
    if (!consent) {
      setError(t.experiences.consentRequired)
      return
    }
    setError(null)
    // Mock POST /api/experiences. Nothing leaves the device in v1; measurement
    // carries the slug only, never the free text.
    track('experience_submitted', { slug })
    setSent(true)
  }

  function reset() {
    setSlug('')
    setText('')
    setConsent(false)
    setError(null)
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
        {t.experiences.submitTitle}
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
                {t.experiences.submitSuccessTitle}
              </p>
              <p
                className="mt-2 max-w-[54ch] text-ink-secondary"
                style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
              >
                {t.experiences.submitSuccessBody}
              </p>
              <button type="button" onClick={reset} className={cn(inkLink, 'mt-4 inline-block')}>
                {t.experiences.submitAnother}
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
            {t.experiences.submitBody}
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-6">
            <div>
              <label
                htmlFor="exp-book"
                className="mb-2 block text-ink"
                style={{ fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
              >
                {t.experiences.submitBookLabel}
              </label>
              <div className="relative">
                <select
                  id="exp-book"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full appearance-none rounded-md border border-hairline bg-canvas px-4 py-3.5 pe-11 type-ui-sm text-ink"
                >
                  <option value="">{t.experiences.submitBookPlaceholder}</option>
                  {books.map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.title}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={15}
                  weight="bold"
                  aria-hidden="true"
                  className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-ink-secondary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="exp-text"
                className="mb-2 block text-ink"
                style={{ fontSize: 'var(--text-ui-sm)', fontWeight: 500 }}
              >
                {t.experiences.submitTextLabel}
              </label>
              <textarea
                id="exp-text"
                name="whatHappened"
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.experiences.submitTextPlaceholder}
                className={textarea}
                style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-ink)]"
              />
              <span
                className="text-ink-secondary"
                style={{ fontSize: 'var(--text-body-md)', lineHeight: 'var(--text-body-md--line-height)' }}
              >
                {t.experiences.submitConsentLabel}
              </span>
            </label>

            {/* Inline error in plain prose, pastel-red ink (DESIGN.md Forms). */}
            {error ? (
              <p
                role="alert"
                className="text-[var(--color-pastel-red-ink)]"
                style={{ fontSize: 'var(--text-ui-sm)' }}
              >
                {error}
              </p>
            ) : null}

            <button type="submit" className={btnPrimary}>
              {t.experiences.submitCta}
            </button>
          </form>
        </>
      ) : null}
    </div>
  )
}
