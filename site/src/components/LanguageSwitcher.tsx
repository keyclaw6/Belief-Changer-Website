import { useEffect, useId, useRef, useState } from 'react'
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
  const trigger = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const [activeIndex, setActiveIndex] = useState(LOCALES.indexOf(locale))
  useEffect(() => {
    if (open) ref.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]')[activeIndex]?.focus()
  }, [open, activeIndex])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); trigger.current?.focus() }
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
        ref={trigger}
        aria-controls={menuId}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setActiveIndex(event.key === 'ArrowDown' ? 0 : LOCALES.length - 1); setOpen(true)
          }
        }}
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
          id={menuId}
          role="menu"
          onKeyDown={(event) => {
            const { key } = event
            if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
              event.preventDefault()
              setActiveIndex(i => key === 'Home' ? 0 : key === 'End' ? LOCALES.length - 1 : (i + (key === 'ArrowDown' ? 1 : -1) + LOCALES.length) % LOCALES.length)
            } else if (key === 'Tab') setOpen(false)
          }}
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
            {LOCALES.map((loc, index) => {
              const active = loc === locale
              return (
                <li key={loc}>
                  <Link
                    to={localePath(loc, restPath)}
                    role="menuitemradio"
                    tabIndex={index === activeIndex ? 0 : -1}
                    onFocus={() => setActiveIndex(index)}
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
