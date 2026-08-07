import type { Experience } from './types'

/**
 * Experience board fixture, MOCK data for v1.
 *
 * SITE-PLAN §Fixtures: 6 anonymous samples in register (specific, humble,
 * hopeful). Coarse month only, never a precise date. These are written by the
 * builder as plausible samples; they are not real testimonials and are marked
 * MOCK here. Register: warm, honest, no exclamation marks, zero em-dashes.
 */
export const experiences: Experience[] = [
  {
    id: 'exp-1',
    bookSlug: 'scrolling',
    text: 'I stopped fighting my phone and just watched the reach for a week. Once I could see there was nothing at the bottom of the scroll, putting it down stopped feeling like a sacrifice. I look up more now.',
    month: 'July 2026', // MOCK
  },
  {
    id: 'exp-2',
    bookSlug: 'sugar',
    text: 'The part about withdrawal wearing the mask of hunger undid something for me. The afternoon craving is still there some days, but I know what it is now, and knowing takes almost all the pull out of it.',
    month: 'June 2026', // MOCK
  },
  {
    id: 'exp-3',
    bookSlug: 'smoking',
    text: 'I had quit and relapsed more times than I can count. This was the first time no willpower was involved. The cigarette just stopped looking like something I wanted once I saw what it was actually doing.',
    month: 'June 2026', // MOCK
  },
  {
    id: 'exp-4',
    bookSlug: 'scrolling',
    text: 'What surprised me was the boredom coming back, and how fine it turned out to be. I had forgotten that waiting for a bus could just be waiting for a bus. It is quieter in my head than it has been in years.',
    month: 'May 2026', // MOCK
  },
  {
    id: 'exp-5',
    bookSlug: 'gaming',
    text: 'I still play, but the all-night sessions are gone. Seeing the loop for what it was did not make me hate the games. It just made the 3am version of it lose its grip. Mornings are mine again.',
    month: 'May 2026', // MOCK
  },
  {
    id: 'exp-6',
    bookSlug: 'sugar',
    text: 'I came here at a low point, honestly not expecting much from a free book. It met me with respect instead of a lecture. That mattered as much as anything it said.',
    month: 'April 2026', // MOCK
  },
]
