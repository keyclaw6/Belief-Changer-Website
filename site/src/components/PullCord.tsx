/*
 * Vendored from pullcord 0.1.0 by FeralUI.
 * Copyright (c) 2026 iisac
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useReducedMotion } from 'motion/react'

interface PullCordConfig {
  gravity: number
  damping: number
  iterations: number
  stretchMax: number
  stretchToggle: number
  maxVelocity: number
  sleepVelocity: number
}

const DEFAULT_CONFIG: PullCordConfig = {
  gravity: 1250,
  damping: 0.94,
  iterations: 20,
  stretchMax: 26,
  stretchToggle: 20,
  maxVelocity: 22,
  sleepVelocity: 0.15,
}

const W = 64
const ANCHOR_X = W / 2
const REST_Y = 176
const SVG_H = 340
const SEGMENTS = 16
const REST_SEG = REST_Y / SEGMENTS
const KNOB_R = 6.5
/* Grab area: a tall strip covering the rope around the bead, not just the
   bead itself — the cord must be grabbable anywhere near the knob (the old
   46px square felt dead whenever the pointer landed on the rope). */
const HIT_W = 52
const HIT_TOP = REST_Y - 38
const HIT_H = 76

interface Node {
  x: number
  y: number
  ox: number
  oy: number
  fixed: boolean
}

