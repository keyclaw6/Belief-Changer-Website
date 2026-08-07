import { Link } from '@tanstack/react-router'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'

/**
 * Footer: wordmark, the three links (About / Request a book / Open source per
 * the build brief), and the mono trust line from the copy deck. Hairline top
 * border, generous padding (DESIGN.md + the rendered reference). "Open source"
 * points at the public repository; it is an external link.
 */
export function Footer({ locale, t }: { locale: Locale; t: Messages }) {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto flex w-full max-w-[var(--page-max)] flex-wrap items-center justify-between gap-5 px-[5vw] pb-15 pt-11">
        <Link
          to={localePath(locale, '/')}
          className="type-wordmark text-ink no-underline"
          style={{ fontSize: '16px' }}
        >
          {t.wordmark}
        </Link>

        <nav
          aria-label={t.footer.navLabel}
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          <Link
            to={localePath(locale, '/about')}
            className="type-ui-sm text-ink"
          >
            {t.footer.about}
          </Link>
          <Link
            to={localePath(locale, '/requests')}
            className="type-ui-sm text-ink"
          >
            {t.footer.requestABook}
          </Link>
          <Link
            to={localePath(locale, '/experiences')}
            className="type-ui-sm text-ink"
          >
            {t.footer.experiences}
          </Link>
          <Link
            to={localePath(locale, '/blog')}
            className="type-ui-sm text-ink"
          >
            {t.footer.blog}
          </Link>
          <Link
            to={localePath(locale, '/privacy')}
            className="type-ui-sm text-ink"
          >
            {t.footer.privacy}
          </Link>
          {/* Open source: external link to the public repository. */}
          <a
            href="https://github.com/belief-changer"
            target="_blank"
            rel="noreferrer"
            className="type-ui-sm text-ink"
          >
            {t.footer.openSource}
          </a>
        </nav>

        {/* Mono trust line, copy deck verbatim. Middle dot is metadata-only. */}
        <span className="type-mono-meta">{t.footer.trustLine}</span>
      </div>
    </footer>
  )
}
