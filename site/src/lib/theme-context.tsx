import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getStoredTheme,
  isDarkFor,
  persistTheme,
  systemPrefersDark,
  type ThemeChoice,
} from './theme'

/**
 * ThemeProvider: React owns the theme. The context holds the current choice
 * (system / light / dark) and exposes the resolved data-theme attribute plus a
 * toggle. The <html data-theme> attribute is rendered by React from this state
 * (see __root.tsx), with an init script painting the right value pre-hydration
 * and suppressHydrationWarning bridging the first render. This replaces the v1
 * pattern of mutating document.documentElement directly.
 *
 * The pull-cord is the toggle: onPull flips light <-> dark, pulled mirrors the
 * live state.
 */

interface ThemeContextValue {
  /** The stored choice: system, light, or dark. */
  choice: ThemeChoice
  /** The resolved attribute for <html data-theme>: exactly the choice. */
  attr: ThemeChoice
  /** Whether the dark palette is currently showing (resolves system). */
  isDark: boolean
  /** Flip between an explicit light and dark choice (the cord's action). */
  toggle: () => void
  setChoice: (c: ThemeChoice) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server + first client render: "system" (matches the init script's default;
  // the script has already set the real attribute on <html> before paint, and
  // <html> carries suppressHydrationWarning). After mount we adopt the stored
  // choice and the live OS preference.
  const [choice, setChoiceState] = useState<ThemeChoice>('system')
  const [systemDark, setSystemDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setChoiceState(getStoredTheme())
    setSystemDark(systemPrefersDark())

    // Keep the resolved palette in step with the OS while on "system".
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setChoice = useCallback((c: ThemeChoice) => {
    setChoiceState(c)
    persistTheme(c)
  }, [])

  const isDark = mounted
    ? choice === 'dark' || (choice === 'system' && systemDark)
    : false

  const toggle = useCallback(() => {
    // The cord is a binary light switch: resolve the currently-showing palette,
    // then flip to the opposite explicit choice.
    const showingDark = isDarkFor(getStoredTheme())
    setChoice(showingDark ? 'light' : 'dark')
  }, [setChoice])

  const value = useMemo<ThemeContextValue>(
    () => ({ choice, attr: choice, isDark, toggle, setChoice }),
    [choice, isDark, toggle, setChoice],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    // Rendered outside a provider (should not happen): a safe, static default.
    return {
      choice: 'system',
      attr: 'system',
      isDark: false,
      toggle: () => {},
      setChoice: () => {},
    }
  }
  return ctx
}
