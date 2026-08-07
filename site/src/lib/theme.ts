/**
 * Theme handling. Three data-theme states live on <html>:
 *   - "system": follow prefers-color-scheme (the default, no manual choice yet)
 *   - "light" / "dark": an explicit manual choice, persisted in localStorage
 *
 * The palette for each state is defined in styles/globals.css. Device storage
 * here is functional only (theme preference), never used for measurement.
 */

export type ThemeChoice = 'system' | 'light' | 'dark'

export const THEME_STORAGE_KEY = 'bc-theme'

/**
 * Inline, dependency-free script string injected into <head> before paint so
 * the correct data-theme is set with no flash of the wrong theme on first load.
 * It reads the saved choice (if any) and otherwise leaves data-theme="system",
 * which the CSS resolves against the OS preference.
 */
export const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var c=localStorage.getItem(k);var t=(c==='light'||c==='dark')?c:'system';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','system');}})();`

/** Read the persisted choice (client only). */
export function getStoredTheme(): ThemeChoice {
  if (typeof localStorage === 'undefined') return 'system'
  const v = localStorage.getItem(THEME_STORAGE_KEY)
  return v === 'light' || v === 'dark' ? v : 'system'
}

/** Whether the document is currently showing the dark palette. */
export function isDarkActive(): boolean {
  if (typeof document === 'undefined') return false
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark') return true
  if (attr === 'light') return false
  // system: consult the media query
  return (
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-color-scheme: dark)').matches
  )
}

/** Apply and persist an explicit choice (or clear to system). */
export function setTheme(choice: ThemeChoice): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', choice)
  try {
    if (choice === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, choice)
  } catch {
    // ignore storage failures (private mode, etc.)
  }
}
