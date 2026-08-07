/**
 * Shared fixture types. All fixture DATA in this folder is MOCK for v1 and is
 * marked as such in each file; these types describe the shapes the real backend
 * will eventually serve (see the API contracts in docs/SITE-PLAN.md).
 */

export type BookStatus =
  | 'published'
  | 'being-written'
  | 'in-translation'
  | 'gathering-voices'

export type BookFormatState = 'available' | 'in-production' | 'none'

export interface Chapter {
  /** 1-based chapter number, used in the reader URL /read/{n}. */
  n: number
  title: string
  /**
   * Full chapter body (paragraphs). Present only for the two sample books the
   * builder writes in register (scrolling ×3, sugar ×1); every other chapter
   * lists a title with a "being written" state and no body.
   */
  body?: string[]
}

export interface ChangelogEntry {
  /** Machine version id shown in mono, e.g. "v3.0". */
  version: string
  /** Human month + year, e.g. "June 2026". */
  date: string
  /** What changed. */
  what: string
  /** Why it changed. No attribution of any kind, ever. */
  why: string
}

export interface Book {
  slug: string
  /** Cover asset path under /public (copied from assets/covers, never edited). */
  cover: string
  /** Derived spine/back (copied from assets/covers/derived). */
  spine: string
  back: string
  /** Ground hex sampled from the artwork (from covers-manifest.json). */
  groundHex: string
  /**
   * Ink for the live-text title + series mark overlaid on the cover art
   * (covers-manifest.json `overlayInk`, chosen by WCAG contrast against the
   * ground): 'charcoal' on light grounds, 'bone' on dark ones. Resolved to a
   * hex by inkHex() in BookCover.
   */
  overlayInk: 'charcoal' | 'bone'
  /** English title (localized titles arrive with the locale catalogs). */
  title: string
  /** One-line promise, in register. */
  promise: string
  status: BookStatus
  /** Current version number (mock). */
  version: number
  /** Human date for the current version (mock). */
  versionDate: string
  /** Languages the book currently exists in (mock counts). */
  languages: number
  formats: {
    read: BookFormatState
    epub: BookFormatState
    audio: BookFormatState
  }
  chapters: Chapter[]
  changelog: ChangelogEntry[]
}

export interface RequestRow {
  id: string
  /** First-person subject, e.g. "I can't stop checking my phone". */
  subject: string
  status: BookStatus
  /** Vote count (mock, plausible). */
  votes: number
  /** If published, the slug of the resulting book. */
  bookSlug?: string
}

export interface Experience {
  id: string
  /** Slug of the book this experience is about. */
  bookSlug: string
  /** Anonymous excerpt in register. */
  text: string
  /** Coarse month only (never a precise date), e.g. "May 2026". */
  month: string
}

export interface BlogPost {
  slug: string
  title: string
  /** One-line standfirst. */
  excerpt: string
  /** Publication month, e.g. "July 2026". */
  date: string
  /** Voice-1 painting used on the blog index (imagery manifest). */
  image?: string
  /**
   * Post body paragraphs. Builder-written SAMPLE prose for v1 (flagged in
   * blog.ts, never labeled "sample" in the UI). DM Sans body, 65ch measure on
   * the post page.
   */
  body?: string[]
}
