/**
 * i18n configuration.
 *
 * Locales v1 (SITE-PLAN §i18n and RTL):
 *   - en: complete
 *   - da / ar: nav + home + book-page core strings to prove the machinery
 *   - ar proves dir="rtl" mirroring end to end
 *
 * Every route lives under /{locale}/. The language switcher shows native names.
 */

export const LOCALES = ['en', 'da', 'ar'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/** Text direction per locale. Arabic is the RTL proof case. */
export const LOCALE_DIR: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  da: 'ltr',
  ar: 'rtl',
}

/** Native names for the language switcher (never English exonyms). */
export const LOCALE_NATIVE_NAME: Record<Locale, string> = {
  en: 'English',
  da: 'Dansk',
  ar: 'العربية',
}

/** BCP-47 tag used for the <html lang> attribute and hreflang alternates. */
export const LOCALE_BCP47: Record<Locale, string> = {
  en: 'en',
  da: 'da',
  ar: 'ar',
}

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as readonly string[]).includes(value)
}

export function dirFor(locale: Locale): 'ltr' | 'rtl' {
  return LOCALE_DIR[locale]
}
