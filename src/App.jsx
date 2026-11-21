import { useEffect, useState } from 'react'
import Hero from './components/Hero.jsx'
import MissionHeart from './components/MissionHeart.jsx'
import BookSection from './components/BookSection.jsx'
import Author from './components/Author.jsx'
import Footer from './components/Footer.jsx'
import VariantSwitch from './components/VariantSwitch.jsx'
import { DEFAULT_VARIANT, HERO_VARIANTS, SHOW_VARIANT_SWITCH } from './heroConfig.js'

// URL options for review:
//   ?hero=reference  chair under Duty, jets under Love (default)
//   ?hero=swapped    jets under Duty, chair under Love
//   ?switch=0        hide the floating review switch (for clean screenshots)
//   ?debug=focus     outline the protected areas of the chair artwork
function readParams() {
  const q = new URLSearchParams(window.location.search)
  const hero = HERO_VARIANTS[q.get('hero')] ? q.get('hero') : DEFAULT_VARIANT
  return {
    hero,
    showSwitch: SHOW_VARIANT_SWITCH && q.get('switch') !== '0',
    debug: q.get('debug') === 'focus',
  }
}

export default function App() {
  const [params] = useState(readParams)
  const [variantId, setVariantId] = useState(params.hero)

  // Keep the URL in sync so a placement can be shared as a link.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (variantId === DEFAULT_VARIANT) url.searchParams.delete('hero')
    else url.searchParams.set('hero', variantId)
    window.history.replaceState(null, '', url)
  }, [variantId])

  return (
    <>
      <Hero variant={HERO_VARIANTS[variantId]} debug={params.debug} />
      <main>
        <MissionHeart />
        <BookSection />
        <Author />
      </main>
      <Footer />
      {params.showSwitch && <VariantSwitch current={variantId} onChange={setVariantId} />}
    </>
  )
}
