import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { HERO_COPY, assetUrl } from '../content.js'
import { ARTWORK } from '../heroConfig.js'
import { computeHeroLayout, wordTopAvoidingFaces } from '../heroLayout.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Intro "breathing" motion, the same curve as the reference (≈3.3 s), centred on
// the computed start position instead of 50%.
const INTRO_MS = 3333
const INTRO_AMPLITUDE = 28

function valueText(x) {
  const duty = Math.round(x)
  if (duty >= 60) return `Mostly Duty (${duty}% Duty, ${100 - duty}% Love)`
  if (duty <= 40) return `Mostly Love (${duty}% Duty, ${100 - duty}% Love)`
  return `Balanced (${duty}% Duty, ${100 - duty}% Love)`
}

export default function Hero({ variant, debug = false }) {
  const heroRef = useRef(null)
  const handleRef = useRef(null)
  const dutyWordRef = useRef(null)
  const loveWordRef = useRef(null)
  const dutyLineRef = useRef(null)
  const loveLineRef = useRef(null)
  const imgRefs = { duty: useRef(null), love: useRef(null) }

  const posRef = useRef(50) // current divider position, 0–100 (% from left)
  const startRef = useRef(50) // computed starting position for this viewport
  const touchedRef = useRef(false) // user has interacted, so stop auto-positioning
  const animRef = useRef(0)
  const dragRef = useRef(null)
  const [debugBoxes, setDebugBoxes] = useState(null)

  const dutyArt = ARTWORK[variant.duty]
  const loveArt = ARTWORK[variant.love]
  const chairSide = variant.duty === 'chair' ? 'left' : 'right'

  // The divider moves by writing one CSS variable. React doesn't re-render
  // while dragging, so the divider follows the pointer without lag.
  const setPos = useCallback((x) => {
    const v = clamp(x, 0, 100)
    posRef.current = v
    const hero = heroRef.current
    if (hero) hero.style.setProperty('--x', `${v}%`)
    const h = handleRef.current
    if (h) {
      h.setAttribute('aria-valuenow', String(Math.round(v)))
      h.setAttribute('aria-valuetext', valueText(v))
    }
  }, [])

  const stopAnim = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    animRef.current = 0
  }, [])

  const markTouched = useCallback(() => {
    touchedRef.current = true
    stopAnim()
  }, [stopAnim])

  // ---- Framing (runs on mount, on resize and when the variant changes) ----
  const applyLayout = useCallback(() => {
    const hero = heroRef.current
    if (!hero) return
    const vw = hero.clientWidth
    const vh = hero.clientHeight
    if (!vw || !vh) return

    const layout = computeHeroLayout({ vw, vh, chairSide, chair: ARTWORK.chair, jets: ARTWORK.jets })
    const chairPos = `${layout.chair.position.x}% ${layout.chair.position.y}%`
    const jetsPos = `${layout.jets.position.x}% ${layout.jets.position.y}%`
    const dutyImg = imgRefs.duty.current
    const loveImg = imgRefs.love.current
    if (dutyImg) dutyImg.style.objectPosition = variant.duty === 'chair' ? chairPos : jetsPos
    if (loveImg) loveImg.style.objectPosition = variant.love === 'chair' ? chairPos : jetsPos

    // Keep the chair side's big word off the faces.
    const chairWord = chairSide === 'left' ? dutyWordRef.current : loveWordRef.current
    const otherWord = chairSide === 'left' ? loveWordRef.current : dutyWordRef.current
    if (otherWord) otherWord.style.removeProperty('--word-top')
    if (chairWord) {
      const w = chairWord.offsetWidth
      const h = chairWord.offsetHeight
      const inset = 0.05 * vw
      const y0 = 0.16 * vh
      const box =
        chairSide === 'left'
          ? { x0: inset, x1: inset + w, y0, y1: y0 + h }
          : { x0: vw - inset - w, x1: vw - inset, y0, y1: y0 + h }
      const top = wordTopAvoidingFaces(box, layout.chair.faces, vh)
      if (top == null) chairWord.style.removeProperty('--word-top')
      else chairWord.style.setProperty('--word-top', `${top}px`)

      // Keep the chair side's caption off the seated woman when it fits
      // between the big word and her. Mostly matters on phones.
      const chairLine = chairSide === 'left' ? dutyLineRef.current : loveLineRef.current
      const otherLine = chairSide === 'left' ? loveLineRef.current : dutyLineRef.current
      otherLine?.style.removeProperty('--line-bottom')
      if (chairLine) {
        chairLine.style.removeProperty('--line-bottom')
        const lw = chairLine.offsetWidth
        const lh = chairLine.offsetHeight
        const lcs = getComputedStyle(chairLine)
        const lBottom = parseFloat(lcs.bottom) || 0
        const lMargin = parseFloat(lcs.marginBottom) || 0 // the reference keeps default <p> margins
        const ly1 = vh - lBottom - lMargin
        const lbox =
          chairSide === 'left'
            ? { x0: inset, x1: inset + lw, y0: ly1 - lh, y1: ly1 }
            : { x0: vw - inset - lw, x1: vw - inset, y0: ly1 - lh, y1: ly1 }
        const s = layout.chair.seated
        // Ignore edge contact: only count a real overlap with the seated woman.
        const xOverlap = Math.min(lbox.x1, s.x1) - Math.max(lbox.x0, s.x0)
        const hitsSeated = xOverlap > 24 && lbox.y0 < s.y1 && lbox.y1 > s.y0
        if (hitsSeated) {
          const wordBottom = (top ?? y0) + h
          const roomTop = wordBottom + 8
          const roomBottom = s.y0 + 8 // the seated box includes a little headroom above her hair
          if (roomBottom - roomTop >= lh) {
            chairLine.style.setProperty('--line-bottom', `${vh - roomBottom - lMargin}px`)
          }
        }
      }
    }

    startRef.current = layout.start
    if (!touchedRef.current && !animRef.current) setPos(layout.start)

    if (debug) setDebugBoxes({ faces: layout.chair.faces, seated: layout.chair.seated, keeps: layout.chair.keeps, start: layout.start, chairSide })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chairSide, variant.duty, variant.love, debug, setPos])

  useLayoutEffect(() => {
    applyLayout()
    const hero = heroRef.current
    const ro = new ResizeObserver(() => applyLayout())
    ro.observe(hero)
    // Web fonts change the word sizes, so measure again once they load.
    document.fonts?.ready.then(() => applyLayout())
    return () => ro.disconnect()
  }, [applyLayout])

  // ---- Intro motion: starts once both images have loaded ----
  const variantKey = variant.id
  useEffect(() => {
    touchedRef.current = false
    stopAnim()
    if (prefersReducedMotion()) {
      setPos(startRef.current)
      return
    }

    let cancelled = false
    const imgs = [imgRefs.duty.current, imgRefs.love.current].filter(Boolean)
    const ready = Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener('load', res, { once: true })
              img.addEventListener('error', res, { once: true })
            }),
      ),
    )
    // Don't wait forever on a slow network.
    const timeout = new Promise((res) => setTimeout(res, 2500))

    Promise.race([ready, timeout]).then(() => {
      if (cancelled || touchedRef.current) return
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / INTRO_MS)
        const t = p * 6 // same phase range as the reference
        const centre = startRef.current
        // Swing toward the side with more room first, so a start near an edge
        // doesn't sit against the frame edge.
        const dir = centre > 50 ? -1 : 1
        const v = centre + dir * Math.sin(t) * INTRO_AMPLITUDE * Math.max(0, 1 - t / 6)
        setPos(clamp(v, 0, 100))
        if (p < 1) animRef.current = requestAnimationFrame(tick)
        else {
          animRef.current = 0
          setPos(startRef.current)
        }
      }
      animRef.current = requestAnimationFrame(tick)
    })

    return () => {
      cancelled = true
      stopAnim()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantKey, setPos, stopAnim])

  // ---- Pointer input: mouse, pen and touch ----
  const xFromEvent = (e, rect) => ((e.clientX - rect.left) / rect.width) * 100

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const rect = heroRef.current.getBoundingClientRect()
    dragRef.current = {
      id: e.pointerId,
      type: e.pointerType,
      rect,
      startX: e.clientX,
      startY: e.clientY,
      active: e.pointerType !== 'touch', // touch waits until the swipe is clearly horizontal
    }
    if (e.pointerType !== 'touch') {
      markTouched()
      e.preventDefault() // no text selection or image dragging
      heroRef.current.setPointerCapture(e.pointerId)
      setPos(xFromEvent(e, rect))
      handleRef.current?.focus({ preventScroll: true })
    }
  }

  const onPointerMove = (e) => {
    const d = dragRef.current
    if (!d || d.id !== e.pointerId) return
    if (!d.active) {
      const dx = Math.abs(e.clientX - d.startX)
      const dy = Math.abs(e.clientY - d.startY)
      if (dx > 6 && dx > dy) {
        d.active = true
        markTouched()
        heroRef.current.setPointerCapture(e.pointerId)
      } else return
    }
    setPos(xFromEvent(e, d.rect))
  }

  const onPointerUp = (e) => {
    const d = dragRef.current
    if (!d || d.id !== e.pointerId) return
    // A touch tap with no movement jumps the divider, like a mouse click.
    if (d.type === 'touch' && !d.active) {
      const moved = Math.hypot(e.clientX - d.startX, e.clientY - d.startY)
      if (moved < 8) {
        markTouched()
        setPos(xFromEvent(e, d.rect))
      }
    }
    dragRef.current = null
  }

  const onPointerCancel = () => {
    dragRef.current = null // the browser took over to scroll the page
  }

  // ---- Keyboard ----
  const onKeyDown = (e) => {
    const big = e.shiftKey ? 10 : 2
    let next = null
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next = posRef.current - big
        break
      case 'ArrowRight':
      case 'ArrowUp':
        next = posRef.current + big
        break
      case 'PageDown':
        next = posRef.current - 10
        break
      case 'PageUp':
        next = posRef.current + 10
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = 100
        break
      default:
        return
    }
    e.preventDefault()
    markTouched()
    setPos(next)
  }

  const imgProps = (art) => ({
    src: assetUrl(art.src),
    alt: art.alt,
    width: art.width,
    height: art.height,
    fetchPriority: 'high',
    decoding: 'async',
    draggable: false,
  })

  return (
    <header
      className="hero"
      ref={heroRef}
      data-variant={variant.id}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className="side duty">
        <img className="art" ref={imgRefs.duty} {...imgProps(dutyArt)} />
        <div className="tint" aria-hidden="true" />
        <p className="word" ref={dutyWordRef}>{HERO_COPY.duty.word}</p>
        <p className="line" ref={dutyLineRef}>{HERO_COPY.duty.line}</p>
      </div>

      <div className="side love">
        <img className="art" ref={imgRefs.love} {...imgProps(loveArt)} />
        <div className="tint" aria-hidden="true" />
        <p className="word" ref={loveWordRef}>{HERO_COPY.love.word}</p>
        <p className="line" ref={loveLineRef}>{HERO_COPY.love.line}</p>
      </div>

      <div className="bar" aria-hidden="true" />

      <div className="ttl">
        <h1>{HERO_COPY.title}</h1>
        <small>{HERO_COPY.byline}</small>
      </div>

      <p className="hint">{HERO_COPY.hint}</p>

      <div
        className="handle"
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label={HERO_COPY.sliderLabel}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
        aria-valuetext={valueText(50)}
        onKeyDown={onKeyDown}
        onFocus={() => {
          // Keyboard focus stops the intro so the divider isn't moving under the user.
          if (!dragRef.current) markTouched()
        }}
      />

      {debug && debugBoxes && <DebugOverlay boxes={debugBoxes} />}
    </header>
  )
}

// Add ?debug=focus to the URL to outline the protected areas of the chair artwork.
function DebugOverlay({ boxes }) {
  const r = (b, color, label) => (
    <div
      className="dbg-box"
      style={{ left: b.x0, top: b.y0, width: b.x1 - b.x0, height: b.y1 - b.y0, borderColor: color }}
    >
      <span style={{ background: color }}>{label}</span>
    </div>
  )
  return (
    <div className="dbg" aria-hidden="true">
      {r(boxes.faces, '#ff3b6b', 'faces')}
      {r(boxes.seated, '#3bd1ff', `seated (${boxes.keeps})`)}
      <div className="dbg-info">
        chair {boxes.chairSide} · start {boxes.start.toFixed(1)}%
      </div>
    </div>
  )
}
