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
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { motion, useReducedMotion, type PanInfo } from 'motion/react'

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
const HIT = 46

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
      groupRef.current?.setAttribute(
        'transform',
        `translate(${(end.x - ANCHOR_X).toFixed(2)} ${(end.y - REST_Y).toFixed(2)})`,
      )
    }

    const step = (now: number) => {
      const { gravity, damping, iterations, sleepVelocity } = DEFAULT_CONFIG
      const dt = previousTime
        ? Math.min(0.04, Math.max(0.004, (now - previousTime) / 1000))
        : 1 / 60
      previousTime = now
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
      render()
      let speed = 0
      for (let i = 1; i < points.length; i++) {
        const point = points[i]!
        speed +=
          Math.abs(point.x - point.ox) + Math.abs(point.y - point.oy)
      }
      if (!dragging.current && speed < sleepVelocity * dt * 60) {
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
    return () => cancelAnimationFrame(raf)
  }, [])

  const toggle = () => onPullRef.current?.()
  const scriptedPull = () => {
    toggle()
    if (reduce) return
    const points = nodesRef.current!
    points[points.length - 1]!.oy -= 22
    wake.current()
  }

  const onPanStart = () => {
    dragging.current = true
    didDrag.current = true
    clicked.current = false
    wake.current()
  }

  const onPan = (_event: PointerEvent, info: PanInfo) => {
    const offsetX = info.offset.x
    const offsetY = REST_Y + info.offset.y
    const distance = Math.hypot(offsetX, offsetY) || 0.0001
    const maxDistance = REST_Y + DEFAULT_CONFIG.stretchMax
    const scale = distance > maxDistance ? maxDistance / distance : 1
    target.current = {
      x: ANCHOR_X + offsetX * scale,
      y: offsetY * scale,
    }
    const toggleAt = Math.min(
      DEFAULT_CONFIG.stretchToggle,
      DEFAULT_CONFIG.stretchMax - 1,
    )
    if (!clicked.current && distance - REST_Y >= toggleAt) {
      clicked.current = true
      toggle()
    }
  }

  const onPanEnd = () => {
    dragging.current = false
    const points = nodesRef.current!
    const point = points[points.length - 1]!
    const vx = point.x - point.ox
    const vy = point.y - point.oy
    const velocity = Math.hypot(vx, vy)
    if (velocity > DEFAULT_CONFIG.maxVelocity) {
      const scale = DEFAULT_CONFIG.maxVelocity / velocity
      point.ox = point.x - vx * scale
      point.oy = point.y - vy * scale
    }
    wake.current()
    requestAnimationFrame(() => {
      didDrag.current = false
    })
  }

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (didDrag.current || event.detail === 0) return
    scriptedPull()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
      event.preventDefault()
      scriptedPull()
    }
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
        className={drop ? 'pullcord-inner pullcord-inner--drop' : 'pullcord-inner'}
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
            <filter id="pc-knob-sh" x="-70%" y="-70%" width="240%" height="240%">
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
        <motion.button
          type="button"
          className="pullcord-knob"
          aria-label={ariaLabel}
          aria-pressed={pulled}
          title={ariaLabel}
          onPanStart={reduce ? undefined : onPanStart}
          onPan={reduce ? undefined : onPan}
          onPanEnd={reduce ? undefined : onPanEnd}
          onClick={onClick}
          onKeyDown={onKeyDown}
          style={{
            position: 'absolute',
            left: ANCHOR_X - HIT / 2,
            top: REST_Y - HIT / 2,
            width: HIT,
            height: HIT,
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
