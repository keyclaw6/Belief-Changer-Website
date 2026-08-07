import { Link } from '@tanstack/react-router'
import type { Locale } from '~/i18n/config'
import type { Messages } from '~/i18n'
import { localePath } from '~/i18n/routing'
import { Painting } from '~/components/Painting'
import { Reveal } from '~/components/Reveal'
import { btnSecondary } from '~/lib/ui'

/**
 * HomeBeats: the story in five beats (copy deck 01-home). Large still images,
 * text short and direct, canvas and warm band alternating. No side entries;
 * things are simply there, at scale (a Reveal may fade them up once).
 *
 * Rhythm: the images alternate sides (the owner-approved zigzag for the story),
 * but the pattern is broken so it never runs as identical rows: beats 1, 2, 4
 * are image+text splits alternating sides; beat 3 (the happiest-option pivot)
 * is a full-width breakout with the image above the text; beat 5 (the short
 * payoff) is a centered climax with the single button. Images run ~55-60vw of
 * the page inside the split, wider on the breakout.
 *
 * Paintings never crop their subjects (Painting renders them at true 3:2).
 */

const IMAGES = {
  beat1: '/site/painted-lit-window.jpg',
  beat2: '/site/painted-bench.jpg',
  beat3: '/site/painted-morning-overlook.jpg',
  beat4: '/site/painted-open-cage.jpg',
  beat5: '/site/painted-riverside-glide.jpg',
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="max-w-[18ch] text-ink"
      style={{
        fontSize: 'var(--text-headline-lg)',
        fontWeight: 'var(--text-headline-lg--font-weight)',
        lineHeight: 'var(--text-headline-lg--line-height)',
        letterSpacing: 'var(--text-headline-lg--letter-spacing)',
      }}
    >
      {children}
    </h2>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-4 max-w-[46ch] text-ink-secondary"
      style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
    >
      {children}
    </p>
  )
}

/** A split beat: image one side, text the other. `imageStart` puts the image
 *  on the inline-start; large image (~55-60vw within the page). */
function SplitBeat({
  image,
  alt,
  title,
  body,
  imageStart,
}: {
  image: string
  alt: string
  title: string
  body: string
  imageStart: boolean
}) {
  return (
    <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
      {/* The image runs large (a ~60vw column); the text is a calm narrow column
          beside it, vertically centered, so a short beat reads as still-and-large
          rather than an empty half. */}
      <div className="grid items-center gap-10 md:grid-cols-[1.35fr_0.75fr] md:gap-16">
        <Reveal className={imageStart ? 'md:order-1' : 'md:order-2'}>
          <Painting src={image} alt={alt} sizes="(max-width: 768px) 90vw, 60vw" />
        </Reveal>
        <Reveal className={imageStart ? 'md:order-2' : 'md:order-1'}>
          <div>
            <Title>{title}</Title>
            <Body>{body}</Body>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

export function HomeBeats({ locale, t }: { locale: Locale; t: Messages }) {
  const h = t.home
  return (
    <>
      {/* Beat 1 (band): image inline-start. */}
      <section className="bg-band">
        <SplitBeat
          image={IMAGES.beat1}
          alt={h.beat1ImageAlt}
          title={h.beat1Title}
          body={h.beat1Body}
          imageStart
        />
      </section>

      {/* Beat 2 (canvas): image inline-end (mirror of beat 1). */}
      <section className="bg-canvas">
        <SplitBeat
          image={IMAGES.beat2}
          alt={h.beat2ImageAlt}
          title={h.beat2Title}
          body={h.beat2Body}
          imageStart={false}
        />
      </section>

      {/* Beat 3 (band): a full-width breakout, image above the text. Breaks the
          split run so no three consecutive splits appear. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal>
            <Painting
              src={IMAGES.beat3}
              alt={h.beat3ImageAlt}
              sizes="(max-width: 1400px) 90vw, 1260px"
              className="mx-auto max-w-[72rem]"
            />
          </Reveal>
          <Reveal className="mx-auto mt-10 max-w-[46rem]">
            <div>
              <Title>{h.beat3Title}</Title>
              <Body>{h.beat3Body}</Body>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Beat 4 (canvas): image inline-start. */}
      <section className="bg-canvas">
        <SplitBeat
          image={IMAGES.beat4}
          alt={h.beat4ImageAlt}
          title={h.beat4Title}
          body={h.beat4Body}
          imageStart
        />
      </section>

      {/* Beat 5 (band): the short payoff, centered, with the single button. */}
      <section className="bg-band">
        <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
          <Reveal>
            <Painting
              src={IMAGES.beat5}
              alt={h.beat5ImageAlt}
              sizes="(max-width: 1400px) 90vw, 1120px"
              className="mx-auto max-w-[64rem]"
            />
          </Reveal>
          <Reveal className="mx-auto mt-10 max-w-[42rem] text-center">
            <div>
              <h2
                className="mx-auto max-w-[16ch] text-ink"
                style={{
                  fontSize: 'var(--text-headline-lg)',
                  fontWeight: 'var(--text-headline-lg--font-weight)',
                  lineHeight: 'var(--text-headline-lg--line-height)',
                  letterSpacing: 'var(--text-headline-lg--letter-spacing)',
                }}
              >
                {h.beat5Title}
              </h2>
              <p
                className="mx-auto mt-4 max-w-[40ch] text-ink-secondary"
                style={{ fontSize: 'var(--text-body-lg)', lineHeight: 'var(--text-body-lg--line-height)' }}
              >
                {h.beat5Body}
              </p>
              <div className="mt-8 flex justify-center">
                <Link to={localePath(locale, '/how-it-works')} className={btnSecondary}>
                  {h.beat5Cta}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
