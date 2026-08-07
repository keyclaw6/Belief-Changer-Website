/**
 * Shared className recipes so every page renders the same token-driven
 * primitives (DESIGN.md Components). Centralizing these enforces the
 * shape-consistency lock (buttons rounded-sm, inputs rounded-md, cards
 * rounded-lg) and the "one primary action per screen, ink-only interaction"
 * rules by construction, rather than re-deriving Tailwind strings per page.
 *
 * These are strings, not components, so server components can spread them onto
 * plain <a>/<button>/<input> elements with zero client cost.
 */

/** Solid ink primary button: rounded-sm, no shadow, hover shift, active press. */
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-action px-6 py-3.5 ' +
  'type-ui-sm font-semibold text-on-action no-underline ' +
  'transition-[background-color,transform] duration-150 hover:bg-action-hover active:scale-[0.98]'

/**
 * Secondary action: hairline-bordered, ink text, transparent fill. Used for
 * the second, lower-priority action beside the single ink primary (e.g.
 * "Download EPUB" next to "Read online"). Never pill, never pastel.
 */
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-hairline px-6 py-3.5 ' +
  'type-ui-sm font-semibold text-ink no-underline ' +
  'transition-colors duration-150 hover:bg-surface active:scale-[0.98]'

/**
 * Inline ink link with underline (DESIGN.md: links are ink with underlines).
 * Used for "Add your voice", "Browse the library", chapter prev/next, etc.
 */
export const inkLink =
  'type-ui-sm font-medium text-ink underline underline-offset-[3px] decoration-1 ' +
  'transition-opacity duration-150 hover:opacity-70'

/** White field, hairline border, rounded-md, ink text, placeholder secondary. */
export const inputText =
  'w-full rounded-md border border-hairline bg-canvas px-4 py-3.5 type-ui-sm font-normal text-ink ' +
  'placeholder:text-ink-secondary'
