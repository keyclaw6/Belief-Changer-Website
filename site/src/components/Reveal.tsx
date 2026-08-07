import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Reveal: the site's single scroll-entry motion primitive.
 *
 * DESIGN.md Motion: entries fade-up 12px over ~600ms on a
 * cubic-bezier(0.16, 1, 0.3, 1) curve, with an 80ms stagger for grouped items,
 * driven by an in-view observer (Motion's `whileInView`, never a scroll
 * listener). transform/opacity only. `prefers-reduced-motion` collapses
 * everything to a static, fully-visible state.
 *
 * Progressive enhancement is the load-bearing detail: the server and the first
 * client render output the element FULLY VISIBLE (no hidden initial state), so
 * the content is present with JavaScript disabled and there is never a flash of
 * invisible content. The hidden-then-reveal animation is armed only after mount
 * (and only when motion is allowed), so elements the reader scrolls to later
 * still fade up, while nothing is ever hidden behind a missing observer.
 *
 * Usage:
 *   <Reveal>                       single element
 *   <Reveal index={i}>             stagger by 80ms * i inside a group
 *   <Reveal as="li">               render a different element
 */
export function Reveal({
  children,
  index = 0,
  as = 'div',
  className,
  amount = 0.25,
}: {
  children: ReactNode
  /** Position within a staggered group; delays the entry by 80ms * index. */
  index?: number
  as?: 'div' | 'li' | 'section' | 'article' | 'header'
  className?: string
  /** Fraction of the element that must be visible before it animates in. */
  amount?: number
}) {
  const reduce = useReducedMotion()
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    setArmed(true)
  }, [])

  const MotionTag = motion[as]

  // Reduced motion, or not yet mounted: render a plain, visible element. This
  // is also the server output, so SSR/no-JS content is always present.
  if (reduce || !armed) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  )
}
