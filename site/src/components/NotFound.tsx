import { Link } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { DEFAULT_LOCALE } from '~/i18n/config'
import { localePath } from '~/i18n/routing'

/**
 * NotFound: the router's default 404 body. A calm redirect home, not an alarm
 * (SITE-PLAN: "This page isn't in the library."). A locale-specific 404 route
 * arrives in a later milestone with the Photo-voice imagery; this is the safe
 * fallback for unmatched paths outside any locale. Defaults to English.
 */
export function NotFound() {
  const t = getMessages(DEFAULT_LOCALE)
  return (
    <main className="mx-auto flex min-h-[60dvh] w-full max-w-[var(--page-max)] flex-col items-start justify-center px-[5vw] py-24">
      <h1
        className="text-ink"
        style={{
          fontSize: 'var(--text-headline-lg)',
          fontWeight: 'var(--text-headline-lg--font-weight)',
          lineHeight: 'var(--text-headline-lg--line-height)',
          letterSpacing: 'var(--text-headline-lg--letter-spacing)',
        }}
      >
        {t.notFound.title}
      </h1>
      <p className="mt-4 max-w-[48ch] text-ink-secondary" style={{ fontSize: 'var(--text-body-lg)' }}>
        {t.notFound.body}
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          to={localePath(DEFAULT_LOCALE, '/')}
          className="rounded-sm bg-action px-6 py-3.5 font-semibold text-on-action no-underline transition-colors duration-150 hover:bg-action-hover"
          style={{ fontSize: 'var(--text-ui-sm)' }}
        >
          {t.notFound.home}
        </Link>
        <Link
          to={localePath(DEFAULT_LOCALE, '/books')}
          className="self-center text-ink"
          style={{ fontSize: 'var(--text-ui-sm)' }}
        >
          {t.notFound.browse}
        </Link>
      </div>
    </main>
  )
}
