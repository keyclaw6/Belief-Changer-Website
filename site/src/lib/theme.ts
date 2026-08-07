/**
 * Theme handling. The theme is owned by React (see ThemeProvider): a context
 * holds the choice, React renders `data-theme` on <html>, and an init script in
 * <head> sets the attribute before first paint so there is no flash. This is
 * the proper fix for the v1 bug where React owned <html data-theme> while a
 * toggle button mutated the same attribute out from under it.
 *
 * Three data-theme states live on <html>:
 *   - "system": follow prefers-color-scheme (the default before any choice)
 *   - "light" / "dark": an explicit manual choice, persisted in localStorage
 *
 * The palette for each state is defined in styles/globals.css. Device storage
 * here is functional only (theme preference), never used for measurement.
 */

export type ThemeChoice = 'system' | 'light' | 'dark'

export const THEME_STORAGE_KEY = 'bc-theme'

/**
 * Inline, dependency-free script injected into <head> before paint. It reads the
 * saved choice (if any) and writes data-theme so the correct palette is on the
 * <html> element on the very first paint, before React hydrates. React then
 * renders the same attribute from context (with suppressHydrationWarning on
 * <html> so the pre-hydration value the script wrote is never fought over).
 */
export const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var c=localStorage.getItem(k);var t=(c==='light'||c==='dark')?c:'system';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','system');}})();`

/** Read the persisted choice (client only). */
export function getStoredTheme(): ThemeChoice {
  if (typeof localStorage === 'undefined') return 'system'
  const v = localStorage.getItem(THEME_STORAGE_KEY)
  return v === 'light' || v === 'dark' ? v : 'system'
}

/** Whether the OS currently prefers dark (client only). */
export function systemPrefersDark(): boolean {
  return (
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-color-scheme: dark)').matches
  )
}

/** Resolve a choice to the concrete palette in effect. */
export function isDarkFor(choice: ThemeChoice): boolean {
  if (choice === 'dark') return true
  if (choice === 'light') return false
  return systemPrefersDark()
}

/** Persist an explicit choice (or clear to system). */
export function persistTheme(choice: ThemeChoice): void {
  try {
    if (choice === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, choice)
  } catch {
    // ignore storage failures (private mode, etc.)
  }
}
