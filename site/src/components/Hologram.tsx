import { useRef, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '~/lib/utils'

/**
 * Hologram: the transient interaction light on covers in browsable lists
 * (library grid, homepage library row, related books). Hovering lifts the book
 * slightly toward the pointer with a gentle pointer-tracked tilt. FeralUI ships
 * a `hologram` package name but it is an empty stub on npm, so this is the
 * equivalent per 00-global.md:
 *
 *   - 3D tilt toward the cursor (small, calm), 5px lift, 150ms in / 250ms out.
 *   - Touch (coarse pointer): a subtle press lift, no tilt.
 *   - Reduced motion: a plain 2px lift, no tilt.
 *
 * Pointer position is written straight to CSS custom properties on the element
 * (no React state per frame, per taste-skill §3.B), so it stays cheap and never
 * re-renders the tree. The whole effect lives on `transform` only.
 */
export function Hologram({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    // Normalized -0.5..0.5 from the element center.
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    // Calm tilt: a maximum of ~5deg either way. Y drives X-rotation.
    el.style.setProperty('--holo-ry', `${(px * 9).toFixed(2)}deg`)
    el.style.setProperty('--holo-rx', `${(-py * 9).toFixed(2)}deg`)
  }

  function onPointerEnter() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--holo-lift', reduce ? '-2px' : '-5px')
  }

  function onPointerLeave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--holo-lift', '0px')
    el.style.setProperty('--holo-rx', '0deg')
    el.style.setProperty('--holo-ry', '0deg')
  }

  function onPointerDown() {
    // Touch feedback: a subtle press lift (reduced-motion still gets it).
    const el = ref.current
    if (!el) return
    el.style.setProperty('--holo-lift', '-3px')
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerLeave}
      className={cn('holo', className)}
    >
      {children}
    </div>
  )
}
