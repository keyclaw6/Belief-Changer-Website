import { useEffect, useState } from 'react'
import { Moon, Sun } from '@phosphor-icons/react'
import { isDarkActive, setTheme } from '~/lib/theme'
import { cn } from '~/lib/utils'

/**
 * ThemeToggle: a quiet manual override on top of the prefers-color-scheme
 * default. Hairline-bordered, ink-only, no shadow (DESIGN.md Components). The
 * label describes the action's result ("Dark mode" flips to dark).
 *
 * Client leaf: reads the live theme after mount to avoid an SSR mismatch, then
 * toggles between explicit light/dark.
 */
export function ThemeToggle({
  labels,
  className,
}: {
  labels: { toDark: string; toLight: string }
  className?: string
}) {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(isDarkActive())
  }, [])

  function toggle() {
    const next = dark ? 'light' : 'dark'
    setTheme(next)
    setDark(next === 'dark')
  }

  // Before mount, render a stable placeholder label so SSR and first client
  // paint match; icons/labels settle immediately after hydration.
  const showDark = mounted ? dark : false
  const label = showDark ? labels.toLight : labels.toDark
  const Icon = showDark ? Sun : Moon

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border border-hairline',
        'px-3 py-[7px] text-ink transition-colors duration-150',
        'hover:bg-surface',
        className,
      )}
    >
      <Icon size={15} weight="regular" aria-hidden="true" />
      <span className="type-ui-sm">{label}</span>
    </button>
  )
}
