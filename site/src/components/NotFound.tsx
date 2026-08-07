import { Link, useRouterState } from '@tanstack/react-router'
import { getMessages } from '~/i18n'
import { DEFAULT_LOCALE, type Locale } from '~/i18n/config'
import { localePath, stripLocale } from '~/i18n/routing'
import { btnPrimary } from '~/lib/ui'
import { FlickerText } from '~/components/FlickerText'

/**
 * NotFound: the designed 404, wired as the router's default not-found component
 * (see router.tsx and __root.tsx), so every unmatched path lands here.
 *
 * Composition, top to bottom, centered on the canvas with generous whitespace:
 *   1. The misprinted-park PAINTING (imagery manifest), presented like every
 *      other page image (rounded-lg, hairline ring on the image edge, no tint).
 *   2. A flickering "404" display heading (FlickerText: a tired neon sign that
 *      is fully lit at SSR and dips glyph opacity after mount; static under
 *      prefers-reduced-motion). It is the page h1.
 *   3. A dry, warm paragraph that turns "no tracking" into the joke it deserves:
 *      because we do not track anyone, we genuinely cannot know how you arrived.
 *   4. ONE primary action: "Take me home", linking to the locale home page.
 *
 * Locale awareness: this renders outside the /{locale} layout for garbage paths,
 * so it defaults to English, but if the failing path already carried a valid
 * locale (e.g. /da/nowhere) it stays in that locale so the paragraph AND the
 * button are in the visitor's language. The pathname is read from router state,
 * which is populated on the server too, so the SSR HTML is already localized (no
 * English flash before hydration); a window fallback covers any edge.
 */
function useNotFoundLocale(): Locale {
  const routerPath = useRouterState({
    select: (s) => s.location.pathname,
  })
  const path =
    routerPath ||
    (typeof window !== 'undefined' ? window.location.pathname : '')
  const { locale } = stripLocale(path)
  return locale ?? DEFAULT_LOCALE
}

export function NotFound() {
  const locale = useNotFoundLocale()
  const t = getMessages(locale)

  return (
    <main className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      <div className="mx-auto flex max-w-[46rem] flex-col items-center py-16 text-center md:py-24">
        {/* The misprinted-park painting, presented like other page images. */}
        <div className="w-full max-w-[34rem] overflow-hidden rounded-lg">
          <img
            src="/site/painted-misprinted-park.jpg"
            alt={t.notFound.imageAlt}
            loading="eager"
            decoding="async"
            className="h-56 w-full object-cover object-center ring-1 ring-[var(--color-hairline-on-image)] sm:h-64 md:h-72"
          />
        </div>

        {/* The flickering "404" heading (the page h1). */}
        <FlickerText className="mt-10 text-ink md:mt-12" />

        {/* Dry, warm paragraph: no tracking, so we genuinely cannot know. */}
        <p
          className="mt-6 max-w-[48ch] text-ink-secondary"
          style={{
            fontSize: 'var(--text-body-lg)',
            lineHeight: 'var(--text-body-lg--line-height)',
          }}
        >
          {t.notFound.para}
        </p>

        {/* One primary action: home. */}
        <div className="mt-9">
          <Link to={localePath(locale, '')} className={btnPrimary}>
            {t.notFound.homeCta}
          </Link>
        </div>
      </div>
    </main>
  )
}
