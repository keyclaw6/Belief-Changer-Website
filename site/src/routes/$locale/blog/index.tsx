import { useEffect } from 'react'
import { Link, createFileRoute, useParams } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import { getMessages, format } from '~/i18n'
import { type Locale } from '~/i18n/config'
import { hreflangAlternates, localePath } from '~/i18n/routing'
import { blogPosts } from '~/data'
import type { BlogPost } from '~/data/types'
import type { Messages } from '~/i18n'
import { track } from '~/lib/measure'
import { Reveal } from '~/components/Reveal'
import { Painting } from '~/components/Painting'
import { inkLink } from '~/lib/ui'
import { cn } from '~/lib/utils'

/**
 * Blog index (M4): updates and stories, the source for social posts (SITE-PLAN
 * sitemap). The living-pages painting anchors the header as the section's single voice
 * (imagery manifest). The posts then run as an editorial list with sparse
 * hairline dividers rather than three equal cards (a banned pattern): each row
 * is a title, a month in mono, and a one-line standfirst, the whole row a link
 * into the post. Exactly one row per post.
 *
 * Layout families, distinct: an image-anchored header and a divided editorial
 * list. Eyebrow count: zero.
 */
export const Route = createFileRoute('/$locale/blog/')({
  head: () => ({
    links: hreflangAlternates('/blog').map((a) => ({
      rel: 'alternate',
      hrefLang: a.hrefLang,
      href: a.href,
    })),
  }),
  component: BlogIndexPage,
})

function BlogIndexPage() {
  const { locale } = useParams({ from: '/$locale/blog/' })
  const activeLocale = locale as Locale
  const t = getMessages(activeLocale)

  useEffect(() => {
    track('page_view', { routeClass: 'blog', locale: activeLocale })
  }, [activeLocale])

  return (
    <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw]">
      {/* Image-anchored header: the painting is the section's single voice. */}
      <section className="pt-14 md:pt-[88px]">
        <Reveal>
          <Painting
            src="/site/painted-living-pages.png"
            alt={t.blog.imageAlt}
            priority
            sizes="(max-width: 1400px) 90vw, 1260px"
            className="mb-11 max-w-[72rem]"
          />
        </Reveal>
        <Reveal>
          <h1
            className="text-ink"
            style={{
              fontSize: 'var(--text-headline-lg)',
              fontWeight: 'var(--text-headline-lg--font-weight)',
              lineHeight: 'var(--text-headline-lg--line-height)',
              letterSpacing: 'var(--text-headline-lg--letter-spacing)',
            }}
          >
            {t.blog.title}
          </h1>
          <p
            className="mt-3 max-w-[52ch] text-ink-secondary"
            style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
          >
            {t.blog.intro}
          </p>
        </Reveal>
      </section>

      {/* Editorial list: sparse dividers, one row per post. */}
      <section className="pb-[var(--spacing-section-y)] pt-12">
        <ul className="max-w-[62rem]">
          {blogPosts.map((post, i) => (
            <Reveal key={post.slug} as="li" index={Math.min(i, 7)}>
              <PostRow post={post} first={i === 0} locale={activeLocale} t={t} />
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  )
}

function PostRow({
  post,
  first,
  locale,
  t,
}: {
  post: BlogPost
  first: boolean
  locale: Locale
  t: Messages
}) {
  return (
    <Link
      to={localePath(locale, `/blog/${post.slug}`)}
      aria-label={format(t.blog.readAria, { title: post.title })}
      className={cn(
        'group block no-underline',
        !first && 'border-t border-hairline',
        'py-8 md:py-9',
      )}
    >
      <p className="type-mono-meta">{format(t.blog.postedLabel, { month: post.date })}</p>
      <h2
        className="mt-3 max-w-[26ch] text-ink transition-opacity duration-150 group-hover:opacity-70"
        style={{
          fontSize: 'var(--text-headline-md)',
          fontWeight: 'var(--text-headline-md--font-weight)',
          lineHeight: 'var(--text-headline-md--line-height)',
        }}
      >
        {post.title}
      </h2>
      <p
        className="mt-3 max-w-[62ch] text-ink-secondary"
        style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
      >
        {post.excerpt}
      </p>
      <span className={cn(inkLink, 'mt-4 inline-flex items-center gap-1.5 no-underline')}>
        {t.blog.readMore}
        <ArrowRight size={15} weight="bold" aria-hidden="true" className="dir-flip" />
      </span>
    </Link>
  )
}
