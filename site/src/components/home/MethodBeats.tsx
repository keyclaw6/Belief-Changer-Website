import type { Messages } from '~/i18n'
import { Reveal } from '~/components/Reveal'

/**
 * MethodBeats: "How escape works" (SITE-PLAN homepage flow §4), three beats
 * with the Voice-1 paintings from the imagery manifest:
 *   beat 1 -> painted-morning-overlook.jpg  (see the trap clearly)
 *   beat 2 -> painted-harbor-flock.jpg      (the belief loses its grip)
 *   beat 3 -> painted-riverside-glide.jpg   (walking out feels like relief)
 *
 * Layout discipline (taste-skill zigzag cap): beats 1 and 2 are image+text
 * splits in opposite directions (two consecutive splits, at the cap). Beat 3
 * breaks the pattern into a full-width stacked treatment (wide image above the
 * text) so the section never runs three image+text splits in a row.
 *
 * No eyebrow: the plain heading names the section, which keeps the homepage's
 * eyebrow count at zero (taste-skill: drop the eyebrow, the headline is
 * enough). Paintings are never cropped, tinted, or re-lit; a faint
 * hairline-on-image ring only defines the edge where the art meets the canvas.
 */

const overlook = {
  src: '/site/painted-morning-overlook.jpg',
  alt: 'A person looking out over a bright morning landscape',
}
const harborFlock = {
  src: '/site/painted-harbor-flock.jpg',
  alt: 'Birds lifting from a calm harbor at first light',
}
const riversideGlide = {
  src: '/site/painted-riverside-glide.jpg',
  alt: 'A rower gliding along an open riverside in fresh air',
}

function Painting({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="h-full w-full rounded-lg object-cover ring-1 ring-[var(--color-hairline-on-image)]"
    />
  )
}

function BeatText({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="max-w-[42ch]">
      <h3
        className="text-ink"
        style={{
          fontSize: 'var(--text-headline-md)',
          fontWeight: 'var(--text-headline-md--font-weight)',
          lineHeight: 'var(--text-headline-md--line-height)',
        }}
      >
        {title}
      </h3>
      <p
        className="mt-3 text-ink-secondary"
        style={{
          fontSize: 'var(--text-body-lg)',
          lineHeight: 'var(--text-body-lg--line-height)',
        }}
      >
        {body}
      </p>
    </div>
  )
}

export function MethodBeats({ t }: { t: Messages }) {
  const m = t.home.method
  return (
    <section className="bg-canvas">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-[5vw] py-[var(--spacing-section-y)]">
        <Reveal>
          <h2
            className="max-w-[20ch] text-ink"
            style={{
              fontSize: 'var(--text-headline-lg)',
              fontWeight: 'var(--text-headline-lg--font-weight)',
              lineHeight: 'var(--text-headline-lg--line-height)',
              letterSpacing: 'var(--text-headline-lg--letter-spacing)',
            }}
          >
            {t.home.methodHeading}
          </h2>
          <p
            className="mt-3 max-w-[52ch] text-ink-secondary"
            style={{
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--text-body-lg--line-height)',
            }}
          >
            {t.home.methodBody}
          </p>
        </Reveal>

        <div className="mt-14 flex flex-col gap-14 md:gap-20">
          {/* Beat 1: image leading (inline-start), text following. */}
          <Reveal as="div" className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="h-64 sm:h-72 md:h-80">
              <Painting {...overlook} />
            </div>
            <BeatText title={m.beat1Title} body={m.beat1Body} />
          </Reveal>

          {/* Beat 2: text leading, image following (mirror of beat 1). */}
          <Reveal as="div" className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <BeatText title={m.beat2Title} body={m.beat2Body} />
            <div className="order-first h-64 sm:h-72 md:order-last md:h-80">
              <Painting {...harborFlock} />
            </div>
          </Reveal>

          {/* Beat 3: full-width stack (breaks the split pattern) as the
              "walking out" climax: a wide image, the text settling beneath it. */}
          <Reveal as="div">
            <div className="h-64 w-full sm:h-80 md:h-[420px]">
              <Painting {...riversideGlide} />
            </div>
            <div className="mt-8">
              <BeatText title={m.beat3Title} body={m.beat3Body} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
