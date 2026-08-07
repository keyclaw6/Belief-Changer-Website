import { Link } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { DEFAULT_LOCALE, type Locale } from '~/i18n/config'
import { localePath, stripLocale } from '~/i18n/routing'
import { btnPrimary, inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * NotFound (M4): the designed 404, wired as the router's default not-found
 * component (see router.tsx and __root.tsx), so every unmatched path lands
 * here. Copy deck: "This page isn't in the library." A calm redirect home,
 * never an alarm. Ink links to the home page and the library.
 *
 * The open-street PHOTOGRAPH is the structural image (Quiet Fact voice, imagery
 * manifest); no paintings on this surface (one voice per section, imagery law).
 *
 * Locale awareness: this renders outside the /{locale} layout for garbage paths,
 * so it defaults to English, but if the failing path already carried a valid
 * locale (e.g. /en/nowhere) it stays in that locale so the links keep the
 * visitor in their language.
 */
function activeLocaleFromPath(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const { locale } = stripLocale(window.location.pathname)
  return locale ?? DEFAULT_LOCALE
}

export function NotFound() {
  const locale = activeLocaleFromPath()
  const t = getMessages(locale)

  return (
    <main className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      <div className="grid items-center gap-10 py-16 md:min-h-[70dvh] md:grid-cols-[1fr_minmax(0,440px)] md:gap-16 md:py-24">
        <div className="max-w-[42ch] md:order-1">
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
          <p
            className="mt-4 max-w-[48ch] text-ink-secondary"
            style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
          >
            {t.notFound.body}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to={localePath(locale, '/')} className={btnPrimary}>
              {t.notFound.home}
            </Link>
            <Link to={localePath(locale, '/books')} className={cn(inkLink)}>
              {t.notFound.browse}
            </Link>
          </div>
        </div>
        <div className="md:order-2">
          <div className="h-56 w-full overflow-hidden rounded-lg sm:h-72 md:h-[24rem]">
            <img
              src="/site/photo-open-street.jpg"
              alt={t.notFound.imageAlt}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover object-center ring-1 ring-[var(--color-hairline-on-image)]"
            />
          </div>
        </div>
      </div>
    </main>
  )
}
