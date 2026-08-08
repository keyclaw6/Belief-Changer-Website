import type { BlogPost } from './types'

/**
 * Blog fixture for v1.
 *
 * SITE-PLAN §Fixtures: 3 posts (the launch note; how books improve; why it is
 * free forever). The METADATA (slug, title, excerpt, date, index image) and the
 * POST BODIES below are written by the builder in register: warm, plain, DM Sans
 * body, sentence case headings, zero em-dashes, no AI clichés. Dates are MOCK.
 *
 * SAMPLE CONTENT: the `body` paragraphs on each post are builder-written sample
 * prose for v1 (300-500 words each), not editorial copy signed off by the
 * project. They demonstrate the register and the reading layout; they are
 * flagged here in code only and never labeled "sample" in the UI.
 *
 * The blog index uses painted-living-pages.png. Per-post image fields are
 * reserved for article imagery when that surface adopts it.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: 'why-it-is-free-forever',
    title: 'Why it is free forever',
    excerpt:
      'A person in a trap should not have to reach past a paywall to find the way out. Here is how that stays true.',
    date: 'July 2026', // MOCK
    image: '/site/painted-open-garden-gate.png',
    // SAMPLE BODY (builder-written, ~410 words) --------------------------------
    body: [
      'The people who need these books most are often the people with the least to spare. Someone lying awake at two in the morning, ashamed of a habit they cannot explain to anyone, is not in a position to compare subscription tiers. They need the way out, and they need it now, and they need it without a form standing between them and the first page.',
      'So the books are free. Not free for a trial period, not free until we build an audience, not free with the real version locked behind a wall. Free to read online, free to download, free to keep. In every language we can reach. That is the whole offer, and there is no smaller print underneath it.',
      'This raises a fair question. If nobody pays, how does any of it last. The honest answer is that a library like this costs far less to run than most people expect. There is no marketing budget, because we are not trying to grow for its own sake. There is no sales team, because there is nothing to sell. There are no investors waiting for the day the free thing quietly stops being free, because we took no money that comes with that expectation.',
      'What it costs is the writing, the translation, and the machines that serve the pages. Those are real costs, and they are small enough to carry without turning you into the product. We do not run ads. We do not track you. We do not sell what you searched for or what you read. If we ever cannot cover the costs, we will ask for help plainly and openly, and the books will stay free while we do.',
      'There is a deeper reason too. The moment you charge for the way out of a trap, you have a quiet incentive for traps to keep existing. You start to benefit, in a small way, from the very thing you claim to be ending. We would rather never be in that position. A book that frees someone should not need them to stay a little bit stuck in order to pay for it.',
      'Free forever is not a marketing promise here. It is a design decision that shapes everything else, from the refusal to track you to the refusal to make you sign up. The library exists to empty itself out, one reader at a time, and to ask nothing back except that you pass the way out along to the next person who needs it.',
    ],
  },
  {
    slug: 'how-the-books-improve',
    title: 'How the books get better',
    excerpt:
      'Every reader who tells us where a book lost them makes the next version clearer for the next person.',
    date: 'June 2026', // MOCK
    // SAMPLE BODY (builder-written, ~400 words) --------------------------------
    body: [
      'A book here is never finished. It has versions, the way software has versions, and the newest one is always the one you get. That is not a gimmick. It is the single most important thing about how these books work, and it comes straight from the people who read them.',
      'When a book fails, it usually fails in a specific place. A reader is following along, the argument is landing, and then one paragraph asks them to believe something they are not ready to believe yet. The thread goes slack. They keep reading, but the spell is broken, and by the end the belief the book was trying to change is still quietly standing.',
      'That exact moment is what we want to know about. Not whether you liked the book. Where it lost you. What belief was still there when you closed it. What, if anything, shifted. The improve form on every book page asks those three questions and nothing else, because those are the answers that make the next version clearer.',
      'Editors read every note. Most notes point at problems we already half suspected, and a steady stream of readers naming the same weak paragraph is how a suspicion becomes a decision to rewrite. Some notes point at something we missed entirely, a place where a single sentence was doing quiet harm. Those are the best notes of all, and they are the reason the form exists.',
      'When enough of them gather around one weakness, the book changes. The changelog on each book page records what changed and why, in plain language, with no names attached to anything. You can read the history of a book the way you would read the history of a tool that keeps getting sharper. Version three exists because version two lost people in chapter one, and readers told us so.',
      'None of this asks anything of you that costs your dignity. The form is anonymous. You do not make an account. You are not thanked by name, because there is no name, and that is the point. A contribution here is a quiet gift to a stranger who will read the clearer version and never know it was almost less clear.',
      'A living book is slower to make than a finished one. It is also the only honest kind, because no one gets the belief exactly right the first time. The readers do half the work, and the next reader walks out a little more easily because of it.',
    ],
  },
  {
    slug: 'the-launch-note',
    title: 'The launch note',
    excerpt:
      'A small library, opening its doors. What it is, what it refuses to be, and who it is for.',
    date: 'May 2026', // MOCK
    // SAMPLE BODY (builder-written, ~390 words) --------------------------------
    body: [
      'This is a small library, and today it opens its doors. There are a handful of books ready to read, more being written, and a longer list of traps that readers have asked us to take apart next. It is a beginning, and we would rather begin honestly than launch loudly.',
      'Here is what it is. A free collection of books, each one aimed at a single trap, each one built to change the belief behind a behavior rather than to nag you into fighting it. You do not need willpower to read them, and you will not be asked to count days or track streaks. The idea is simpler than that. See the trap clearly enough, and the pull it had over you starts to fall away on its own.',
      'Here is what it refuses to be. It is not a wellness brand. It will not tell you that you are on a journey or send you a morning affirmation. It is not a product with a free tier and a real version behind a paywall. It is not a place that quietly studies you while pretending to help. There are no accounts, no cookies, no tracking, and no cost, and those are not features we might trade away later. They are the shape of the thing.',
      'Here is who it is for. Anyone carrying a habit they cannot seem to put down, especially the ones that are hard to say out loud. People who have tried to stop before and blamed themselves when it did not hold. People who suspect, correctly, that the problem was never their character. The books are written to meet you with respect, in plain language, in your own tongue where we can manage it.',
      'The library is run by a team of agents working to a founder-held bar for quality, and it will grow the way the books grow, one clear version at a time. Readers shape what gets written through the request board, and they shape the books themselves through the notes they leave. If a trap that has hold of you is not here yet, you can add your voice and help bring it into existence.',
      'That is the whole of it. A quiet room full of ways out, open to anyone, asking nothing back. Thank you for coming in. We hope you find the book you came for, and we hope you do not need to stay long.',
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}
