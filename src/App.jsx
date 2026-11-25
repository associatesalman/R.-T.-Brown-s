import { useState } from 'react'
import Hero from './components/Hero.jsx'
import MissionHeart from './components/MissionHeart.jsx'
import BookSection from './components/BookSection.jsx'
import Author from './components/Author.jsx'
import Footer from './components/Footer.jsx'
import { HERO_PLACEMENT, HERO_VARIANTS } from './heroConfig.js'

// URL option for development:
//   ?debug=focus     outline the protected areas of the chair artwork
function readParams() {
  const q = new URLSearchParams(window.location.search)
  return { debug: q.get('debug') === 'focus' }
}

export default function App() {
  const [params] = useState(readParams)

  return (
    <>
      <Hero variant={HERO_VARIANTS[HERO_PLACEMENT]} debug={params.debug} />
      <main>
        <MissionHeart />
        <BookSection />
        <Author />
      </main>
      <Footer />
    </>
  )
}
