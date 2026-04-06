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
            3 SEMAINES QUI<br />CHANGENT <span>TOUT</span>
          </h2>
        </div>

        {/* Main video placeholder with background image */}
        <div
          className="video-main reveal"
          role="button"
          tabIndex={0}
          aria-label="Voir la vidéo de présentation"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="video-main-bg"
            src="/images/environment/dagestan-panorama.webp"
            alt=""
            aria-hidden="true"
          />
          <div className="video-main-inner">
            <div className="play-btn" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <polygon points="8,4 24,14 8,24" fill="#F8F8F8" />
              </svg>
            </div>
            <span className="video-caption">Découvrez l&apos;immersion en vidéo</span>
          </div>
        </div>

        {/* Experience highlights */}
        <div className="video-highlights reveal" style={{ transitionDelay: '0.1s' }}>
          <div className="video-highlight-item">
            <span className="video-highlight-num">2x</span>
            <span className="video-highlight-label">Entraînements par jour</span>
          </div>
          <div className="video-highlight-item">
            <span className="video-highlight-num">4</span>
            <span className="video-highlight-label">Coachs champions</span>
          </div>
          <div className="video-highlight-item">
            <span className="video-highlight-num">15</span>
            <span className="video-highlight-label">Athlètes max par session</span>
          </div>
          <div className="video-highlight-item">
            <span className="video-highlight-num">0</span>
            <span className="video-highlight-label">Distraction</span>
          </div>
        </div>

      </div>
    </section>
  )
}
