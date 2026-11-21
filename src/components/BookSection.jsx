import { ASSETS, BOOK, assetUrl } from '../content.js'
import PendingLink from './PendingLink.jsx'
import SeriesList from './SeriesList.jsx'

export default function BookSection() {
  return (
    <section className="wrap" aria-labelledby="book-h">
      <div className="book">
        <img
          src={assetUrl(ASSETS.bookCover)}
          alt={BOOK.coverAlt}
          width="992"
          height="1586"
          loading="lazy"
          decoding="async"
        />
        <div>
          <h3 id="book-h">{BOOK.heading}</h3>
          <p>{BOOK.blurb}</p>
          <div className="btns">
            {BOOK.buttons.map((b, i) => (
              <span key={b.label}>
                {i > 0 && ' '}
                <PendingLink className="btn" href={b.href}>
                  {b.label}
                </PendingLink>
              </span>
            ))}
          </div>
          <SeriesList />
        </div>
      </div>
    </section>
  )
}
