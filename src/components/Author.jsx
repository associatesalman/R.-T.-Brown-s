import { AUTHOR } from '../content.js'

export default function Author() {
  const hasPhotos = AUTHOR.photos.length > 0
  return (
    <section className="wrap author" aria-labelledby="author-h">
      <div className={hasPhotos ? 'author-grid' : undefined}>
        {hasPhotos && (
          <div className="author-photos">
            {AUTHOR.photos.map((src) => (
              <img key={src} src={encodeURI(src)} alt="R. T. Brown" loading="lazy" decoding="async" />
            ))}
          </div>
        )}
        <div>
          <h3 id="author-h">{AUTHOR.heading}</h3>
          <p className="bio">{AUTHOR.bio}</p>
        </div>
      </div>
    </section>
  )
}
