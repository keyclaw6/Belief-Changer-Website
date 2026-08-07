/**
 * English message catalog, the source of truth.
 *
 * Canonical strings marked (copy deck) are transcribed VERBATIM from
 * docs/SITE-PLAN.md "Canonical copy (en)". Do not paraphrase these; the plan
 * is the structural authority for copy. Non-canonical strings are written in
 * register: warm to the person, harsh to the trap, sentence case, no
 * exclamation marks, zero em-dashes, no AI clichés.
 *
 * This object is also the TypeScript shape all other locales must satisfy
 * (see messages/index.ts). Placeholders use ICU-lite {name} tokens resolved by
 * the t() helper.
 */
export const en = {
  // -- Brand -------------------------------------------------------------
  wordmark: 'Belief Changer', // (copy deck)

  // -- Navigation --------------------------------------------------------
  nav: {
    library: 'Library',
    howItWorks: 'How it works',
    language: 'Language',
    // Theme toggle labels describe the action's result.
    themeToDark: 'Dark mode',
    themeToLight: 'Light mode',
    skipToContent: 'Skip to content',
  },

  // -- Footer ------------------------------------------------------------
  footer: {
    about: 'About',
    requestABook: 'Request a book',
    openSource: 'Open source',
    // (copy deck) footer mono trust line
    trustLine: 'Free forever · no accounts, no tracking',
  },

  // -- Trust strip (copy deck) ------------------------------------------
  trust: {
    freeForever: 'Free forever',
    noSignup: 'No signup',
    noTracking: 'No tracking',
    everyLanguage: 'Every language',
  },

  // -- Home --------------------------------------------------------------
  home: {
    // (copy deck) hero
    heroHeadline: "It's not willpower you're missing. It's the way out of a trap.",
    heroSubtext:
      'Free books that change the belief behind the behavior. In your language. No signup, no cost, no catch.',
    askPlaceholder: 'Tell us what you’re going through...',
    primaryCta: 'Find your book',

    // (copy deck) reframe, three plain sentences
    reframe: {
      sentence1: 'You always choose what you believe is your happiest option.',
      sentence2:
        'A trap is a belief that lies about the math, it promises relief and delivers the opposite.',
      sentence3:
        'These books correct the belief, and the behavior follows on its own.',
    },

    // (copy deck) method beats
    method: {
      beat1Title: 'See the trap clearly',
      beat1Body:
        'Every trap runs on a belief: that the thing is helping you. Each book takes that belief apart, calmly and completely.',
      beat2Title: 'The belief loses its grip',
      beat2Body:
        'When you see what the trap actually gives and what it actually costs, the craving has nothing left to stand on.',
      beat3Title: 'Walking out feels like relief',
      beat3Body:
        'No willpower, no counting days. When the belief changes, leaving stops being sacrifice and starts being escape.',
    },

    // (copy deck) living books
    livingBooksTitle: 'Living books',
    livingBooksBody:
      'Readers improve every book. Versions are public. The newest version is always the one you get.',

    // (copy deck) request section
    requestHeading: 'Which trap should we take apart next?',
    requestCta: 'Add your voice',

    // (copy deck) experiences
    experiencesHeading: 'What readers walked out of',

    // -- Non-canonical homepage strings (in register) -------------------
    // Accessible label for the hero finder field (label is visually hidden).
    askFieldLabel: 'Tell us what you are going through',
    // Heading + lede for the three method beats section ("how escape works").
    methodHeading: 'How escape works',
    methodBody:
      'No willpower, no counting days. Each book takes one belief apart, and the behavior follows.',
    // Living-books section: cross-link to the full library.
    livingBooksLink: 'Browse the library',
    // Next-book section framing line and link to the board.
    requestBody:
      'Vote a book into existence. Enough voices, and the next one gets written.',
    // Experiences section framing line and link to the board.
    experiencesBody: 'Anonymous, honest, and shared with permission.',
    experiencesLink: 'Read more experiences',
    // How-it-works cross-link used on the homepage and book page.
    howItWorksLink: 'How belief change works',
  },

  // -- Statuses (pastel tags) (copy deck) -------------------------------
  status: {
    gatheringVoices: 'Gathering voices', // yellow
    beingWritten: 'Being written', // yellow
    inTranslation: 'In translation', // blue
    published: 'Published', // green
    inProduction: 'In production', // yellow (audio not ready)
  },

  // -- Library -----------------------------------------------------------
  library: {
    title: 'Library',
    intro: 'Every book we have, and every one on the way.',
    searchLabel: 'Find a book',
    searchPlaceholder: 'Search by habit or feeling...',
    // Empty / no-match state is real content, not filler.
    noMatchTitle: 'No book matches that yet.',
    noMatchBody:
      'Tell us what you are struggling with and enough voices will bring the book into existence.',
    noMatchCta: 'Request this book',
    resultsCount: '{count} books',
    resultsCountOne: '1 book',
    clearSearch: 'Clear',
    // Announced to screen readers when the filtered count changes (aria-live).
    resultsFor: '{count} books for “{query}”',
    resultsForOne: '1 book for “{query}”',
  },

  // -- Book page ---------------------------------------------------------
  book: {
    readOnline: 'Read online',
    downloadEpub: 'Download EPUB',
    listen: 'Listen',
    // (copy deck adjacent) versions and formats
    onlyNewestDownload: 'Only the newest version is available for download.',
    versionLabel: 'Version {version} · {month}',
    // Compact mono fact for cards/rows: version plus language count, one dot.
    versionLanguages: 'Version {version} · {count} languages',
    versionLanguagesOne: 'Version {version} · 1 language',
    languagesCount: '{count} languages',
    notYetInLanguage: 'Not yet in your language', // pastel-blue note
    changelogTab: 'Changelog',
    aboutTab: 'About this book',
    improvedFromContributions: 'Improved from reader contributions',
    // (copy deck) improve form
    improveTitle: 'Help the next version',
    improvePromptLostYou: 'Where did it lose you?',
    improvePromptBeliefStanding: 'What belief was still standing?',
    improvePromptWhatHappened: 'What happened for you?',
    improveFreeText: 'Anything else you want the editors to know',
    improveConsent: 'You may publish this as an anonymous reader experience.',
    improveSubmit: 'Send to the editors',
    experiencesEmpty:
      'No experiences for this book yet. Yours could be the first.',

    // -- Non-canonical book-page strings (in register) -----------------
    // Section headings on the book page.
    experiencesHeading: 'What readers walked out of this book',
    versionHeading: 'A living book',
    // Small guide above the improve form explaining what feedback helps most.
    improveGuide:
      'Specific, personal, belief-level notes shape the next version most. The prompts are optional; answer what fits.',
    improveOptional: 'Optional',
    // Improve-form success state (explains the pipeline; no fake numbers).
    improveSuccessTitle: 'Thank you. The editors read everything.',
    improveSuccessBody:
      'The clearest, most personal notes shape the next version, and the changelog records what changed. Nothing here is tied to you.',
    // Cross-link to the method page.
    howItWorksCrosslink: 'How belief change works',
    // Meta line joining version and languages on the book page.
    languagesCountOne: '1 language',
    // Fallback promise label for books still gathering voices, etc.
    notPublishedYet: 'This book is on the way.',
  },

  // -- Reader ------------------------------------------------------------
  reader: {
    prev: 'Previous chapter',
    next: 'Next chapter',
    backToBook: 'Back to the book',
    comfortLight: 'Light',
    comfortSepia: 'Sepia',
    comfortDark: 'Dark',
    chapterOf: 'Chapter {n} of {total}',
    // Group label for the reading-comfort control (screen readers).
    comfortLabel: 'Reading comfort',
    // Chapter-list disclosure on the reading surface.
    chaptersLabel: 'Chapters',
    contents: 'Contents',
    // Dignified state for chapters that are not written yet (non-sample books).
    beingWrittenTitle: 'This chapter is still being written.',
    beingWrittenBody:
      'This book is a living book. The chapters go up as they are finished, and every reader gets the newest version.',
    beingWrittenCta: 'See what changed',
  },

  // -- Requests board ----------------------------------------------------
  requests: {
    title: 'Which trap should we take apart next?',
    intro: 'Vote the next book into existence. No account, no cost.',
    addYourVoice: 'Add your voice',
    voted: 'Voted',
    voteCount: '{count} votes',
    submitTitle: 'Ask for a book',
    submitSubjectLabel: 'What are you struggling with?',
    submitSubjectPlaceholder: 'Say it in your own words...',
    submitExperienceLabel: 'Your experience (optional)',
    submitCta: 'Add your request',
  },

  // -- Experiences board -------------------------------------------------
  experiences: {
    title: 'What readers walked out of',
    intro: 'Anonymous, honest, and shared with permission.',
    filterAll: 'All books',
    empty: 'No experiences yet. Yours could be the first.',
    monthLabel: '{month}',
  },

  // -- Blog --------------------------------------------------------------
  blog: {
    title: 'Notes',
    intro: 'Updates from the library and how the books get better.',
    readMore: 'Read the note',
  },

  // -- About -------------------------------------------------------------
  about: {
    title: 'About Belief Changer',
  },

  // -- 404 ---------------------------------------------------------------
  notFound: {
    title: 'This page isn’t in the library.', // (copy deck)
    body: 'The page you are looking for moved or never existed. The library is still here.',
    home: 'Go to the home page',
    browse: 'Browse the library',
  },

  // -- Language switcher -------------------------------------------------
  langSwitcher: {
    label: 'Change language',
    heading: 'Language',
  },
} as const

