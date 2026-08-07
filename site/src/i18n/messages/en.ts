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
  },

  // -- Book page ---------------------------------------------------------
  book: {
    readOnline: 'Read online',
    downloadEpub: 'Download EPUB',
    listen: 'Listen',
    // (copy deck adjacent) versions and formats
    onlyNewestDownload: 'Only the newest version is available for download.',
    versionLabel: 'Version {version} · {month}',
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

