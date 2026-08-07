import { LOCALES, LOCALE_BCP47, DEFAULT_LOCALE, type Locale } from './config'

/**
 * Locale-aware routing helpers. Every route lives under /{locale}/, so links
 * must carry the active locale, and every page must emit hreflang alternates
 * for all locales plus x-default (SITE-PLAN §i18n and RTL).
 */

/** Prefix an in-app path with the active locale. `localePath('en', '/books')` → `/en/books`. */
export function localePath(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  return `/${locale}${clean}`
}

/**
 * Strip the leading /{locale} from a pathname, returning the locale-agnostic
 * remainder (always starting with '/'). Used by the language switcher to keep
 * the visitor on the same page when they change language.
 */
export function stripLocale(pathname: string): { locale: Locale | null; rest: string } {
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  if (first && (LOCALES as readonly string[]).includes(first)) {
    const rest = '/' + segments.slice(1).join('/')
    return { locale: first as Locale, rest: rest === '/' ? '/' : rest }
  }
  return { locale: null, rest: pathname || '/' }
}

export interface HreflangAlternate {
  hrefLang: string
  href: string
}

/**
 * hreflangAlternates: build <link rel="alternate" hreflang> descriptors for a
 * given locale-agnostic path across every locale, plus an x-default that points
 * at the default locale. `origin` is the absolute site origin (e.g.
 * "https://beliefchanger.org"); pass '' during local dev for path-relative hrefs.
 */
export function hreflangAlternates(
  restPath: string,
  origin = '',
): HreflangAlternate[] {
  const alternates: HreflangAlternate[] = LOCALES.map((loc) => ({
    hrefLang: LOCALE_BCP47[loc],
    href: `${origin}${localePath(loc, restPath)}`,
  }))
  alternates.push({
    hrefLang: 'x-default',
    href: `${origin}${localePath(DEFAULT_LOCALE, restPath)}`,
  })
  return alternates
}
