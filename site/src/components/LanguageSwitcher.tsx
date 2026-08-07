import { useEffect, useRef, useState } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import {
  LOCALES,
  LOCALE_NATIVE_NAME,
  type Locale,
} from '~/i18n/config'
import { localePath } from '~/i18n/routing'
import { cn } from '~/lib/utils'

/**
 * LanguageSwitcher: DESIGN.md Components: ui-sm, native names, opens a
 * hairline-bordered white panel. Keeps the visitor on the same page by
 * swapping only the locale prefix (restPath is the locale-agnostic remainder).
 *
 * Client leaf for the open/close interaction; each option is a real <Link> so
 * navigation works without JavaScript if the panel is somehow already open, and
 * the links carry proper hrefs for crawlers.
 */
export function LanguageSwitcher({
  locale,
  restPath,
  heading,
  label,
}: {
  locale: Locale
  restPath: string
  heading: string
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1 text-ink-secondary',
          'transition-colors duration-150 hover:text-ink type-ui-sm',
        )}
      >
        <span>{LOCALE_NATIVE_NAME[locale]}</span>
        <CaretDown
          size={12}
          weight="bold"
          aria-hidden="true"
          className={cn('transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={heading}
          className={cn(
            'absolute end-0 z-50 mt-2 min-w-44 overflow-hidden rounded-md',
            'border border-hairline bg-canvas',
          )}
        >
          <p className="type-label-caps px-4 pb-1 pt-3 text-ink-secondary">
            {heading}
          </p>
          <ul className="pb-1">
            {LOCALES.map((loc) => {
              const active = loc === locale
              return (
                <li key={loc}>
                  <Link
                    to={localePath(loc, restPath)}
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center justify-between gap-3 px-4 py-2 no-underline',
                      'type-ui-sm text-ink transition-colors duration-150 hover:bg-surface',
                    )}
                  >
                    <span dir="auto">{LOCALE_NATIVE_NAME[loc]}</span>
                    {active ? (
                      <Check size={14} weight="bold" aria-hidden="true" />
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
