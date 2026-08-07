import type { BlogPost } from './types'

/**
 * Blog fixture, MOCK metadata for v1.
 *
 * SITE-PLAN §Fixtures: 3 posts (the launch note; how books improve; why it is
 * free forever). Milestone 1 provides METADATA ONLY; the post bodies are
 * written by a later milestone. Dates and excerpts are MOCK and in register.
 * The blog index uses the Voice-1 painting painted-kite.jpg (imagery manifest).
 */
export const blogPosts: BlogPost[] = [
  {
    slug: 'why-it-is-free-forever',
    title: 'Why it is free forever',
    excerpt:
      'A person in a trap should not have to reach past a paywall to find the way out. Here is how that stays true.',
    date: 'July 2026', // MOCK
    image: '/site/painted-kite.jpg',
  },
  {
    slug: 'how-the-books-improve',
    title: 'How the books get better',
    excerpt:
      'Every reader who tells us where a book lost them makes the next version clearer for the next person.',
    date: 'June 2026', // MOCK
  },
  {
    slug: 'the-launch-note',
    title: 'The launch note',
    excerpt:
      'A small library, opening its doors. What it is, what it refuses to be, and who it is for.',
    date: 'May 2026', // MOCK
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}
