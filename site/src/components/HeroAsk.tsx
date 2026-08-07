import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import type { Locale } from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { btnPrimary, inputText } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * HeroAsk: the finder seed on the homepage hero (SITE-PLAN homepage flow §1,
 * DESIGN.md §Ask input). A white field + the single ink primary button.
 *
 * On submit it navigates to /books?q=<query> and hands off to the library,
 * which runs the client-side filter and, on a true no-match, fires the
 * `finder_no_match` measurement event (the library owns that event so the
 * closed event vocabulary stays in one place). Submitting with no text simply
 * opens the library.
 *
 * Progressive enhancement: this is a real <form> with a GET-style intent. With
 * JavaScript it does a client navigation (no full reload); the input carries a
 * name so the query is preserved either way. The label is visually hidden but
 * present for screen readers (never placeholder-as-label).
 */
export function HeroAsk({
  locale,
  placeholder,
  submitLabel,
  fieldLabel,
}: {
  locale: Locale
  placeholder: string
  submitLabel: string
  /** Accessible label for the field (kept out of the visual layout). */
  fieldLabel: string
}) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    navigate({
      to: localePath(locale, '/books'),
      search: q ? { q } : {},
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
      role="search"
    >
      <label htmlFor="hero-ask" className="sr-only">
        {fieldLabel}
      </label>
      <input
        id="hero-ask"
        name="q"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(inputText, 'sm:flex-1')}
      />
      <button type="submit" className={cn(btnPrimary, 'sm:shrink-0')}>
        {submitLabel}
        <ArrowRight size={16} weight="bold" aria-hidden="true" className="dir-flip" />
      </button>
    </form>
  )
}
