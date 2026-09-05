import { useEffect } from 'react'
import { useNavigate, useLocation, useRouter } from '@tanstack/react-router'
import { deploymentBase } from '~/lib/deployment'

type Point = { x: number; y: number }
// Homography from a viewport rectangle to the photographed page quadrilateral.
// A CSS matrix3d preserves perspective, unlike a bounding-box-only zoom.
export function pageProjection(points: Point[], width: number, height: number) {
  const from = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ]
  const rows: number[][] = []
  points.forEach((p, i) => {
    const [x, y] = from[i]!
    rows.push([x!, y!, 1, 0, 0, 0, -p.x * x!, -p.x * y!, p.x])
    rows.push([0, 0, 0, x!, y!, 1, -p.y * x!, -p.y * y!, p.y])
  })
  for (let col = 0; col < 8; col++) {
    let pivot = col
    for (let r = col + 1; r < 8; r++)
      if (Math.abs(rows[r]![col]!) > Math.abs(rows[pivot]![col]!)) pivot = r
    ;[rows[col], rows[pivot]] = [rows[pivot]!, rows[col]!]
    const d = rows[col]![col]!
    if (Math.abs(d) < 1e-10) return null
    for (let j = col; j <= 8; j++) rows[col]![j] = rows[col]![j]! / d
    for (let r = 0; r < 8; r++)
      if (r !== col) {
        const f = rows[r]![col]!
        for (let j = col; j <= 8; j++)
          rows[r]![j] = rows[r]![j]! - f * rows[col]![j]!
      }
  }
  const [a, b, c, d, e, f, g, h] = rows.map((r) => r[8]!)
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`
}

/** One lazy, same-origin destination surface. It is noninteractive while on the
 * paper; the accessible link and the actual 3D cap own activation. No canvas
 * screenshot service, viewport-specific images, recursive hero or new hosting.
 */
export function DestinationPortal() {
  const navigate = useNavigate()
  const router = useRouter()
  const pathname = useLocation({ select: (state) => state.pathname })
  useEffect(() => {
    if (window.self !== window.top) return
    let source: HTMLIFrameElement | null = null,
      view: HTMLIFrameElement | null = null
    let surface: HTMLDivElement | null = null,
      cue: HTMLDivElement | null = null,
      href = '',
      loaded = false,
      entering = false,
      generation = 0
    let fetchController: AbortController | null = null
    let latest: { corners: Point[]; visible: boolean } | null = null
    let poseAnimation: Animation | null = null
    const post = (ready: boolean) =>
      source?.contentWindow?.postMessage(
        { type: 'orbit-destination-ready', href, ready },
        location.origin,
      )
    const hide = () => {
      if (surface && !entering) surface.style.opacity = '0'
      if (cue) cue.style.opacity = '0'
    }
    const clear = () => {
      generation++
      fetchController?.abort()
      poseAnimation?.cancel()
      surface?.remove()
      cue?.remove()
      cue = null
      surface = null
      view = null
      loaded = false
      latest = null
      href = ''
    }
    const place = () => {
      if (!surface || !source || !latest || entering) return
      const r = source.getBoundingClientRect()
      const corners = latest.corners.map((p) => ({
        x: r.left + p.x,
        y: r.top + p.y,
      }))
      const matrix = pageProjection(corners, innerWidth, innerHeight)
      if (matrix) surface.style.transform = matrix
      surface.style.transition = latest.visible ? 'opacity 220ms ease' : 'none'
      surface.style.opacity = loaded && latest.visible && !!matrix ? '1' : '0'
      surface.dataset.visible = String(loaded && latest.visible)
      if (cue) {
        const center = (corners[0]!.x + corners[1]!.x) / 2
        cue.style.left =
          Math.max(100, Math.min(innerWidth - 100, center)) + 'px'
        cue.style.top =
          Math.max(
            16,
            Math.min(
              innerHeight - 90,
              Math.min(corners[0]!.y, corners[1]!.y) - 56,
            ),
          ) + 'px'
        cue.style.opacity = loaded && latest.visible ? '1' : '0'
      }
    }
    const prepare = (next: string, notify = false) => {
      if (next === href && surface) {
        if (notify) post(loaded)
        return
      }
      clear()
      href = next
      const mine = ++generation
      surface = document.createElement('div')
      surface.dataset.destinationPortal = 'true'
      Object.assign(surface.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: innerWidth + 'px',
        height: innerHeight + 'px',
        transformOrigin: '0 0',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '45',
        overflow: 'hidden',
        background: 'var(--canvas)',
        transition: 'opacity 220ms ease',
        willChange: 'transform',
        boxShadow: '0 0 0 1px rgba(0,0,0,.12)',
      })
      surface.setAttribute('aria-hidden', 'true')
      view = document.createElement('iframe')
      view.title = 'Destination page preview'
      view.tabIndex = -1
      view.dataset.destinationFrame = next
      view.setAttribute('sandbox', 'allow-same-origin')
      cue = document.createElement('div')
      cue.dataset.destinationCue = 'true'
      cue.setAttribute('aria-hidden', 'true')
      Object.assign(cue.style, {
        position: 'fixed',
        transform: 'translateX(-50%)',
        zIndex: '46',
        pointerEvents: 'none',
        opacity: '0',
        textAlign: 'center',
        font: '500 12px/1.35 "DM Sans",sans-serif',
        color: '#343a30',
        transition: 'opacity 180ms ease',
      })
      const locale = new URL(next).pathname
        .slice(deploymentBase.length)
        .split('/')[1]
      const touch = matchMedia('(pointer:coarse)').matches
      const label = document.createElement('span')
      label.textContent =
        locale === 'ar'
          ? 'اضغط لفتح الكتاب'
          : locale === 'da'
            ? touch
              ? 'Tryk for at åbne bogen'
              : 'Klik for at åbne bogen'
            : touch
              ? 'Tap to open the book'
              : 'Click to open the book'
      Object.assign(label.style, {
        display: 'block',
        padding: '7px 11px',
        borderRadius: '18px',
        background: 'rgba(255,253,243,.95)',
        boxShadow: '0 2px 10px #00000012',
        whiteSpace: 'nowrap',
      })
      cue.append(label)
      const arrow = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      )
      arrow.setAttribute('viewBox', '0 0 50 25')
      arrow.setAttribute('width', '50')
      arrow.setAttribute('height', '25')
      arrow.innerHTML =
        '<path d="M12 2C42 0 42 16 28 21M28 21l2-8M28 21l9-1" fill="none" stroke="#786d4f" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
      cue.append(arrow)
      document.body.append(cue)
      Object.assign(view.style, {
        width: '100%',
        height: '100%',
        border: '0',
        pointerEvents: 'none',
        display: 'block',
      })
      view.onload = async () => {
        if (mine !== generation || !view) return
        try {
          const doc = view.contentDocument!
          if (!doc?.querySelector('main h1')) {
            post(false)
            return
          }
          const style = doc.createElement('style')
          style.textContent =
            'html,body{overflow:hidden!important}.pullcord{display:none!important}*{animation:none!important;scroll-behavior:auto!important}'
          doc.head.append(style)
          const imageReady = Promise.all(
            [...doc.images]
              .filter(
                (i) =>
                  i.loading !== 'lazy' ||
                  i.getBoundingClientRect().top < innerHeight,
              )
              .map((i) => i.decode().catch(() => {})),
          )
          await Promise.race([
            Promise.all([doc.fonts.ready, imageReady]),
            new Promise((r) => setTimeout(r, 3500)),
          ])
          if (mine !== generation) return
          loaded = true
          post(true)
          place()
        } catch {
          post(false)
        }
      }
      surface.append(view)
      document.body.append(surface)
      // The destination is already SSR: do not run a second React/router/Motion app
      // just to photograph it. Same HTML/CSS/fonts/images, zero preview scripts.
      fetchController = new AbortController()
      fetch(next, { signal: fetchController.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error('Destination preview unavailable')
          const html = await response.text()
          if (mine !== generation || !view) return
          const doc = new DOMParser().parseFromString(html, 'text/html')
          doc
            .querySelectorAll('script,link[rel="modulepreload"]')
            .forEach((node) => node.remove())
          const base = doc.createElement('base')
          base.href = next
          doc.head.prepend(base)
          doc.documentElement.setAttribute(
            'data-theme',
            document.documentElement.getAttribute('data-theme') || 'system',
          )
          view.srcdoc = '<!doctype html>' + doc.documentElement.outerHTML
        })
        .catch(() => {
          if (mine === generation) post(false)
        })
      const parts = new URL(next).pathname
        .slice(deploymentBase.length)
        .split('/')
      void router
        .preloadRoute({
          to: '/$locale/books/$slug',
          params: { locale: parts[1]!, slug: parts[3]! },
        })
        .catch(() => {})
    }
    const enter = async () => {
      if (entering || !href) return
      const url = new URL(href)
      const match = url.pathname
        .slice(deploymentBase.length)
        .match(/^\/(en|da|ar)\/books\/([a-z0-9-]+)\/?$/)
      if (!match) return
      entering = true
      if (cue) cue.style.opacity = '0'
      const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches
      if (surface && loaded && !reduced) {
        surface.style.zIndex = '1000'
        surface.style.opacity = '1'
        surface.style.transition = 'none'
        surface.style.pointerEvents = 'auto'
        surface.dataset.transitioning = 'true'
        poseAnimation = surface.animate(
          [
            { transform: surface.style.transform },
            { transform: 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)' },
          ],
          {
            duration: 720,
            easing: 'cubic-bezier(.2,.7,.12,1)',
            fill: 'forwards',
          },
        )
        await poseAnimation.finished.catch(() => {})
      }
      try {
        document.documentElement.setAttribute('data-orbit-arrival', 'true')
        await navigate({
          to: '/$locale/books/$slug',
          params: { locale: match[1]!, slug: match[2]! },
          resetScroll: true,
        })
        await new Promise(requestAnimationFrame)
        await new Promise(requestAnimationFrame)
        if (surface && !reduced)
          await surface
            .animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 180,
              fill: 'forwards',
            })
            .finished.catch(() => {})
        document.documentElement.removeAttribute('data-orbit-arrival')
        clear()
        entering = false
      } catch {
        document.documentElement.removeAttribute('data-orbit-arrival')
        window.location.assign(url.href)
      }
    }
    const receive = (event: MessageEvent) => {
      const orbit = document.querySelector<HTMLIFrameElement>(
        'iframe[data-orbit-frame]',
      )
      if (
        event.origin !== location.origin ||
        !orbit ||
        event.source !== orbit.contentWindow
      )
        return
      source = orbit
      const d = event.data
      if (!d || typeof d !== 'object') return
      if (
        d.type === 'orbit-destination-pose' ||
        d.type === 'orbit-destination-preload'
      ) {
        let url: URL
        try {
          url = new URL(d.href, location.href)
        } catch {
          return
        }
        if (
          url.origin !== location.origin ||
          !url.pathname.startsWith(deploymentBase + '/') ||
          !/^\/(en|da|ar)\/books\/[a-z0-9-]+\/?$/.test(
            url.pathname.slice(deploymentBase.length),
          )
        )
          return
        if (d.type === 'orbit-destination-preload') {
          prepare(url.href, true)
          return
        }
        if (
          !Array.isArray(d.corners) ||
          d.corners.length !== 4 ||
          d.corners.some(
            (p: Point) => !Number.isFinite(p.x) || !Number.isFinite(p.y),
          )
        )
          return
        prepare(url.href)
        latest = { corners: d.corners, visible: !!d.visible }
        place()
      } else if (
        [
          'orbit-destination-hide',
          'orbit-context-lost',
          'orbit-error',
        ].includes(d.type)
      )
        hide()
      else if (
        d.type === 'orbit-destination-enter' &&
        new URL(d.href, location.href).href === href
      )
        void enter()
      else if (
        d.type === 'orbit-state' &&
        ['orbit', 'returning', 'pullingOut'].includes(d.state)
      )
        hide()
    }
    const resize = () => {
      if (surface) {
        surface.style.width = innerWidth + 'px'
        surface.style.height = innerHeight + 'px'
      }
      place()
    }
    const syncTheme = () => {
      view?.contentDocument?.documentElement.setAttribute(
        'data-theme',
        document.documentElement.getAttribute('data-theme') || 'system',
      )
    }
    const reduced = matchMedia('(prefers-reduced-motion:reduce)')
    const motionChange = () => {
      if (reduced.matches) {
        clear()
        entering = false
      }
    }
    reduced.addEventListener('change', motionChange)
    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    window.addEventListener('message', receive)
    window.addEventListener('scroll', place, { passive: true })
    window.addEventListener('resize', resize)
    return () => {
      reduced.removeEventListener('change', motionChange)
      observer.disconnect()
      window.removeEventListener('message', receive)
      window.removeEventListener('scroll', place)
      window.removeEventListener('resize', resize)
      clear()
    }
  }, [navigate, pathname, router])
  return null
}
