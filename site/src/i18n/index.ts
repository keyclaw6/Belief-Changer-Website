import { en } from './messages/en'
import { da } from './messages/da'
import { ar } from './messages/ar'
import { DEFAULT_LOCALE, type Locale } from './config'
import type { DeepPartial, Messages } from './types'

/**
 * Locale catalogs. English is complete and the source of truth. da/ar are
 * partial in Milestone 1 and are deep-merged over English so any missing key
 * gracefully falls back to en (SITE-PLAN §i18n and RTL).
 */

/** Deep-merge a partial catalog over the complete English base (objects only). */
function mergeCatalog(base: Messages, override: DeepPartial<Messages>): Messages {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const key of Object.keys(override)) {
    const ov = (override as Record<string, unknown>)[key]
    const bs = (base as Record<string, unknown>)[key]
    if (
      ov &&
      typeof ov === 'object' &&
      !Array.isArray(ov) &&
      bs &&
      typeof bs === 'object' &&
      !Array.isArray(bs)
    ) {
      out[key] = mergeCatalog(bs as Messages, ov as DeepPartial<Messages>)
    } else if (ov !== undefined) {
      out[key] = ov
    }
  }
  return out as Messages
}

// The English catalog authored `as const` satisfies the widened Messages type.
const enBase: Messages = en

// Build the fully-resolved catalog for each locale once at module load.
const CATALOGS: Record<Locale, Messages> = {
  en: enBase,
  da: mergeCatalog(enBase, da),
  ar: mergeCatalog(enBase, ar),
}

export function getMessages(locale: Locale): Messages {
  return CATALOGS[locale] ?? CATALOGS[DEFAULT_LOCALE]
}

/**
 * A translator bound to a locale. `t(section)` returns the resolved subtree so
 * components read strings directly (e.g. `const t = useT(); t.home.primaryCta`).
 * For interpolation, use `format()`.
 */
export type Translator = Messages

export function createTranslator(locale: Locale): Translator {
  return getMessages(locale)
}

/**
 * format: ICU-lite interpolation for the {name} placeholders used in the
 * catalogs. Example: format(t.book.versionLabel, { version: 3, month: 'June 2026' }).
 * Unknown placeholders are left untouched so mistakes are visible, not silent.
 */
export function format(
  template: string,
  values: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}

export { en, da, ar }
export type { Messages }
