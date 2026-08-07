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
    experiences: 'Experiences',
    blog: 'Notes',
    openSource: 'Open source',
    // Screen-reader label for the footer's link group.
    navLabel: 'Site',
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
    title: 'Which trap should we take apart next?', // (copy deck)
    intro: 'Vote the next book into existence. No account, no cost.',
    // Honest explanation of the loop, sits under the intro.
    loopExplainer:
      'Each subject below is a book someone asked for. When enough voices gather behind one, the book gets written, and everyone gets it free. Voting takes one tap and asks nothing of you.',
    // Ranked-list section heading (screen readers + a quiet visible label).
    rankedHeading: 'What readers have asked for',
    addYourVoice: 'Add your voice', // (copy deck)
    voted: 'Voice added',
    // Accessible label template for the one-tap vote button on a row.
    voteAria: 'Add your voice to “{subject}”',
    votedAria: 'You added your voice to “{subject}”',
    voteCount: '{count} votes',
    voteCountOne: '1 vote',
    // Row action when the book already exists: link to it instead of a vote.
    readTheBook: 'Read the book',
    // Rank column header (screen readers only).
    rankLabel: 'Rank',
    // Submit flow.
    submitTitle: 'Ask for a book',
    submitBody:
      'Name the trap in your own words. If it is not already on the board, we will add it so others can add their voices too.',
    submitSubjectLabel: 'What are you struggling with?',
    submitSubjectHelp: 'A short, first-person line works best, like the ones above.',
    submitSubjectPlaceholder: 'I can’t stop...',
    submitExperienceLabel: 'What it is like, in your words',
    submitExperienceOptional: 'Optional',
    submitExperiencePlaceholder:
      'Anything you want to say about how it feels or what you have tried.',
    submitCta: 'Add your request',
    // Client-mocked success state (announced via aria-live).
    submitSuccessTitle: 'Your voice is counted.',
    submitSuccessBody:
      'When enough voices gather behind a subject, the book gets written and goes up free for everyone. Nothing here is tied to you.',
    submitAnother: 'Ask for another',
  },

  // -- Experiences board -------------------------------------------------
  experiences: {
    title: 'What readers walked out of', // (copy deck)
    intro: 'Anonymous, honest, and shared with permission.',
    // Longer framing line under the intro on the board itself.
    lede:
      'These are notes from people who read one of the books and wanted to say what changed. Every one is anonymous and shared with permission. No names, no counts, no dates finer than a month.',
    // Filter control.
    filterLabel: 'Show experiences for',
    filterAll: 'All books',
    // Ranked/list section heading for screen readers.
    listHeading: 'Reader experiences',
    // Result-count line (aria-live), mirrors the library pattern.
    countAll: '{count} experiences',
    countAllOne: '1 experience',
    countForBook: '{count} experiences of {book}',
    countForBookOne: '1 experience of {book}',
    // Honest empty state for a filtered book with none.
    emptyFiltered:
      'No experiences of {book} yet. Yours could be the first.',
    empty: 'No experiences yet. Yours could be the first.',
    clearFilter: 'Show all books',
    monthLabel: '{month}',
    // Which book an experience is about (accessible + visible mono line).
    aboutBook: 'On {book}',
    // Submit flow (shares the improve-form consent path conceptually).
    submitTitle: 'Share what happened',
    submitBody:
      'If one of the books changed something for you, you can say so here. It publishes anonymously, with no name and no way to trace it back to you.',
    submitBookLabel: 'Which book',
    submitBookPlaceholder: 'Choose a book',
    submitTextLabel: 'What happened for you?',
    submitTextPlaceholder:
      'What shifted, what surprised you, what it is like now.',
    submitConsentLabel:
      'Publish this anonymously as a reader experience. No name, no account, no way to trace it to you.',
    submitCta: 'Share anonymously',
    submitSuccessTitle: 'Thank you for sharing.',
    submitSuccessBody:
      'Every experience passes a quiet review before it goes up, so others reading at a low moment meet something honest. Nothing here is tied to you.',
    submitAnother: 'Share another',
    // Validation when consent is required but not given.
    consentRequired: 'Please confirm you want this published anonymously.',
    bookRequired: 'Please choose which book this is about.',
  },

  // -- Blog --------------------------------------------------------------
  blog: {
    title: 'Notes',
    intro: 'Updates from the library, and how the books get better.',
    readMore: 'Read the note',
    // Accessible label template for a post card link.
    readAria: 'Read: {title}',
    // Post-page back link and a small meta label.
    backToNotes: 'All notes',
    postedLabel: 'Posted {month}',
  },

  // -- How it works (method page) ---------------------------------------
  howItWorks: {
    // Page masthead.
    title: 'How belief change works',
    lede:
      'No willpower, no shame, no counting days. Every book here rests on one plain idea, and it is worth understanding before you read a word.',
    // 1. The happiest-option principle.
    principleHeading: 'You always pick your happiest option',
    principleBody:
      'In every moment, you do the thing you believe will leave you best off. Not the healthiest thing, not the thing you would defend out loud, the thing that feels like the least bad option right now. This is not a flaw. It is how everyone works. Which means behavior is never really the problem. The belief underneath it is.',
    // 2. The trap lies about the math.
    trapHeading: 'A trap is a belief that lies about the math',
    trapBody:
      'A trap takes hold when a belief quietly miscounts what something gives you and what it costs. The drink promises calm and delivers a worse morning. The scroll promises something good just ahead and delivers the same restlessness, again. As long as the belief holds, reaching for it really is your happiest option, so you reach. The problem was never your strength. It was the arithmetic you were handed.',
    // 3. Knowledge felt in the heart.
    knownHeading: 'It has to be known in the heart, not just the head',
    knownBody:
      'Almost everyone already knows, in the abstract, that the habit costs more than it gives. Knowing it as a fact changes nothing, because the craving does not listen to facts. What each book does is take the belief apart slowly enough that you feel the truth of it, not just agree with it. When the seeing goes deep, the wanting has nothing left to stand on.',
    // 4. No willpower, no shame.
    noWillpowerHeading: 'This is not a fight, and you are not weak',
    noWillpowerBody:
      'Willpower is what you need when part of you still believes the trap is worth it. It is exhausting because it is a war between two halves of the same person. Change the belief and the war ends, because there is no longer anything to resist. If you have tried before and it did not hold, that was never a verdict on your character. The belief simply had not moved yet.',
    // 5. Escape, not sacrifice.
    escapeHeading: 'Leaving becomes escape, not sacrifice',
    escapeBody:
      'When the belief finally shifts, walking away stops feeling like giving something up. You are not white-knuckling past a pleasure you still want. You are stepping out of something you can now see was only ever taking from you. That is why the feeling on the other side is relief, and often a small surprise at how quiet it is.',
    // Closing cross-links.
    closingHeading: 'Find the book for your trap',
    closingBody:
      'Every book is one trap, taken apart this way. If yours is not here yet, add your voice and help bring it into existence.',
    ctaLibrary: 'Browse the library',
    ctaRequests: 'Request a book',
    // Painting alt text (painted-riverside-glide, imagery manifest).
    heroImageAlt:
      'A calm river opening ahead through fresh green light, the way out clear',
  },

  // -- About -------------------------------------------------------------
  about: {
    title: 'About Belief Changer', // (copy deck adjacent)
    // Mission (VISION spirit, written warmly, no org-chart talk).
    missionHeading: 'What this is for',
    missionBody1:
      'There is a way of ending a habit that works by changing the belief underneath it, not by fighting the behavior on top. It has quietly freed a great many people from a few specific traps. This library exists to take that same approach and offer it for every trap, to anyone, in their own language, at no cost.',
    missionBody2:
      'A person looking for the way out should never have to get past a paywall, an account, or a tracker to reach it. So there is none of that here. The books are built and kept by a team of agents working to a single held bar for quality, and the whole thing is designed to give itself away.',
    // The laws, as a quiet list.
    lawsHeading: 'What will always be true here',
    lawFreeTitle: 'Free forever',
    lawFreeBody: 'Every book, free to read, download, and keep. No tier is held back.',
    lawNoSignupTitle: 'No signup',
    lawNoSignupBody: 'No account, no email, no wall between you and the first page.',
    lawNoTrackingTitle: 'No tracking',
    lawNoTrackingBody: 'No cookies, no profiles, nothing on your device we read to follow you.',
    lawEveryLanguageTitle: 'Every language',
    lawEveryLanguageBody: 'Translated as widely as we can reach, because the way out should not depend on your tongue.',
    lawLivingTitle: 'Living books',
    lawLivingBody: 'Readers improve every book, versions are public, and the newest is always the one you get.',
    // The honesty note (measurement contract, stated plainly).
    honestyHeading: 'How we count, honestly',
    honestyBody:
      'We count page views and searches in aggregate, so we can tell which traps people need books for. We never identify you. No cookies, no accounts, no tracking. The only things kept on your device are the ones that make the site work for you: your theme, your language, where you are in a book, and which subjects you have voted for.',
    // Open source note.
    openSourceHeading: 'Open source',
    openSourceBody:
      'The site that serves these books is open source. Anyone can read how it works, check that it does what it says about privacy, and build on it. Nothing about how you are treated here is hidden.',
    openSourceLink: 'Read the source',
    // Photo alt text (photo-open-window, imagery manifest, Quiet Fact voice).
    imageAlt: 'An open window in a quiet room, morning light coming in',
  },

  // -- 404 ---------------------------------------------------------------
  notFound: {
    title: 'This page isn’t in the library.', // (copy deck)
    body: 'The page you were looking for moved or never existed. The library is still here.',
    home: 'Go to the home page',
    browse: 'Browse the library',
    // Photo alt text (photo-open-street, imagery manifest, Quiet Fact voice).
    imageAlt: 'A quiet open street in soft morning light',
  },

  // -- Language switcher -------------------------------------------------
  langSwitcher: {
    label: 'Change language',
    heading: 'Language',
  },
} as const

