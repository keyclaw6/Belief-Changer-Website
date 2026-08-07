import type { RequestRow } from './types'

/**
 * Request board fixture, MOCK data for v1.
 *
 * SITE-PLAN §Fixtures: 8 rows across all statuses, plausible-but-mock vote
 * counts. First-person subjects in register. Published rows link to their book.
 * Vote counts are MOCK and are not presented anywhere as real analytics.
 */
export const requests: RequestRow[] = [
  {
    id: 'req-scrolling',
    subject: 'I can’t stop scrolling',
    status: 'published',
    votes: 2140, // MOCK
    bookSlug: 'scrolling',
  },
  {
    id: 'req-sugar',
    subject: 'I reach for sugar every afternoon',
    status: 'published',
    votes: 1876, // MOCK
    bookSlug: 'sugar',
  },
  {
    id: 'req-overthinking',
    subject: 'I overthink everything until I’m exhausted',
    status: 'gathering-voices',
    votes: 1523, // MOCK
  },
  {
    id: 'req-alcohol',
    subject: 'I drink to take the edge off, every night',
    status: 'being-written',
    votes: 1310, // MOCK
  },
  {
    id: 'req-porn',
    subject: 'I use porn to avoid being close to anyone',
    status: 'being-written',
    votes: 1188, // MOCK
  },
  {
    id: 'req-complaining',
    subject: 'I complain about everything and feel worse',
    status: 'gathering-voices',
    votes: 742, // MOCK
  },
  {
    id: 'req-procrastination',
    subject: 'I put off the things that matter most',
    status: 'gathering-voices',
    votes: 690, // MOCK
  },
  {
    id: 'req-gaming',
    subject: 'I game until 3am and hate the mornings',
    status: 'in-translation',
    votes: 615, // MOCK
    bookSlug: 'gaming',
  },
]
