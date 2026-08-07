import type { Messages } from '~/i18n'

/**
 * TrustStrip: directly under the hero (DESIGN.md Layout §Trust strip). Four
 * hairline-separated columns in label-caps: Free forever / No signup /
 * No tracking / Every language (copy deck verbatim). Rules use logical
 * inline-start borders so the divider order mirrors under dir="rtl".
 *
 * Layout: a 2x2 block on mobile, a single 4-up row from sm. Column rules sit on
 * the inline-start edge of every item except the first of its row; the mobile
 * block adds a top rule on its second row. The container carries the top and
 * bottom hairlines. These are facts, not statuses, so no pastel, no dots.
 */
export function TrustStrip({ t }: { t: Messages }) {
  const items = [
    t.trust.freeForever,
    t.trust.noSignup,
    t.trust.noTracking,
    t.trust.everyLanguage,
  ]
  return (
    <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      <ul className="grid grid-cols-2 border-y border-hairline sm:grid-cols-4">
        {items.map((label, i) => {
          // Inline-start rule on the 2nd item of each mobile row (odd index),
          // upgraded to "every item but the first" from sm. Top rule on the
          // mobile bottom row (i >= 2), removed from sm where it is one row.
          const borders = [
            i % 2 === 1 ? 'border-s border-hairline' : '',
            i % 2 === 0 ? 'sm:border-s sm:border-hairline' : '',
            i === 0 ? 'sm:border-s-0' : '',
            i >= 2 ? 'border-t border-hairline sm:border-t-0' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <li
              key={label}
              className={`type-label-caps px-2 py-4 text-center text-ink-secondary ${borders}`}
            >
              {label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
