import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { List, X } from '@phosphor-icons/react'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath, stripLocale } from '~/i18n/routing'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '~/lib/utils'

/**
 * Nav: 68px tall, hairline bottom border, calm (00-global.md). Wordmark left;
 * center-right in order Books, How it works, Experiences, Notes, About; far
 * right the language switcher. The pull-cord (the theme switch) hangs from the
 * viewport top-right in front of the nav, rendered by the shell, so it is not
 * in this flow. The old theme toggle button is gone. On mobile: wordmark + a
 * menu button that discloses the links.
 */
export function Nav({ locale, t }: { locale: Locale; t: Messages }) {
  const [open, setOpen] = useState(false)
  const restPath = stripLocale(
    useRouterState({ select: (s) => s.location.pathname }),
  ).rest

  const links: Array<{ to: string; label: string }> = [
    { to: '/books', label: t.nav.books },
    { to: '/how-it-works', label: t.nav.howItWorks },
    { to: '/experiences', label: t.nav.experiences },
    { to: '/blog', label: t.nav.notes },
    { to: '/about', label: t.nav.about },
  ]

  return (
    <header className="relative z-[70] border-b border-hairline bg-canvas">
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

        {/* Desktop links + language switcher. The cord sits to their right,
            hanging from the viewport (rendered by the shell). Extra inline-end
            padding reserves room so a link never sits under the rope. */}
        <div className="hidden items-center gap-7 pe-10 md:flex lg:gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={localePath(locale, l.to)}
              activeOptions={{ exact: l.to === '/' }}
              className="type-ui-sm text-ink-secondary no-underline transition-colors duration-150 hover:text-ink data-[status=active]:text-ink"
            >
              {l.label}
            </Link>
          ))}
          <LanguageSwitcher
            locale={locale}
            restPath={restPath}
            heading={t.langSwitcher.heading}
            label={t.langSwitcher.label}
          />
        </div>

        {/* Mobile: language switcher + a menu toggle. */}
        <div className="flex items-center gap-4 md:hidden">
          <LanguageSwitcher
            locale={locale}
            restPath={restPath}
            heading={t.langSwitcher.heading}
            label={t.langSwitcher.label}
          />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={t.nav.menu}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-sm p-1.5 text-ink transition-colors hover:bg-surface"
          >
            {open ? (
              <X size={20} weight="regular" aria-hidden="true" />
            ) : (
              <List size={20} weight="regular" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile disclosure panel. */}
      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-hairline bg-canvas md:hidden"
        >
          <ul className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-2">
            {links.map((l) => (
              <li key={l.to} className="border-b border-hairline last:border-b-0">
                <Link
                  to={localePath(locale, l.to)}
                  onClick={() => setOpen(false)}
                  className="block py-3 type-ui-sm text-ink no-underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  )
}
