// Framing geometry for the two-image hero.
//
// Each image fills the frame like `object-fit: cover`, so it scales up and
// never stretches. The only thing chosen here is how far the image is shifted
// within the frame (its object-position), so the important parts of the
// artwork stay visible. The starting divider position is then set so the
// chair artwork's key scene is visible when the page loads.

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// Cover-scaled size of an image in a vw × vh frame.
function coverSize(vw, vh, natW, natH) {
  const s = Math.max(vw / natW, vh / natH)
  return { W: natW * s, H: natH * s }
}

// Image-fraction box → on-screen pixel box, given the image's offset.
function toScreen(box, W, H, offX, offY) {
  return {
    x0: box.u0 * W - offX,
    x1: box.u1 * W - offX,
    y0: box.v0 * H - offY,
    y1: box.v1 * H - offY,
  }
}

// Turn pixel offsets into object-position percentages.
function toPosition(offX, offY, W, H, vw, vh) {
  const maxX = W - vw
  const maxY = H - vh
  return {
    x: maxX > 0.5 ? (offX / maxX) * 100 : 50,
    y: maxY > 0.5 ? (offY / maxY) * 100 : 50,
  }
}

// Frame the chair artwork. Its image is shifted as far left as possible while
// keeping the whole composition in frame (faces plus the full seated woman).
// When that is wider than the screen, as on phones in portrait, fall back to
// the faces plus her head, shoulders and chair.
// Shifting left moves the faces toward the centre, which leaves more room for
// the other side whichever half the chair is under.
function frameChair(art, vw, vh) {
  const { W, H } = coverSize(vw, vh, art.width, art.height)
  const margin = Math.max(12, vw * 0.015)
  const maxX = W - vw
  const maxY = H - vh

  const tryKeep = (keep) => {
    const lo = keep.u1 * W + margin - vw // smallest offset that keeps its right edge in frame
    const hi = keep.u0 * W - margin // largest offset that keeps its left edge in frame
    return lo <= hi ? clamp(hi, 0, maxX) : null
  }

  const union = {
    u0: Math.min(art.faces.u0, art.seatedFull.u0),
    u1: Math.max(art.faces.u1, art.seatedFull.u1),
  }
  const core = {
    u0: Math.min(art.faces.u0, art.seatedCore.u0),
    u1: Math.max(art.faces.u1, art.seatedCore.u1),
  }

  let keeps = 'full'
  let offX = tryKeep(union)
  if (offX === null) {
    keeps = 'core'
    offX = tryKeep(core)
  }
  if (offX === null) {
    // Very narrow frame: keep just the faces, centred.
    keeps = 'faces'
    offX = clamp(((art.faces.u0 + art.faces.u1) / 2) * W - vw / 2, 0, maxX)
  }

  // Vertical: centre the faces-to-seated-woman span, but never cut the faces.
  const v0 = art.faces.v0
  const v1 = art.seatedFull.v1
  let offY = clamp(((v0 + v1) / 2) * H - vh / 2, 0, maxY)
  offY = Math.min(offY, Math.max(0, v0 * H - margin))

  return {
    W,
    H,
    offX,
    offY,
    keeps,
    position: toPosition(offX, offY, W, H, vw, vh),
    faces: toScreen(art.faces, W, H, offX, offY),
    seated: toScreen(keeps === 'full' ? art.seatedFull : art.seatedCore, W, H, offX, offY),
  }
}

// Frame the jets artwork so its subject sits in the middle of whatever part
// of the frame it is revealed in.
const MOBILE_MAX_WIDTH = 760 // same breakpoint as the CSS

function frameJets(art, vw, vh, visibleCentrePx) {
  const { W, H } = coverSize(vw, vh, art.width, art.height)
  let offX
  if (vw <= MOBILE_MAX_WIDTH && vh > vw && art.mobileCentreU != null) {
    // Phones in portrait: keep the pilot centred in the full frame, so they
    // stay whole however far the divider is dragged.
    offX = clamp(art.mobileCentreU * W - vw / 2, 0, W - vw)
  } else {
    const cu = (art.focus.u0 + art.focus.u1) / 2
    offX = clamp(cu * W - visibleCentrePx, 0, W - vw)
  }
  const offY = clamp(0.42 * H - vh / 2, 0, H - vh)
  return { position: toPosition(offX, offY, W, H, vw, vh) }
}

const MIN_OTHER_SIDE = 35 // % of the frame left for the other artwork before we prefer it

/**
 * @param {object} p
 * @param {number} p.vw   hero width (px)
 * @param {number} p.vh   hero height (px)
 * @param {'left'|'right'} p.chairSide  which side of the divider shows the chair artwork
 * @param {object} p.chair  ARTWORK.chair
 * @param {object} p.jets   ARTWORK.jets
 * @returns {{start:number, chair:object, jets:object}}
 */
export function computeHeroLayout({ vw, vh, chairSide, chair, jets }) {
  const c = frameChair(chair, vw, vh)
  const gap = Math.max(14, vw * 0.02)

  let start
  if (chairSide === 'left') {
    // Chair is revealed left of the divider: start just right of the faces.
    // The seated woman sits left of the faces, so she is visible too.
    start = ((Math.max(c.faces.x1, c.seated.x1) + gap) / vw) * 100
  } else {
    // Chair is revealed right of the divider: show the whole composition when
    // that still leaves the jets a fair share, otherwise just the faces.
    const withSeated = ((Math.min(c.faces.x0, c.seated.x0) - gap) / vw) * 100
    const facesOnly = ((c.faces.x0 - gap) / vw) * 100
    start = withSeated >= MIN_OTHER_SIDE ? withSeated : facesOnly
  }
  start = clamp(start, 4, 96)

  const startPx = (start / 100) * vw
  const jetsVisibleCentre = chairSide === 'left' ? (startPx + vw) / 2 : startPx / 2
  const j = frameJets(jets, vw, vh, jetsVisibleCentre)

  return { start, chair: c, jets: j }
}

// If the chair side's big word would cover the faces, move it down below them.
// `word` is the word's on-screen box at its default position.
export function wordTopAvoidingFaces(word, faces, vh) {
  const pad = 8
  const overlaps =
    word.x0 < faces.x1 + pad &&
    word.x1 > faces.x0 - pad &&
    word.y0 < faces.y1 + pad &&
    word.y1 > faces.y0 - pad
  if (!overlaps) return null
  const top = faces.y1 + Math.max(16, vh * 0.025)
  return top
}