function buildPath(points: Node[]) {
  const first = points[0]!
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`
  for (let i = 1; i < points.length - 1; i++) {
    const point = points[i]!
    const next = points[i + 1]!
    const xc = (point.x + next.x) / 2
    const yc = (point.y + next.y) / 2
    d += ` Q ${point.x.toFixed(1)} ${point.y.toFixed(1)} ${xc.toFixed(1)} ${yc.toFixed(1)}`
  }
  const last = points.length - 1
  const end = points[last]!
  return `${d} L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`
}

function makeNodes() {
  return Array.from({ length: SEGMENTS + 1 }, (_, i) => {
    const y = REST_SEG * i
    return { x: ANCHOR_X, y, ox: ANCHOR_X, oy: y, fixed: i === 0 }
  })
}

const INITIAL_PATH = buildPath(makeNodes())

export function PullCord({
  onPull,
  pulled = false,
  ariaLabel = 'Pull the cord',
  noEntrance = false,
}: {
  onPull?: () => void
  pulled?: boolean
  ariaLabel?: string
  noEntrance?: boolean
}) {
  const reduce = useReducedMotion()
  const cordRef = useRef<SVGPathElement>(null)
  const groupRef = useRef<SVGGElement>(null)
  const dragging = useRef(false)
  const didDrag = useRef(false)
  const clicked = useRef(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const press = useRef<{
    id: number
    x: number
    y: number
    endX: number
    endY: number
  } | null>(null)
  const target = useRef({ x: ANCHOR_X, y: REST_Y })
  const wake = useRef(() => {})
  const onPullRef = useRef(onPull)
  onPullRef.current = onPull
  const nodesRef = useRef<Node[] | null>(null)
  if (nodesRef.current === null) nodesRef.current = makeNodes()
  const [drop, setDrop] = useState(!noEntrance)
  const dropDone = useRef(noEntrance)

  useEffect(() => {
    const points = nodesRef.current!
    const last = points.length - 1
    const end = points[last]!
    let raf = 0
    let running = false
    let previousTime = 0
    let previousDelta = 0

    const render = () => {
      cordRef.current?.setAttribute('d', buildPath(points))
      if (buttonRef.current)
        buttonRef.current.style.transform = `translate(${end.x - ANCHOR_X}px,${end.y - REST_Y}px)`
      groupRef.current?.setAttribute(
        'transform',
        `translate(${(end.x - ANCHOR_X).toFixed(2)} ${(end.y - REST_Y).toFixed(2)})`,
      )
    }

    const step = (now: number) => {
      const { gravity, damping, iterations, sleepVelocity } = DEFAULT_CONFIG
      const elapsed = previousTime
        ? Math.min(0.064, Math.max(0.001, (now - previousTime) / 1000))
        : 1 / 60
      previousTime = now
      const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)))
      const dt = elapsed / steps
      for (let substep = 0; substep < steps; substep++) {
        const timeCorrection = previousDelta > 0 ? dt / previousDelta : 1
        const velocity = timeCorrection * Math.pow(damping, dt * 60)
        const acceleration = dt * dt
        end.fixed = dragging.current

        for (let i = 1; i < points.length; i++) {
          const point = points[i]!
          if (point.fixed) continue
          const vx = point.x - point.ox
          const vy = point.y - point.oy
          point.ox = point.x
          point.oy = point.y
          point.x += vx * velocity
          point.y += vy * velocity + gravity * acceleration
        }

        points[0]!.x = ANCHOR_X
        points[0]!.y = 0
        if (dragging.current) {
          end.ox = end.x
          end.oy = end.y
          end.x = target.current.x
          end.y = target.current.y
        }

        for (let pass = 0; pass < iterations; pass++) {
          for (let i = 0; i < last; i++) {
            const a = points[i]!
            const b = points[i + 1]!
            const dx = b.x - a.x
            const dy = b.y - a.y
            const distance = Math.hypot(dx, dy) || 0.0001
            const difference = ((REST_SEG - distance) / distance) * 0.5
            const offsetX = dx * difference
            const offsetY = dy * difference
            if (!a.fixed) {
              a.x -= offsetX
              a.y -= offsetY
            }
            if (!b.fixed) {
              b.x += offsetX
              b.y += offsetY
            }
          }
        }

        previousDelta = dt
      }
      render()
      let speed = 0
      for (let i = 1; i < points.length; i++) {
        const point = points[i]!
        speed += Math.abs(point.x - point.ox) + Math.abs(point.y - point.oy)
      }
      if (!dragging.current && speed < sleepVelocity * elapsed * 60) {
        for (const point of points) {
          point.ox = point.x
          point.oy = point.y
        }
        running = false
        return
      }
      raf = requestAnimationFrame(step)
    }

    wake.current = () => {
      if (running) return
      running = true
      previousTime = 0
      previousDelta = 0
      raf = requestAnimationFrame(step)
    }
    render()
    return () => {
      cancelAnimationFrame(raf)
      wake.current = () => {}
    }
  }, [])

  const toggle = () => onPullRef.current?.()
  const scriptedPull = () => {
    toggle()
    if (reduce) return
    const points = nodesRef.current!
    points[points.length - 1]!.oy -= 22
    wake.current()
  }

  const finishPointer = useCallback((cancelled = false) => {
    const start = press.current
    if (!start) return
    press.current = null
    dragging.current = false
    if (buttonRef.current?.hasPointerCapture(start.id))
      buttonRef.current.releasePointerCapture(start.id)
    const points = nodesRef.current!,
      point = points[points.length - 1]!
    // Zero stale drag acceleration; the rope's own tension provides the return.
    point.ox = point.x
    point.oy = point.y
    buttonRef.current?.removeAttribute('data-dragging')
    if (!cancelled && !didDrag.current && !clicked.current)
      onPullRef.current?.()
    didDrag.current = false
    clicked.current = false
    wake.current()
  }, [])

  useEffect(() => {
    const cancel = () => finishPointer(true)
    const hidden = () => {
      if (document.hidden) cancel()
    }
    window.addEventListener('blur', cancel)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      cancel()
      window.removeEventListener('blur', cancel)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [finishPointer])

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || press.current) return
    event.preventDefault()
    const point = nodesRef.current!.at(-1)!
    press.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      endX: point.x,
      endY: point.y,
    }
    target.current = { x: point.x, y: point.y }
    didDrag.current = false
    clicked.current = false
    dragging.current = !reduce
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.setAttribute('data-dragging', 'true')
    wake.current()
  }
  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = press.current
    if (!start || start.id !== event.pointerId) return
    if (event.pointerType === 'mouse' && event.buttons === 0) {
      finishPointer(true)
      return
    }
    event.preventDefault()
    const dx = event.clientX - start.x,
      dy = event.clientY - start.y
    if (Math.hypot(dx, dy) > 4) didDrag.current = true
    if (reduce) return
    const offsetX = start.endX - ANCHOR_X + dx,
      offsetY = start.endY + dy
    const distance = Math.hypot(offsetX, offsetY) || 1
    const scale = Math.min(1, (REST_Y + DEFAULT_CONFIG.stretchMax) / distance)
    target.current = { x: ANCHOR_X + offsetX * scale, y: offsetY * scale }
    if (!clicked.current && offsetY - REST_Y >= DEFAULT_CONFIG.stretchToggle) {
      clicked.current = true
      toggle()
    }
    wake.current()
  }

  const endDrop = useCallback(() => {
    if (dropDone.current) return
    dropDone.current = true
    setDrop(false)
    if (reduce) return
    const points = nodesRef.current
    if (!points) return
    points[points.length - 1]!.oy -= 13
    points[points.length - 1]!.ox -= 6
    wake.current()
  }, [reduce])

  useEffect(() => {
    if (noEntrance) return
    const fallback = window.setTimeout(endDrop, 1700)
    return () => window.clearTimeout(fallback)
  }, [endDrop, noEntrance])

  const onDropEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.animationName === 'pullcord-drop') endDrop()
  }

  return (
    <div
      className="pullcord"
      style={{
        position: 'fixed',
        top: 'var(--pullcord-top, 0px)',
        right: 'var(--pullcord-right, 7rem)',
        zIndex: 'var(--pullcord-z, 5)',
        width: W,
        height: SVG_H,
        pointerEvents: 'none',
      }}
    >
      <div
        className={
          drop ? 'pullcord-inner pullcord-inner--drop' : 'pullcord-inner'
        }
        onAnimationEnd={onDropEnd}
      >
        <svg
          viewBox={`0 0 ${W} ${SVG_H}`}
          width={W}
          height={SVG_H}
          aria-hidden="true"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="pc-knob" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e7e7ec" />
            </linearGradient>
            <filter
              id="pc-knob-sh"
              x="-70%"
              y="-70%"
              width="240%"
              height="240%"
            >
              <feDropShadow
                dx="0"
                dy="1.4"
                stdDeviation="1.5"
                floodColor="rgba(0,0,0,0.32)"
              />
            </filter>
          </defs>
          <path
            ref={cordRef}
            d={INITIAL_PATH}
            stroke="var(--pullcord-ink, rgba(127, 127, 127, 0.45))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          <g ref={groupRef}>
            <g filter="url(#pc-knob-sh)">
              <circle
                cx={ANCHOR_X}
                cy={REST_Y}
                r={KNOB_R}
                fill="url(#pc-knob)"
                stroke="rgba(0,0,0,0.10)"
                strokeWidth="0.5"
              />
            </g>
          </g>
        </svg>
        <button
          type="button"
          className="pullcord-knob"
          aria-label={ariaLabel}
          aria-pressed={pulled}
          title={ariaLabel}
          ref={buttonRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(event) => {
            if (press.current?.id === event.pointerId) finishPointer(false)
          }}
          onPointerCancel={(event) => {
            if (press.current?.id === event.pointerId) finishPointer(true)
          }}
          onLostPointerCapture={(event) => {
            if (press.current?.id === event.pointerId) finishPointer(true)
          }}
          onClick={(event) => {
            if (event.detail === 0) scriptedPull()
          }}
          style={{
            position: 'absolute',
            left: (W - HIT_W) / 2,
            top: HIT_TOP,
            width: HIT_W,
            height: HIT_H,
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'grab',
            touchAction: 'none',
            pointerEvents: 'auto',
          }}
        />
      </div>
    </div>
  )
}
