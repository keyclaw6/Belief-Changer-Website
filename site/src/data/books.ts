import type { Book } from './types'
import {
  sugarChapter1,
  scrollingChapter1,
  scrollingChapter2,
  scrollingChapter3,
} from './sample-chapters'

/**
 * Books fixture, MOCK data for v1.
 *
 * Derived from assets/covers/covers-manifest.json (10 books). Cover, spine, and
 * back paths point at the copies in /public/covers (never modified). Titles use
 * the "The Sugar Trap" pattern from the manifest titleKeys. Statuses, versions,
 * language counts, promises, and chapter lists are MOCK and marked as such here.
 *
 * Sample chapters (real long-form prose written in register) exist for two
 * books per SITE-PLAN: scrolling (3 chapters) and sugar (1). Every other book
 * lists chapter titles with a "being written" state and no body.
 *
 * The changelog is functional content (version id · date · what · why) with NO
 * attribution of any kind, ever.
 */

// Helper: build a list of title-only, body-less chapters (being-written state).
function titleChapters(titles: string[]): Book['chapters'] {
  return titles.map((title, i) => ({ n: i + 1, title }))
}

export const books: Book[] = [
  // ---- SUGAR (published; 1 real sample chapter) ----------------------------
  {
    slug: 'sugar',
    cover: '/covers/01-sugar.png',
    spine: '/covers/derived/sugar-spine.png',
    back: '/covers/derived/sugar-back.png',
    groundHex: '#DBD9D8', // from covers-manifest.json
    overlayInk: 'charcoal', // from covers-manifest.json overlayInk
    title: 'The Sugar Trap',
    promise: 'The craving is withdrawal wearing the mask of hunger. See it once and it loosens.',
    status: 'published',
    version: 3, // MOCK
    versionDate: 'June 2026', // MOCK
    languages: 7, // MOCK
    formats: { read: 'available', epub: 'available', audio: 'in-production' },
    chapters: [
      { n: 1, title: 'The afternoon walk to the kitchen', body: sugarChapter1 }, // sample
      { n: 2, title: 'What the sweetness actually buys' },
      { n: 3, title: 'The stone in the shoe' },
      { n: 4, title: 'Hunger, and the thing that imitates it' },
      { n: 5, title: 'Walking out' },
    ],
    changelog: [
      {
        version: 'v3.0',
        date: 'June 2026',
        what: 'Rewrote the opening chapter around the afternoon craving.',
        why: 'Readers said the old opening started too far from the moment they recognized.',
      },
      {
        version: 'v2.0',
        date: 'March 2026',
        what: 'Added the chapter separating hunger from withdrawal.',
        why: 'The distinction was the single most common thing readers wanted made plainer.',
      },
      {
        version: 'v1.0',
        date: 'January 2026',
        what: 'First published edition.',
        why: 'Initial release.',
      },
    ],
  },

  // ---- SMOKING (published) -------------------------------------------------
  {
    slug: 'smoking',
    cover: '/covers/02-smoking.png',
    spine: '/covers/derived/smoking-spine.png',
    back: '/covers/derived/smoking-back.png',
    groundHex: '#9AA28D',
    overlayInk: 'charcoal', // from covers-manifest.json overlayInk
    title: 'The Smoking Trap',
    promise: 'It never relaxed you. It created the tension it then relieved.',
    status: 'published',
    version: 4, // MOCK
    versionDate: 'May 2026', // MOCK
    languages: 9, // MOCK
    formats: { read: 'available', epub: 'available', audio: 'available' },
    chapters: titleChapters([
      'The cigarette that fixes nothing',
      'The tension it built for you',
      'What relaxation really is',
      'The last one',
    ]),
    changelog: [
      {
        version: 'v4.0',
        date: 'May 2026',
        what: 'Clarified the difference between relaxation and relief.',
        why: 'The relief-versus-relaxation confusion kept surfacing in reader notes.',
      },
      {
        version: 'v3.0',
        date: 'February 2026',
        what: 'Trimmed the middle chapters for pace.',
        why: 'Readers reported losing momentum midway through.',
      },
    ],
  },

  // ---- SCROLLING (published; 3 real sample chapters) -----------------------
  {
    slug: 'scrolling',
    cover: '/covers/03-scrolling.png',
    spine: '/covers/derived/scrolling-spine.png',
    back: '/covers/derived/scrolling-back.png',
    groundHex: '#6C8594',
    overlayInk: 'bone', // from covers-manifest.json overlayInk
    title: 'The Scrolling Trap',
    promise:
      'For when the feed owns your evenings and your attention feels rented. This book takes the scrolling trap apart piece by piece: where the pull comes from, what it actually delivers, and why stopping will feel like relief rather than loss.',
    status: 'published',
    version: 3, // MOCK
    versionDate: 'June 2026', // MOCK
    languages: 12, // MOCK
    formats: { read: 'available', epub: 'available', audio: 'in-production' },
    chapters: [
      { n: 1, title: 'The reach', body: scrollingChapter1 }, // sample
      { n: 2, title: 'What it gives and what it takes', body: scrollingChapter2 }, // sample
      { n: 3, title: 'You were never the problem', body: scrollingChapter3 }, // sample
      { n: 4, title: 'Boredom scrolling' },
      { n: 5, title: 'The empty moments, returned' },
    ],
    // Sample changelog copy from the proposal (04-book-page). No attribution.
    changelog: [
      {
        version: 'v3',
        date: 'June 2026',
        what: 'Rewrote chapter 4 on "boredom scrolling".',
        why: 'Readers kept reporting the belief survived chapter 3.',
      },
      {
        version: 'v2',
        date: 'March 2026',
        what: 'Added the morning-phone chapter.',
        why: 'The most requested gap.',
      },
      {
        version: 'v1',
        date: 'January 2026',
        what: 'First edition.',
        why: 'Initial release.',
      },
    ],
  },

  // ---- PORN (being written) ------------------------------------------------
  {
    slug: 'porn',
    cover: '/covers/04-porn.png',
    spine: '/covers/derived/porn-spine.png',
    back: '/covers/derived/porn-back.png',
    groundHex: '#CEC7BC',
    overlayInk: 'charcoal', // from covers-manifest.json overlayInk
    title: 'The Porn Trap',
    promise: 'A promise of intimacy that quietly trains you away from the real thing.',
    status: 'being-written',
    version: 0, // MOCK: not yet published
    versionDate: '',
    languages: 0,
    formats: { read: 'none', epub: 'none', audio: 'none' },
    chapters: titleChapters([
      'The counterfeit and the real',
      'What it trains you toward',
      'Rebuilding the appetite for the genuine',
    ]),
    changelog: [],
  },

  // ---- ALCOHOL (being written) ---------------------------------------------
  {
    slug: 'alcohol',
    cover: '/covers/05-alcohol.png',
    spine: '/covers/derived/alcohol-spine.png',
    back: '/covers/derived/alcohol-back.png',
    groundHex: '#51533B',
    overlayInk: 'bone', // from covers-manifest.json overlayInk
    title: 'The Alcohol Trap',
    promise: 'It borrows tomorrow’s calm and charges interest tonight.',
    status: 'being-written',
    version: 0,
    versionDate: '',
    languages: 0,
    formats: { read: 'none', epub: 'none', audio: 'none' },
    chapters: titleChapters([
      'The drink that unwinds nothing',
      'The borrowed calm',
      'The morning after the belief',
    ]),
    changelog: [],
  },

  // ---- GAMING (in translation) ---------------------------------------------
  {
    slug: 'gaming',
    cover: '/covers/06-gaming.png',
    spine: '/covers/derived/gaming-spine.png',
    back: '/covers/derived/gaming-back.png',
    groundHex: '#BFA482',
    overlayInk: 'charcoal', // from covers-manifest.json overlayInk
    title: 'The Gaming Trap',
    promise: 'Endless progress that leaves you exactly where you started.',
    status: 'in-translation',
    version: 1, // MOCK
    versionDate: 'April 2026', // MOCK
    languages: 3, // MOCK
    formats: { read: 'available', epub: 'available', audio: 'none' },
    chapters: titleChapters([
      'The progress that goes nowhere',
      'The loop and the life outside it',
      'Playing without being played',
    ]),
    changelog: [
      {
        version: 'v1.0',
        date: 'April 2026',
        what: 'First published edition.',
        why: 'Initial release.',
      },
    ],
  },

  // ---- JUNK FOOD (being written) -------------------------------------------
  {
    slug: 'junkfood',
    cover: '/covers/07-junkfood.png',
    spine: '/covers/derived/junkfood-spine.png',
    back: '/covers/derived/junkfood-back.png',
    groundHex: '#D07452',
    overlayInk: 'charcoal', // from covers-manifest.json overlayInk
    title: 'The Junk Food Trap',
    promise: 'Engineered to override the signal that says you have had enough.',
    status: 'being-written',
    version: 0,
    versionDate: '',
    languages: 0,
    formats: { read: 'none', epub: 'none', audio: 'none' },
    chapters: titleChapters([
      'The food that never fills you',
      'The overridden signal',
      'Getting the signal back',
    ]),
    changelog: [],
  },

  // ---- VAPING (being written) ----------------------------------------------
  {
    slug: 'vaping',
    cover: '/covers/08-vaping.png',
    spine: '/covers/derived/vaping-spine.png',
    back: '/covers/derived/vaping-back.png',
    groundHex: '#A7B0A4',
    overlayInk: 'charcoal', // from covers-manifest.json overlayInk
    title: 'The Vaping Trap',
    promise: 'The same old trap in a cleaner-looking package.',
    status: 'being-written',
    version: 0,
    versionDate: '',
    languages: 0,
    formats: { read: 'none', epub: 'none', audio: 'none' },
    chapters: titleChapters([
      'The clean-looking hook',
      'The tension underneath',
      'The last cloud',
    ]),
    changelog: [],
  },

  // ---- OVERTHINKING (gathering voices) -------------------------------------
  {
    slug: 'overthinking',
    cover: '/covers/09-overthinking.png',
    spine: '/covers/derived/overthinking-spine.png',
    back: '/covers/derived/overthinking-back.png',
    groundHex: '#C0A09A',
    overlayInk: 'charcoal', // from covers-manifest.json overlayInk
    title: 'The Overthinking Trap',
    promise: 'The mind promises that one more loop will finally make you safe.',
    status: 'gathering-voices',
    version: 0,
    versionDate: '',
    languages: 0,
    formats: { read: 'none', epub: 'none', audio: 'none' },
    chapters: titleChapters([
      'The loop that promises safety',
      'The one loose thread',
      'Letting the knot fall open',
    ]),
    changelog: [],
  },

  // ---- COMPLAINING (gathering voices) --------------------------------------
  {
    slug: 'complaining',
    cover: '/covers/10-complaining.png',
    spine: '/covers/derived/complaining-spine.png',
    back: '/covers/derived/complaining-back.png',
    groundHex: '#E1C5A0',
    overlayInk: 'charcoal', // from covers-manifest.json overlayInk
    title: 'The Complaining Trap',
    promise: 'Each complaint feels like release and quietly deepens the groove.',
    status: 'gathering-voices',
    version: 0,
    versionDate: '',
    languages: 0,
    formats: { read: 'none', epub: 'none', audio: 'none' },
    chapters: titleChapters([
      'The drip that never drains',
      'The groove it deepens',
      'Turning off the tap',
    ]),
    changelog: [],
  },
]

/** Look up one book by slug. */
export function getBook(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug)
}

/** Books that have at least one readable sample chapter (for the reader demo). */
export function getReadableBooks(): Book[] {
  return books.filter((b) => b.chapters.some((c) => c.body && c.body.length > 0))
}
