import { Link } from '@tanstack/react-router'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '~/lib/utils'

/**
 * Nav: 68px tall with a hairline bottom border (DESIGN.md Layout + the
 * rendered reference). Wordmark left; Library, How it works, language switcher,
 * and theme toggle on the trailing side. Renders on a single line at desktop;
 * collapses to wordmark + controls on narrow screens (nav links hidden below
 * the sm breakpoint, reachable from the footer and pages in this milestone).
 */
export function Nav({ locale, t }: { locale: Locale; t: Messages }) {
  return (
    <header className="border-b border-hairline bg-canvas">
      <nav
        aria-label={t.wordmark}
        className={cn(
          'mx-auto flex items-center justify-between',
          'h-[var(--nav-height)] w-full max-w-[var(--page-max)] px-[5vw]',
        )}
      >
        <Link
          to={localePath(locale, '/')}
          className="type-wordmark text-ink no-underline"
        >
          {t.wordmark}
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-6 sm:flex">
            <Link
              to={localePath(locale, '/books')}
              className="type-ui-sm text-ink-secondary no-underline transition-colors duration-150 hover:text-ink"
            >
              {t.nav.library}
            </Link>
            <Link
              to={localePath(locale, '/how-it-works')}
              className="type-ui-sm text-ink-secondary no-underline transition-colors duration-150 hover:text-ink"
            >
              {t.nav.howItWorks}
            </Link>
          </div>

          <LanguageSwitcher
            locale={locale}
            restPath="/"
            heading={t.langSwitcher.heading}
            label={t.langSwitcher.label}
          />

          <ThemeToggle
            labels={{ toDark: t.nav.themeToDark, toLight: t.nav.themeToLight }}
          />
        </div>
      </nav>
    </header>
  )
}
