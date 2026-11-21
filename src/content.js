// All site copy, links and asset paths live here so the client can review and
// update them in one place. Copy is taken verbatim from the approved reference:
// https://robertbrownsample.netlify.app/

// Public asset paths, exactly as supplied (spaces/commas are URL-encoded at use).
export const ASSETS = {
  chairArt: '/hero section images/Frozen Airbase, Pilot, and Fighter Jet.png',
  jetsArt: '/hero section images/Arctic fighter jets at sunset.png',
  bookCover: '/vaccum book cover.png',
}

export const assetUrl = (path) => encodeURI(path)

export const HERO_COPY = {
  duty: {
    word: 'Duty',
    line: 'Cape Lisburne. A frontier ceasefire. Orders that never stop.',
  },
  love: {
    word: 'Love',
    line: 'The one thing the chain of command cannot order.',
  },
  hint: 'Drag to choose a side',
  title: 'The Vacuum Between Polarities',
  byline: 'R. T. Brown · Eagle Canyon Squadron, Book VI',
  sliderLabel: 'Slide between Duty and Love',
}

export const MISSION = {
  heading: 'The mission',
  paragraphs: [
    'Governments and their commanders guard national interests across Aleyeska (Alaska) and Eastern Siberia, in a world of gifted, anthropomorphic mammals.',
    'It is an insight into the military command that lives on this frontier, where one cannot readily be promoted.',
  ],
}

export const HEART = {
  heading: 'The heart',
  paragraphs: [
    'Two female officers struggle to be accepted by one another, and by the service they swear to.',
    'The media follows them. When one is killed in combat, Gerlinde’s story becomes the struggle to love again.',
  ],
}

// PENDING: real URLs. `null` renders the button exactly as in the reference,
// but it does nothing when clicked and is marked "link pending".
export const LINKS = {
  amazon: null,
  barnesNoble: null,
  buyDirect: null,
  facebook: null,
  instagram: null,
}

export const BOOK = {
  heading: 'Out now: Book VI',
  coverAlt: 'Cover of The Vacuum Between Polarities',
  blurb:
    'A military story with a love story at its centre. Minimal sexual content, written for adult readers.',
  buttons: [
    { label: 'Amazon', href: LINKS.amazon },
    { label: 'Barnes & Noble', href: LINKS.barnesNoble },
    { label: 'Buy direct', href: LINKS.buyDirect },
  ],
}

export const SERIES = [
  { label: 'Book III · 2014' },
  { label: 'Books IV and V · written' },
  { label: 'Book VI · out now', current: true },
  { label: 'Book VII · Part II coming 2027' },
]

export const AUTHOR = {
  heading: 'The man behind the squadron',
  bio: 'R. T. Brown served in three NORAD commands, including Cape Lisburne Air Force Station, 173 miles from Siberia. The Eagle Canyon Squadron series comes from those long Arctic months.',
  // PENDING: add author photo paths here when supplied, e.g. ['/author/robert.jpg'].
  photos: [],
}

export const FOOTER = {
  newsletterPlaceholder: 'Newsletter sign-up goes here.',
  copyright: '© 2026 Robert Thomas Brown',
}
