export default function VideoSection() {
  return (
    <section id="video-section" aria-labelledby="video-heading">
      <div className="video-glow" aria-hidden="true"></div>
      <div className="inner">
        <div className="video-section-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '1rem' }}>
            L&apos;EXPÉRIENCE
          </span>
          <h2 id="video-heading" className="video-section-title">
            L&apos;IMMERSION<br />AU CŒUR DU <span>COMBAT</span>
          </h2>
        </div>

        {/* Main video placeholder */}
        <div
          className="video-main reveal"
          role="button"
          tabIndex={0}
          aria-label="Voir la vidéo de présentation"
        >
          <div className="video-main-inner">
            <div className="play-btn" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <polygon points="8,4 24,14 8,24" fill="#F8F8F8" />
              </svg>
            </div>
            <span className="video-caption">Découvrez l&apos;immersion en vidéo</span>
          </div>
        </div>

        {/* 3 testimonial thumbs */}
        <div className="video-thumbs">
          <div
            className="video-thumb reveal"
            role="button"
            tabIndex={0}
            aria-label="Voir le témoignage 01"
          >
            <div className="video-thumb-inner">
              <div className="play-btn-sm" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <polygon points="4,2 14,8 4,14" fill="#F8F8F8" />
                </svg>
              </div>
              <span className="thumb-label">TÉMOIGNAGE 01</span>
            </div>
          </div>

          <div
            className="video-thumb reveal"
            role="button"
            tabIndex={0}
            aria-label="Voir le témoignage 02"
            style={{ transitionDelay: '0.1s' }}
          >
            <div className="video-thumb-inner">
              <div className="play-btn-sm" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <polygon points="4,2 14,8 4,14" fill="#F8F8F8" />
                </svg>
              </div>
              <span className="thumb-label">TÉMOIGNAGE 02</span>
            </div>
          </div>

          <div
            className="video-thumb reveal"
            role="button"
            tabIndex={0}
            aria-label="Voir le témoignage 03"
            style={{ transitionDelay: '0.2s' }}
          >
            <div className="video-thumb-inner">
              <div className="play-btn-sm" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <polygon points="4,2 14,8 4,14" fill="#F8F8F8" />
                </svg>
              </div>
              <span className="thumb-label">TÉMOIGNAGE 03</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
