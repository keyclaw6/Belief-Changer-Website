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
    books: 'Books',
    howItWorks: 'How it works',
    experiences: 'Experiences',
    notes: 'Notes',
    about: 'About',
    language: 'Language',
    menu: 'Menu',
    // Pull-cord (theme switch) labels, describing what the pull will do.
    lightsOff: 'Turn the lights off',
    lightsOn: 'Turn the lights on',
    skipToContent: 'Skip to content',
  },

  // -- Footer (four columns + mono trust line) --------------------------
  footer: {
    // One line under the wordmark in the first column.
    tagline: 'Free books that change the belief behind the behavior.',
    libraryHeading: 'Library',
    communityHeading: 'Community',
    smallPrintHeading: 'The small print',
    books: 'Books',
    requestABook: 'Request a book',
    experiences: 'Experiences',
    notes: 'Notes',
    contribute: 'Contribute',
    about: 'About',
    privacy: 'Privacy',
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

  // -- Home (the story in five beats) -----------------------------------
  home: {
    // (copy deck) hero. "trap" earns its place in the hero, the one spot it does.
    heroHeadline: "It's not willpower you're missing. It's the way out of a trap.",
    heroSubtext:
      'Free books that change the belief behind the behavior. In your language, free forever, no signup, no catch.',
    askPlaceholder: 'Tell us what you’re going through...',
    primaryCta: 'Find your book',
    // Accessible label for the hero finder field (label is visually hidden).
    askFieldLabel: 'Tell us what you are going through',
    // The quiet tappable examples under the finder.
    exampleScrolling: 'scrolling',
    exampleSugar: 'sugar',
    exampleSmoking: 'smoking',
    exampleOverthinking: 'overthinking',
    exampleAlcohol: 'alcohol',
    exampleMore: 'more',
    examplesLabel: 'Try one of these',

    // Beat 1 (copy deck).
    beat1Title: 'You have been trying to fix the behavior.',
    beat1Body:
      'Stopping. Cutting down. Deleting the app, pouring it out, promising yourself. That is working on the behavior. But behavior follows reasons, and the reasons live in what you believe the thing does for you. Leave the belief standing, and the behavior grows back.',
    beat1ImageAlt:
      'A person paused on an evening city street, phone a soft glow in hand, warm windows above',

    // Beat 2 (copy deck).
    beat2Title: 'Shaming never helps.',
    beat2Body:
      'Not from others, not from yourself. Shame pushes the whole thing into the dark, and in the dark it grows. Understanding works in the open. These books assume you are intelligent and simply never got shown how beliefs drive behavior.',
    beat2ImageAlt:
      'Two people on a park bench in morning light, one listening properly',

    // Beat 3 (copy deck).
    beat3Title: 'You always choose what seems happiest.',
    beat3Body:
      'Everyone does, every time. The behavior you want rid of is winning that choice because of what you believe it gives you, and beliefs can be wrong about the math: crediting relief they never provided, hiding what they cost. While the belief stands, it keeps winning.',
    beat3ImageAlt:
      'A person looking out over a bright morning landscape, the way ahead clear',

    // Beat 4 (copy deck).
    beat4Title: 'Understanding does what willpower cannot.',
    beat4Body:
      'When you see where the pull comes from and what it actually delivers, the belief corrects itself, and the behavior follows on its own. No fighting, no counting days. That is the entire method: how it works, described well enough to feel.',
    beat4ImageAlt:
      'A birdcage in warm light, its door open and empty, the bird already perched on a sunlit windowsill nearby',

    // Beat 5 (copy deck).
    beat5Title: 'Afterwards it feels like relief.',
    beat5Body: 'Not sacrifice. Once the belief is gone, there is nothing to give up.',
    beat5ImageAlt: 'A rower gliding along an open riverside in fresh air',
    beat5Cta: 'How it works',

    // The library section (copy deck).
    libraryTitle: 'The books.',
    libraryBody:
      'Each one takes a single behavior apart: where the pull comes from, what it actually gives you, what it costs. Free to read, download, or listen to.',
    libraryLink: 'All books',

    // The marquee mission line (copy deck), centered beneath the band.
    marqueeMission:
      'Everything here is free, in every language we can reach, with no accounts and no tracking. The goal is only to help as many people as possible.',
    // Screen-reader label for the marquee region.
    marqueeLabel: 'What readers have said',

    // The living library, three quiet columns (copy deck).
    livingBooksTitle: 'Living books.',
    livingBooksBody:
      'Readers improve every book. Versions are public, and the newest version is always the one you get.',
    nextBookTitle: 'The next book is chosen by you.',
    nextBookCta: 'Add your voice',
    livingExperiencesTitle: 'Experiences.',
    livingExperiencesLink: 'Read more',
  },

  // -- Statuses (pastel tags) (copy deck) -------------------------------
  status: {
    gatheringVoices: 'Gathering voices', // yellow
    beingWritten: 'Being written', // yellow
    inTranslation: 'In translation', // blue
    published: 'Published', // green
    inProduction: 'In production', // yellow (audio not ready)
  },

  // -- Library (copy deck 03-books) --------------------------------------
  library: {
    title: 'The library',
    intro:
      'Every book takes one trap apart until it has nothing left to offer you. Free to read, download, and listen to. Improved by the readers before you.',
    searchLabel: 'Find your book',
    searchPlaceholder: 'Tell us what you’re going through...',
    // The tappable first-person subject chips beneath the finder.
    chipsLabel: 'Or start from one of these',
    chipScrolling: 'I can’t stop scrolling',
    chipSugar: 'Sugar has a grip on me',
    chipSmoking: 'I want to stop smoking',
    chipAlcohol: 'I drink more than I want to',
    chipGaming: 'Gaming eats my evenings',
    chipOverthinking: 'I overthink everything',
    // No-match state (copy deck): real content, not filler.
    noMatchTitle: 'We have not written that book yet.',
    noMatchBody:
      'That is exactly how the library grows. Tell us what you are up against, and when enough voices ask, the book gets written.',
    noMatchCta: 'Request this book',
    resultsCount: '{count} books',
    resultsCountOne: '1 book',
    clearSearch: 'Clear',
    // Announced to screen readers when the filtered count changes (aria-live).
    resultsFor: '{count} books for “{query}”',
    resultsForOne: '1 book for “{query}”',
    // Foot strip to the request board (copy deck).
    footStrip: 'The library is chosen by its readers. See what is being voted on next.',
    footStripLink: 'The request board',
    // Yellow tag on being-written covers in the grid.
    beingWritten: 'Being written',
  },

  // -- Book page (copy deck 04-book-page) --------------------------------
  book: {
    readOnline: 'Read online',
    // Reader upgrade: "Read online" becomes this when a position is remembered.
    continueReading: 'Continue reading',
    downloadEpub: 'Download EPUB',
    listen: 'Listen',
    onlyNewestDownload: 'Only the newest version is available for download.',
    versionLabel: 'Version {version} · {month}',
    // Compact mono fact for cards/rows: version plus language count, one dot.
    versionLanguages: 'Version {version} · {count} languages',
    versionLanguagesOne: 'Version {version} · 1 language',
    languagesCount: '{count} languages',
    languagesCountOne: '1 language',
    // Mono line on the book masthead (copy deck): version · languages · improved.
    improvedFromContributions: 'Improved from reader contributions',
    notYetInLanguage: 'Not yet in your language', // pastel-blue note
    changelogTab: 'Changelog',
    aboutTab: 'About this book',

    // About-this-book paragraph (copy deck).
    aboutBody:
      'Like every book here, this one is alive. Readers tell us where it lost them, and the next version says it better. Below you can see exactly what changed and when, and only the newest version is ever offered for download.',

    // THE single-field feedback (copy deck): no checkbox, no extra fields.
    improveTitle: 'Help the next version',
    improveBody:
      'Please give us feedback. Do you have a personal experience you want to share? Something that did not feel described well enough for the belief to change? Write it here, exactly as it comes. It lands with the editors, and the best of it shapes the next version of this book.',
    improvePlaceholder: 'Write it here, exactly as it comes...',
    improveFieldLabel: 'Your feedback',
    improveSubmit: 'Send it',
    // After sending (copy deck).
    improveSuccessBody:
      'Thank you. Every version of this book exists because someone wrote in this box.',

    // Experiences-with-this-book section (copy deck links).
    experiencesHeading: 'Experiences with this book',
    experiencesReadMore: 'Read more experiences',
    experiencesShareYours: 'Share yours',
    experiencesEmpty: 'No experiences for this book yet. Yours could be the first.',

    // Cross-link foot (copy deck).
    crosslinkLead: 'New here? Understand why this works before you start.',
    howItWorksCrosslink: 'How it works',

    // Fallback for books with no version yet (mono block).
    notPublishedYet: 'This book is on the way.',
    versionHeading: 'A living book',
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

    // End-of-chapter turn on the final available chapter of a being-written
    // book (copy deck 05-reader).
    lastAvailable:
      'This is as far as the book goes today. It is being written in the open, and new chapters appear here the moment they are ready.',

    // The end-of-book page, calm and unadorned (copy deck 05-reader).
    finishedTitle: 'You finished the book.',
    finishedBody:
      'If something in you has shifted, you already know. If you want to help the next reader, two minutes in the feedback box on the book’s page is worth more than you think.',
    finishedBackToBook: 'Back to the book',
    finishedShare: 'Share an experience',
  },

  // -- Requests board (copy deck 07-requests) ----------------------------
  requests: {
    title: 'Which trap should we take apart next?', // (copy deck)
    // Header body (copy deck).
    intro:
      'The library grows where it is needed. Ask for the book you wish existed, add your voice to one already asked for, and when enough voices gather, the book gets written. When it is published, it appears right here.',
    // Ranked-list section heading (screen readers + a quiet visible label).
    rankedHeading: 'What readers have asked for',
    addYourVoice: 'Add your voice', // (copy deck)
    voted: 'Your voice is counted',
    // Accessible label template for the one-tap vote button on a row.
    voteAria: 'Add your voice to “{subject}”',
    votedAria: 'You added your voice to “{subject}”',
    voiceCount: '{count} voices',
    voiceCountOne: '1 voice',
    // Row action when the book already exists: link to it instead of a vote.
    readIt: 'Read it',
    // Rank column header (screen readers only).
    rankLabel: 'Rank',
    // Submit flow (copy deck): single textarea.
    submitTitle: 'Ask for a book we have not written',
    submitBody:
      'Name the trap in your own words. If you want, say a little about what it is like from the inside, that helps the book get written truer.',
    submitFieldLabel: 'Name the trap',
    submitPlaceholder: 'I can’t stop...',
    submitCta: 'Ask for it',
    // Client-mocked success state (announced via aria-live).
    submitSuccessBody:
      'Asked. The moment enough voices join yours, the book goes into writing, and this board will show it.',
    submitAnother: 'Ask for another',
  },

  // -- Experiences board (copy deck 06-experiences) ----------------------
  experiences: {
    title: 'What readers walked out of', // (copy deck)
    // Header body (copy deck).
    intro:
      'Every story here is anonymous and real. Nobody is paid, nobody is named, and nothing is exaggerated, that would be the old world’s way of selling. This is just what people say after a trap lets go of them.',
    // Short framing line used on the homepage experiences strip.
    homeStripBody: 'Anonymous, real, and quietly shared. This is what the other side sounds like.',
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
    // Honest empty state (copy deck).
    emptyFiltered: 'No experiences for this book yet. Yours could be the first.',
    empty: 'No experiences yet. Yours could be the first.',
    clearFilter: 'Show all books',
    monthLabel: '{month}',
    // Which book an experience is about (accessible + visible mono line).
    aboutBook: 'On {book}',
    // Share flow (copy deck): single textarea + book select, no consent step.
    submitTitle: 'Share what changed',
    submitBody:
      'If one of the books helped you walk out of something, telling it here is the most generous thing you can do for the next person still inside. A few honest lines are enough. No name, no account, completely anonymous.',
    submitBookLabel: 'Which book?',
    submitBookPlaceholder: 'Choose a book',
    submitTextLabel: 'What changed',
    submitTextPlaceholder: 'A few honest lines about what shifted.',
    submitCta: 'Share it',
    submitSuccessBody:
      'Thank you. Someone in the middle of their worst evening will read this one day and keep going.',
    submitAnother: 'Share another',
    // Validation.
    bookRequired: 'Please choose which book this is about.',
    // Painting alt text (painted-together-after-rain, imagery manifest); used by
    // both the board header and the homepage experiences strip.
    imageAlt: 'People walking together in fresh light after rain',
  },

  // -- Notes / blog (copy deck 08-blog) ----------------------------------
  blog: {
    title: 'Notes from the library',
    intro:
      'What we are building, what changed, and what we are learning from readers. Written plainly, dated honestly.',
    readMore: 'Read the note',
    // Accessible label template for a post card link.
    readAria: 'Read: {title}',
    // Post-page back link and a small meta label.
    backToNotes: 'All notes',
    postedLabel: 'Posted {month}',
    // The contribute card at the foot of a post (copy deck).
    contributeLead: 'Want to help build this? We are looking for a few dedicated people.',
    contributeLink: 'Contribute',
    // Painting alt text (painted-kite, imagery manifest) on the blog index.
    imageAlt: 'A kite high in a clear sky on a bright, open day',
  },

  // -- Contribute (copy deck 10-contribute) ------------------------------
  contribute: {
    title: 'Help build the way out',
    body1:
      'The goal of this project is embarrassingly simple: help as many people as possible escape the traps that are quietly eating their lives. The library is free, the books are improved by their readers, and almost everything is run by AI agents so it can scale to every trap and every language.',
    body2:
      'But a project like this still turns on a few dedicated humans. Not many. A few people who read something here and felt it, and who want to spend real hours making the way out better.',
    rolesHeading: 'What that looks like right now:',
    role1:
      'Maintainers and developers, to build and harden the site and the pipeline that writes, translates, and publishes the books.',
    role2:
      'Native readers, to review translations so a book in Danish or Arabic reads like it was written there, not shipped there.',
    role3:
      'Quiet moderators, to read what people send in with care, and pass the truest of it to the editors.',
    body3:
      'There is no pay yet, and we will not pretend otherwise. There is meaningful work, done in the open, that outlives every feed you have ever scrolled.',
    body4:
      'If that is you, write to us or open the repository and introduce yourself. Dedication matters more than credentials here.',
    repoCta: 'Open the repository',
    mailtoLink: 'Write to us',
    imageAlt: 'Two people on a park bench in morning light, one listening properly',
  },

  // -- How it works (the full essay, copy deck 02-how-it-works) ----------
  howItWorks: {
    // Opening.
    title: 'How belief change works',
    lede:
      'Everything on this site rests on one idea. It is simple, it is testable against your own experience, and once you see it, the books explain themselves.',

    // Chapter 1 (copy deck).
    ch1Heading: 'The happiest option',
    ch1Body1:
      'In every moment, you choose what you believe is your happiest available option. Everyone does. It is not a flaw; it is how choosing works. Reaching for the cigarette, the feed, the drink, the screen is not weakness. It is a choice that, according to your current beliefs, is the best one available right now.',
    ch1Body2:
      'That sentence carries the whole method: choices follow beliefs. Not willpower, not character. Beliefs about what each option gives you and what it costs you.',
    ch1Body3: 'So a stubborn behavior is not a behavior problem. It is a belief problem.',
    ch1ImageAlt: 'A person looking out over a bright morning landscape, the way ahead clear',

    // Chapter 2 (copy deck).
    ch2Heading: 'Fixing the behavior instead of the reasons',
    ch2Body1:
      'Almost everything people try works on the behavior. Stop, cut down, block, avoid, distract, substitute. Sometimes it holds for a while. It rarely holds for good, and the reason is structural: the behavior was never the root. It is the visible end of a belief.',
    ch2Body2:
      'The belief usually formed without you noticing. Something once brought relief, and a conclusion quietly wrote itself: this helps me relax, this gets me through the evening, this is one of my few pleasures. From then on the accounting runs wrong in a particular way: the discomfort the thing creates gets relieved by the next dose, and the relief gets credited to the thing itself. A smoker’s cigarette mostly relieves the previous cigarette. The feed soothes a restlessness the feed installed.',
    ch2Body3:
      'Wrong numbers in, wrong choice out. As long as the belief miscounts, the behavior keeps being chosen, no matter how sincerely you fight it.',

    // Chapter 3 (copy deck).
    ch3Heading: 'Why willpower loses',
    ch3Body1:
      'Willpower accepts the wrong numbers and fights the desire they produce. That is why it feels like deprivation: some part of you still believes something good is being given up, so every abstinent day costs effort. Effort runs out. A hard day arrives, and the option your beliefs still rate highest wins again.',
    ch3Body2:
      'Afterwards people blame themselves. The books will show you, calmly and concretely, why that verdict was never correct: you were fighting your own belief system, and it has more stamina than anyone’s willpower. The method does not ask you to fight harder. It removes what you were fighting.',
    ch3ImageAlt: 'A single rope knot on a workbench in morning light, half loosened, one end running free toward the window',

    // Chapter 4 (copy deck).
    ch4Heading: 'Shaming never helps',
    ch4Body1: 'Shame feels like it should motivate change. Reliably, it does the opposite.',
    ch4Body2:
      'Shame drives the behavior out of sight, and out of sight it grows: unexamined, undiscussed, compounding. Shame also hurts, and a person in pain reaches for what promises relief, which is the behavior itself. The loop tightens.',
    ch4Body3:
      'This is why the books contain no scare tactics, no disappointed tone, no day counters waiting to reset. Not as a kindness strategy: because shame is counterproductive, and the method deals in what works.',

    // Chapter 5 (copy deck).
    ch5Heading: 'What actually changes a belief',
    ch5Body1: 'Not affirmations. Not motivation. Not deciding very hard.',
    ch5Body2:
      'A belief changes when you understand, completely and concretely, where the pull comes from and what the thing actually delivers, clearly enough that the old conclusion stops making sense. Freedom comes from understanding where the behavior comes from, not from the conscious attempt to end it.',
    ch5Body3:
      'Everyone caught in a behavior already knows the costs. Head-knowledge is not the missing piece. The books work by walking through your own experience, moment by moment, until the knowing settles from your head into your heart, until the accounting corrects itself and you can feel it.',
    ch5Body4:
      'This asks one thing of you: humility. You will re-examine ideas you have carried for years. Nothing else is required, no steps, no program, no tricks. Reading and honesty do all the work.',

    // Chapter 6 (copy deck).
    ch6Heading: 'No pressure, starting now',
    ch6Body1:
      'The strangest instruction in the books, and the one readers say made them relax: do not stop anything yet. Carry on as you are while you read. No quit date, no preparation, no working up courage.',
    ch6Body2:
      'Pressure belongs to the willpower approach, and the willpower approach loses. If the book does its work, stopping will not feel like a cliff edge. It will feel like putting down something you no longer want to hold.',
    ch6ImageAlt: 'A birdcage in warm light, its door open and empty, the bird already perched on a sunlit windowsill nearby',

    // Chapter 7 (copy deck).
    ch7Heading: 'When it lets go',
    ch7Body1:
      'Somewhere in the reading, often quietly, the belief gives way. People describe it the same way across every behavior: not a surge of strength, a shrug. It was never doing anything for me.',
    ch7Body2:
      'After that there is nothing to give up, so nothing feels given up. The craving loses its engine. What remains is your life with one wrong belief fewer in it, and the room the behavior was occupying: time, money, attention, self-respect.',
    ch7Body3: 'That is the whole method. How it actually works, described well enough to feel.',

    // Chapter 8 (copy deck).
    ch8Heading: 'Why books, and why free',
    ch8Body1:
      'A book is the right instrument for this. It is private, patient, and unembarrassed; it can say everything, in your own time, with nobody watching. And it can be given away without limit, which matters, because the people who most need one are often least able to pay for it.',
    ch8Body2:
      'So the library is free, forever, in every language we can reach, with no account and no tracking. The books are living documents: readers write in where a chapter did not land, and the next version says it better. The goal is only to help as many people as possible.',
    ch8ImageAlt: 'A rower gliding along an open riverside in fresh air',

    // Closing (copy deck).
    closingHeading: 'The books are on the shelf.',
    ctaLibrary: 'Browse the books',
    ctaRequests: 'Ask for one we have not written',
  },

  // -- About (copy deck 09-about) ----------------------------------------
  about: {
    title: 'About Belief Changer',
    // Header body (copy deck). The bold clause is rendered as a lead line.
    headerBody:
      'A free library of books that help people escape traps: smoking, scrolling, sugar, drink, and every other behavior that runs on a lie. Built on one conviction:',
    headerConviction:
      'people do not need more willpower, they need the truth told well enough to feel.',
    // The story (copy deck).
    missionHeading: 'The story',
    missionBody1:
      'Proven belief-change methods have existed for decades, and where a book exists, it works. But the books cover a handful of traps, and people are caught in hundreds. That gap is the reason this library exists: to bring the same honest, shame-free way out to every trap people ask us about, in every language, at the price of nothing.',
    missionBody2:
      'The library is run by a tiny team and their AI agents, which is what makes "free forever, in every language" possible rather than a slogan. Humans set the direction and hold the quality bar; agents do the endless work: writing, translating, narrating, revising. Every book is signed by the method, not by an author’s ego.',
    // The laws (copy deck).
    lawsHeading: 'What we stand for',
    lawFreeTitle: 'Free forever.',
    lawFreeBody: 'No paywall between a person and the way out.',
    lawNoSignupTitle: 'No signup, no tracking.',
    lawNoSignupBody:
      'We count events, never people. No cookie banner, because there is nothing to consent to.',
    lawEveryLanguageTitle: 'Every language.',
    lawEveryLanguageBody: 'A trap does not check your passport.',
    lawWarmTitle: 'Warm to the person, harsh to the trap.',
    lawWarmBody: 'Always, in every sentence.',
    lawLivingTitle: 'Living books.',
    lawLivingBody:
      'Versions are public, readers improve them, and only the newest version is ever offered.',
    // The honesty note (copy deck, bordered block).
    honestyHeading: 'How we count, honestly',
    honestyBody:
      'We count page views and searches in aggregate, so we can see which books are needed and where a chapter loses people. We never identify you. There are no accounts, no cookies, no third parties.',
    // Foot (copy deck).
    footLead: 'Built in the open. The code and the books are public.',
    openSourceLink: 'Open source',
    contributeLink: 'Contribute',
    privacyLink: 'Privacy',
    // Photo alt text (photo-open-window, imagery manifest, Quiet Fact voice).
    imageAlt: 'An open window in a quiet room, morning light coming in',
  },

  // -- 404 ---------------------------------------------------------------
  notFound: {
    // Dry, warm paragraph under the flickering "404". Turns the no-tracking
    // promise into the reason we genuinely cannot know how the visitor arrived.
    para: 'Well, this is awkward. Because we refuse to track our visitors or use cookies, we have absolutely no idea how you ended up here. But we can confirm this page doesn’t exist.',
    // The single primary action back to the locale home page.
    homeCta: 'Take me home',
    // Painting alt text (painted-misprinted-park, imagery manifest).
    imageAlt: 'A sunlit park path opening ahead on a bright, open day',
  },

  // -- Privacy -----------------------------------------------------------
  // Typography-led privacy document. Plain, warm, sentence case, no exclamation
  // marks, zero em-dashes. States the measurement contract in human language:
  // no tracking, no cookies, no accounts, aggregate event counts only.
  privacy: {
    title: 'Privacy, simplified.',
    lede: 'No tracking, no cookies, no accounts, no nonsense. Here is exactly what happens to your data, in plain human language. The short version: we designed this site so there is almost none.',

    linkedTitle: 'Data linked to you',
    linkedBody: 'None. There are no accounts, no sign-ups, no newsletters, and no contact forms asking for your name. You can read every book, download every format, and use the whole site without telling us who you are.',

    typeTitle: 'What you type',
    typeBody: 'The finder box works in your browser. When you send us feedback, request a book, or share an experience, the words you write are all we receive: no name, no email, no address, nothing attached. Please do not put personal details in the text itself; if we spot any during review, we remove them before anything is published.',

    countTitle: 'What we count',
    countBody: 'We count events, not people: how many times a page was opened, a book was downloaded, a search found nothing. These counts contain no identity, and we deliberately do not count unique visitors, because doing that honestly is impossible without tracking you. That is also why this site has no cookie banner: there is nothing to consent to.',

    deviceTitle: 'What stays on your device',
    deviceBody: 'Your theme, your language, your place in each book, your reading comfort settings, and a note that you already voted. These live in your browser so the site remembers your preferences; they are never sent to us.',

    thirdPartiesTitle: 'Zero third parties',
    thirdPartiesBody: 'No advertisers, no tracking pixels, no analytics companies, no data sales. The fonts are served from our own site, not from a third party.',

    controlTitle: 'Your words, your control',
    controlBody: 'Because contributions are anonymous by design, we cannot look up your data, and neither can anyone else: there is nothing connecting it to you. If you regret something you submitted, write to us describing it and we will remove it.',

    // The formalities block (hairline-bordered). The entity line is owner-to-
    // confirm before launch; the split lets the datatilsynet.dk link render.
    formalitiesTitle: 'The formalities',
    formalitiesControllerLabel: 'Data controller:',
    formalitiesControllerValue: 'Belief Changer (entity details to be confirmed before launch).',
    formalitiesComplaintBefore: 'If you are ever unhappy with how we handle data, you can complain to the Danish Data Protection Agency (Datatilsynet) at',
    // Trailing period after the link, kept out of the anchor text.
    formalitiesComplaintAfter: '.',
    formalitiesLinkLabel: 'www.datatilsynet.dk',
  },

  // -- Language switcher -------------------------------------------------
  langSwitcher: {
    label: 'Change language',
    heading: 'Language',
  },
} as const

