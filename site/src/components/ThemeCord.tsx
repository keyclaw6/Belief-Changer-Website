import { useReducedMotion } from 'motion/react'
import { useTheme } from '~/lib/theme-context'
import { PullCord } from './PullCord'

/**
 * ThemeCord: the light switch. A real, physics-simulated ceiling pull-cord
 * (FeralUI PullCord) hanging from the top of the viewport near the right edge,
 * in front of the nav. Pull it and the lights go off (dark); pull again and it
 * is morning (light). It swings and settles like a real cord because it is
 * simulated like one (00-global.md).
 *
 * - onPull toggles the theme; `pulled` mirrors the live state (pulled = dark =
 *   lights off). aria-label is localized ("Turn the lights off/on").
 * - Reduced motion: the cord renders at rest (noEntrance) and acts as a plain
 *   toggle (the package also drops the swing physics on reduced motion).
 * - Rope ink and horizontal position are theme/layout variables set in
 *   globals.css (--pullcord-ink per theme, --pullcord-right by the nav).
 *
 * Client leaf: it consumes the theme context and the reduced-motion query.
 */
export function ThemeCord({
  labelToDark,
  labelToLight,
}: {
  /** aria-label when pulling will turn the lights OFF (currently light). */
  labelToDark: string
  /** aria-label when pulling will turn the lights ON (currently dark). */
  labelToLight: string
}) {
  const { isDark, toggle } = useTheme()
  const reduce = useReducedMotion()

  return (
    <PullCord
      onPull={toggle}
      pulled={isDark}
      noEntrance={Boolean(reduce)}
      ariaLabel={isDark ? labelToLight : labelToDark}
    />
  )
}
