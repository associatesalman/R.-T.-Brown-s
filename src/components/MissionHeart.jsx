import { HEART, MISSION } from '../content.js'

export default function MissionHeart() {
  return (
    <div className="cols">
      <section className="cd" aria-labelledby="mission-h">
        <h2 id="mission-h">{MISSION.heading}</h2>
        {MISSION.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>
      <section className="cl" aria-labelledby="heart-h">
        <h2 id="heart-h">{HEART.heading}</h2>
        {HEART.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>
    </div>
  )
}
