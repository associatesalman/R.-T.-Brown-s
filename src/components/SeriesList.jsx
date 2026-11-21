import { SERIES } from '../content.js'

// The Eagle Canyon Squadron series list. In the reference it's a row of chips
// below the Book VI purchase buttons.
export default function SeriesList() {
  return (
    <ul className="s" aria-label="Eagle Canyon Squadron series">
      {SERIES.map((b) => (
        <li key={b.label} className={b.current ? 'n' : undefined} aria-current={b.current ? 'true' : undefined}>
          {b.label}
        </li>
      ))}
    </ul>
  )
}
