import { useEffect } from 'react'
import { Link, createFileRoute, notFound, useParams } from '@tanstack/react-router'
import { ArrowLeft } from '@phosphor-icons/react'
import { getMessages, format } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates, localePath } from '~/i18n/routing'
import { getBlogPost } from '~/data'
import { track } from '~/lib/measure'
import { Reveal } from '~/components/Reveal'

/**
 * Blog post page (M4): a clean editorial reading layout at a 65ch measure. The
 * body is DM Sans, NOT Newsreader (Newsreader survives only on the book reading
 * surface, per DESIGN.md Typography). A quiet back link returns to the index;
 * hreflang alternates are emitted per post. Sentence-case heading, warm plain
 * body, zero em-dashes. Unknown slugs 404 in beforeLoad.
 *
 * Post bodies are builder-written SAMPLE prose (flagged in src/data/blog.ts,
 * never labeled "sample" in the UI).
 */
export const Route = createFileRoute('/$locale/blog/$slug')({
  beforeLoad: ({ params }) => {
    if (!getBlogPost(params.slug)) throw notFound()
  },
  head: ({ params }) => {
    const post = getBlogPost(params.slug)
    return {
      meta: post
        ? [
            { title: `${post.title} · Belief Changer` },
            { name: 'description', content: post.excerpt },
          ]
        : [],
      links: hreflangAlternates(`/blog/${params.slug}`).map((a) => ({
        rel: 'alternate',
        hrefLang: a.hrefLang,
        href: a.href,
      })),
    }
  },
  component: BlogPostPage,
})

function BlogPostPage() {
  const { locale, slug } = useParams({ from: '/$locale/blog/$slug' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)
  const post = getBlogPost(slug)

  useEffect(() => {
    if (post) track('page_view', { routeClass: 'blog-post', locale: activeLocale })
  }, [activeLocale, post])

  if (!post) return null

  return (
    <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      <article className="mx-auto max-w-[65ch] pb-[var(--spacing-section-y)] pt-14 md:pt-[88px]">
        <Reveal>
          <Link
            to={localePath(activeLocale, '/blog')}
            className="inline-flex items-center gap-1.5 type-ui-sm font-medium text-ink-secondary no-underline transition-colors duration-150 hover:text-ink"
          >
            <ArrowLeft size={15} weight="bold" aria-hidden="true" className="dir-flip" />
            {t.blog.backToNotes}
          </Link>
        </Reveal>

        <Reveal>
          <header className="mt-8">
            <p className="type-mono-meta">{format(t.blog.postedLabel, { month: post.date })}</p>
            <h1
              className="mt-3 text-ink"
              style={{
                fontSize: 'var(--text-headline-lg)',
                fontWeight: 'var(--text-headline-lg--font-weight)',
                lineHeight: 'var(--text-headline-lg--line-height)',
                letterSpacing: 'var(--text-headline-lg--letter-spacing)',
              }}
            >
              {post.title}
            </h1>
          </header>
        </Reveal>

        <Reveal>
          <div className="mt-9 border-t border-hairline pt-9">
            {(post.body ?? []).map((para, i) => (
              <p
                key={i}
                className={i > 0 ? 'mt-6 text-ink' : 'text-ink'}
                style={{
                  fontSize: 'var(--text-body-lg)',
                  lineHeight: 'var(--text-body-lg--line-height)',
                  textWrap: 'pretty',
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-12 border-t border-hairline pt-8">
            <Link
              to={localePath(activeLocale, '/blog')}
              className="inline-flex items-center gap-1.5 type-ui-sm font-medium text-ink-secondary no-underline transition-colors duration-150 hover:text-ink"
            >
              <ArrowLeft size={15} weight="bold" aria-hidden="true" />
              {t.blog.backToNotes}
            </Link>
          </div>
        </Reveal>
      </article>
    </div>
  )
}
