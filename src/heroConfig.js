import { ASSETS } from './content.js'

// Both hero artworks are 1672 × 941.
const NATURAL = { width: 1672, height: 941 }

// Areas of each artwork, as fractions of image width (u) and height (v).
// They are used to frame the art and pick the starting divider position.
export const ARTWORK = {
  chair: {
    src: ASSETS.chairArt,
    ...NATURAL,
    alt: 'A pilot sits alone in a chair on a frozen airbase at night. In a beam of light above her, two women press their heads together.',
    // The two women's faces in the light beam, upper right. These must stay visible.
    faces: { u0: 0.725, u1: 0.865, v0: 0.1, v1: 0.31 },
    // The seated woman's head, shoulders and chair back.
    seatedCore: { u0: 0.64, u1: 0.72, v0: 0.52, v1: 0.8 },
    // The whole seated woman, including her legs and boots.
    seatedFull: { u0: 0.52, u1: 0.72, v0: 0.52, v1: 0.88 },
  },
  jets: {
    src: ASSETS.jetsArt,
    ...NATURAL,
    alt: 'A pilot stands on an icy runway watching two fighter jets climb over snowy mountains at sunset.',
    // The pilot and both jets.
    focus: { u0: 0.27, u1: 0.72, v0: 0.3, v1: 1 },
    // On phones only part of the image fits, so centre the foreground pilot
    // (helmet and shoulders span u ≈ 0.405–0.58). Both jets' noses stay in frame.
    mobileCentreU: 0.49,
  },
}

// Hero placements. The Duty and Love labels and captions never move sides.
// Only the artwork underneath them swaps.
export const HERO_VARIANTS = {
  reference: {
    id: 'reference',
    label: 'Reference',
    description: 'Chair under Duty (left) · jets under Love (right)',
    duty: 'chair',
    love: 'jets',
  },
  swapped: {
    id: 'swapped',
    label: 'Swapped',
    description: 'Jets under Duty (left) · chair under Love (right)',
    duty: 'jets',
    love: 'chair',
  },
}

// Approved placement shown on the live site: the pilot/jets artwork under Duty
// (left) and the two women pressing their heads together under Love (right).
export const HERO_PLACEMENT = 'swapped'
