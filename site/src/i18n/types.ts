import type { en } from './messages/en'

/**
 * Deeply widen literal types to their primitives, so translations are not
 * forced to equal the English string literals. The English catalog is authored
 * `as const` (stable key names, good autocomplete), but the shared Messages
 * type treats every leaf as a plain string that any locale can fill.
 */
export type DeepWiden<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : { [K in keyof T]: DeepWiden<T[K]> }

/** The catalog shape every locale conforms to (leaves widened to primitives). */
export type Messages = DeepWiden<typeof en>

/** Recursive partial: locales other than en may fill only a subset of keys. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}
