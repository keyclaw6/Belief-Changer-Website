/* pages.js — real page content for the orbit reader.
 *
 * Eleven atlas cells per book; cells 0..9 are visible (leaf fronts/backs),
 * cell 10 stays blank paper. Voice follows VISION.md and sample-chapters.ts:
 * second person, plain and kind, the belief taken apart calmly. Sentence case,
 * no exclamation marks, hyphens not em-dashes, no invented statistics.
 *
 * Sugar and scrolling carry the site's real sample chapters. The other eight
 * carry chapters written for the orbit in the same register from each book's
 * promise in books-meta.json.
 */
window.ORBIT_PAGES = (() => {
  const P = (title, paragraphs) => ({ title, paragraphs });

  function standard(meta) {
    const t = meta.title;
    const trap = t.replace(/^The /, '').replace(/ Trap$/, '').toLowerCase();
    return [
      P(t, [meta.promise, 'Belief Changer · free to read.']),
      P('Copyright', [
        `${t}`,
        'Belief Changer. Free forever.',
        'This book is versioned and improved in public. Every revision is listed in the book\u2019s changelog, and reader experience feeds the next one.',
      ]),
      P('Contents', [
        '1. The mechanism',
        '2. What it costs',
        '3. The belief underneath',
        '4. Walking out',
        '5. A note on willpower',
        '6. If you slip',
      ]),
      P('1. The mechanism', [
        `Every trap in this series runs the same two-step. First it manufactures a small discomfort. Then it sells you the relief. The ${trap} trap is not special because the relief is fake. The relief is real, and that is exactly why the mechanism works.`,
        `Watch the order of events next time. The discomfort arrives first: a flatness, a restlessness, an itch for something more. The ${trap} arrives second and the discomfort lifts. The mind credits the cure. Almost nobody notices the first step, the one where the discomfort was made.`,
      ]),
      P('2. What it costs', [
        `Put the trade on paper and it stops being subtle. On one side: a short lift, minutes at most. On the other: the money, the hours, the attention, the quiet self-respect that leaks away a little each time the loop closes. Nobody would sign that trade deliberately. It is only ever signed one moment at a time.`,
        `The cost that stays hidden longest is the flattening. What the ${trap} gives, it also takes as the baseline for everything else. Ordinary good things begin to feel thin, not because they got worse but because your gauge was reset.`,
      ]),
      P('3. The belief underneath', [
        `Behavior is not held in place by force. It is held in place by a belief, and this one is quiet: that the ${trap} is where the good feeling comes from. As long as that stands, quitting feels like giving something up, and no one walks away from a real gain.`,
        `Look closely at the ledger and the belief loosens. The ${trap} never added anything. It removed a lack it had installed, and billed you for the removal. See that once, clearly, and the belief does not need fighting. It simply stops being believable.`,
      ]),
      P('4. Walking out', [
        `The way out is not a wall you climb. It is a door you see. When the mechanism is visible in the moment it runs, the spell breaks on its own: the discomfort is recognized as installed, the promised relief as a refund, and the whole transaction loses its shine.`,
        'So the instruction is small. You do not have to resist, and you do not have to obey. When the pull comes, look at it. Ask what it wants you to believe. That looking is the entire method, and it works because seeing clearly was never the same as forcing.',
      ]),
      P('5. A note on willpower', [
        'Willpower is the story the trap likes best, because it loses gracefully. Every failure of will confirms the story that you are weak and the trap is strong, and the shame of losing sends you back for comfort. The trap runs on that shame and calls it your fault.',
        'Put the story down. You were never weak. You were persuaded, repeatedly, by a small lie told at the right moment. Correction, not combat, is what remains once the lie is seen through.',
      ]),
      P('6. If you slip', [
        'There will be a day the old loop catches you off guard. If you believe you are weak, the slip is evidence, and evidence gets heavy. If you understand the mechanism, the slip is information: the discomfort was installed, the refund was taken, nothing more happened.',
        'Notice it, name it, set it down. A hundred small corrections from a person no longer at war with themselves will carry you further than any heroic vow, and none of them require you to be perfect. The trap needed your shame to live. It cannot survive your clarity.',
      ]),
      P('Colophon', [
        `${t} is part of the Belief Changer library: free books that take a single trap apart, piece by piece, until the belief underneath it is visible and the behavior changes on its own.`,
        'Set at the reader\u2019s pace, in your language, forever free at beliefchanger.',
      ]),
    ];
  }

  function sugar() {
    return [
      P('The Sugar Trap', [
        'The craving is withdrawal wearing the mask of hunger. See it once and it loosens.',
        'Belief Changer · free to read.',
      ]),
      P('Copyright', [
        'The Sugar Trap',
        'Belief Changer. Free forever.',
        'Versioned in public, improved by readers. The changelog lists every revision.',
      ]),
      P('Contents', [
        '1. The stones in your shoes',
        '2. Better than what',
        '3. What the fall really is',
        '4. Walking past the kitchen',
      ]),
      P('1. The stones in your shoes', [
        'Start with the moment itself. It is late afternoon, your attention thins, and something in you turns toward the kitchen. You are not deciding anything. Your feet are already moving. By the time you notice, the wrapper is open and a small voice says: there, that is better.',
        'Picture someone who puts a small stone in each shoe every morning, then sells themselves the beautiful relief of taking the stones out each afternoon. The relief is genuine. They really do feel better. But they are not ahead. They are back where a person without stones stays all day, for free.',
      ]),
      P('2. Better than what', [
        'For a few seconds, sugar did make you feel better. The question this book asks, patiently and completely, is: better than what.',
        'The sugar did not lift you above your normal baseline. It returned you, briefly, to the baseline it had pulled you below in the first place. The gift was never a gift. It was a refund, and the original shortage was the product.',
      ]),
      P('3. What the fall really is', [
        'An hour or two after the last sweet thing, blood sugar climbs and then falls, and the fall is what you feel as the thinning of attention, the flat restless mood, the vague sense that something is wrong and food would fix it. That feeling was not hunger. It was withdrawal from the last hit, wearing the costume of a craving for the next one.',
        'This is the move the trap makes over and over. It creates a small discomfort, then offers itself as the cure. You are not imagining the better feeling. You are crediting it to the wrong thing.',
      ]),
      P('4. Walking past the kitchen', [
        'You have been told the problem is willpower. Notice how neatly that story serves the trap. It keeps your attention on your supposed weakness and away from the mechanism doing the work. Guilt is a fuel the trap runs on beautifully.',
        'So watch, without resisting and without obeying. Next time your feet turn toward the kitchen, ask where the feeling came from and when it started, and whether it is truly hunger or the familiar hollow that follows the last sweet thing. Seeing accurately is the change. Everything else grows from it.',
      ]),
      P('The flat afternoon', [
        'Somewhere in the first weeks the afternoons stop dipping. The swings flatten not because you became calmer but because the pendulum is gone: no more climbs that must fall, no more falls begging for a lift. Meals taste like meals. Quiet starts to feel like quiet instead of a symptom.',
        'This is the part nobody believes in advance: the reward for leaving is not a substitute treat. It is the return of enough. Food stops being a lever and goes back to being food, and you get the hours and the ease back that the loop was quietly spending.',
      ]),
      P('Colophon', [
        'The Sugar Trap is part of the Belief Changer library: free books that take a single trap apart until the belief underneath it is visible.',
        'Free forever, in your language, at beliefchanger.',
      ]),
    ];
  }

  function scrolling() {
    return [
      P('The Scrolling Trap', [
        'For when the feed owns your evenings and your attention feels rented.',
        'Belief Changer · free to read.',
      ]),
      P('Copyright', [
        'The Scrolling Trap',
        'Belief Changer. Free forever.',
        'Versioned in public, improved by readers. The changelog lists every revision.',
      ]),
      P('Contents', [
        '1. The reach',
        '2. The maybe',
        '3. It was never you',
        '4. The room gets quiet',
      ]),
      P('1. The reach', [
        'Your hand moved on its own, into the small bright world that is always one tap away. That reach is where we begin, because it is where the trap lives: not in the phone, in the reaching. You were not looking for information. You were looking for the next thing, and the defining feature of the next thing is that it never arrives.',
        'When you look up from twenty minutes of scrolling you feel slightly worse than before, and you could not name one thing you saw. That is not a side effect. That is the trap working exactly as intended. The belief holding it together is quiet: the good thing is in the next screen. Not this one. The next one.',
      ]),
      P('2. The maybe', [
        'Each swipe carries a tiny chance of something good. Most swipes deliver nothing; a few deliver a small hit. Your attention learns that the reward is unpredictable, and unpredictable rewards are the most compelling kind there is. It is the same mechanism that keeps a person at a slot machine. Not the winning. The maybe.',
        'This is why you can feel bored and unable to stop at the same time. Boredom says this is not worth my time. The maybe says the next one might be. The maybe only needs to be possible, and the scroll makes sure it always just barely is.',
      ]),
      P('3. It was never you', [
        'The belief that hurts the most to look at is the one that says the problem is you: the weak one, the addicted one, the person who cannot put the phone down. It feels like humility. Watch what it actually does: it keeps your attention on your flaw and none of it on the thing you are up against, a system built and tested to capture exactly the attention you have.',
        'Losing to it is not a character flaw. It is the expected result of an unfair match no one told you was rigged. The shame you have been carrying was never yours. It belongs to the design, and you can set it down.',
      ]),
      P('4. The room gets quiet', [
        'When the belief changes, the phone goes back to being a tool. You check it when you have a reason and set it down when the reason is gone, and the setting down costs nothing, because the story that there was gold in the next screen has lost its grip. There was never gold in the next screen.',
        'What comes back is the empty mind, the wandering attention, the slow satisfying pace of a life at its real speed. One day you notice you have not reached for the phone in an hour, and you did not have to try. That was always the way out. It was never willpower you were missing. It was this.',
      ]),
      P('What the spaces were for', [
        'The scroll moved into every empty moment: the queue, the kettle, the minute before sleep. Those moments used to be where your mind wandered and stitched things together, where ideas arrived and feelings got quietly processed. You did not just lose time. You lost the spaces between things, and you needed those spaces more than you knew.',
        'They come back on their own once the maybe stops calling. The first evenings feel strangely long, then strangely rich. A queue becomes a minute of thinking. A walk becomes a walk. Nothing fills the spaces, and that turns out to be the point of them.',
      ]),
      P('Colophon', [
        'The Scrolling Trap is part of the Belief Changer library: free books that take a single trap apart until the belief underneath it is visible.',
        'Free forever, in your language, at beliefchanger.',
      ]),
    ];
  }

  const built = { sugar: sugar(), scrolling: scrolling() };

  function pad(page) {
    const blank = { title: '', paragraphs: [] };
    return [...page, blank];
  }

  return { standard, built, pad };
})();
