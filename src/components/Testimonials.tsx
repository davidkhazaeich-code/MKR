function StarSvg() {
  return (
    <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="7,1 9,5 13,5.5 10,8.5 10.5,13 7,11 3.5,13 4,8.5 1,5.5 5,5" />
    </svg>
  )
}

function PlayBtnSm() {
  return (
    <div className="play-btn-sm" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="4,2 14,8 4,14" fill="#F8F8F8" />
      </svg>
    </div>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonials" aria-labelledby="testimonials-heading">
      <div className="testimonials-glow" aria-hidden="true"></div>
      <div className="inner">
        <div className="testimonials-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            TÉMOIGNAGES
          </span>
          <h2 id="testimonials-heading" className="testimonials-title">
            ILS ONT GRAVI<br />LE SOMMET
          </h2>
        </div>

        <div className="testimonials-grid">

          {/* Testimonial 1 */}
          <div className="testi-card reveal">
            <div className="testi-video-wrap" role="button" tabIndex={0} aria-label="Voir le témoignage de Mehdi R.">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="testi-photo" src="/images/testimonials/mehdi-r.webp" alt="Mehdi R. — Lutte Libre, Paris" />
              <div className="testi-video-inner">
                <PlayBtnSm />
              </div>
            </div>
            <div className="testi-info">
              <p className="testi-quote">&ldquo;Trois semaines qui ont changé ma façon de me battre. La dureté des entraînements m&apos;a obligé à aller chercher ce que je n&apos;avais jamais touché.&rdquo;</p>
              <div className="testi-stars" aria-label="5 étoiles sur 5">
                <StarSvg /><StarSvg /><StarSvg /><StarSvg /><StarSvg />
              </div>
              <span className="testi-video-name">Mehdi R.</span>
              <span className="testi-video-discipline">Lutte Libre · Paris</span>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="testi-card reveal" style={{ transitionDelay: '0.12s' }}>
            <div className="testi-video-wrap" role="button" tabIndex={0} aria-label="Voir le témoignage de Karim D.">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="testi-photo" src="/images/testimonials/karim-d.webp" alt="Karim D. — MMA, Genève" />
              <div className="testi-video-inner">
                <PlayBtnSm />
              </div>
            </div>
            <div className="testi-info">
              <p className="testi-quote">&ldquo;Le niveau des coachs est inégalable. Zurab t&apos;apprend des prises que tu ne verras nulle part en Europe. J&apos;y retourne l&apos;année prochaine.&rdquo;</p>
              <div className="testi-stars" aria-label="5 étoiles sur 5">
                <StarSvg /><StarSvg /><StarSvg /><StarSvg /><StarSvg />
              </div>
              <span className="testi-video-name">Karim D.</span>
              <span className="testi-video-discipline">MMA · Genève</span>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="testi-card reveal" style={{ transitionDelay: '0.24s' }}>
            <div className="testi-video-wrap" role="button" tabIndex={0} aria-label="Voir le témoignage de Thomas B.">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="testi-photo" src="/images/testimonials/thomas-b.webp" alt="Thomas B. — Boxe, Lyon" />
              <div className="testi-video-inner">
                <PlayBtnSm />
              </div>
            </div>
            <div className="testi-info">
              <p className="testi-quote">&ldquo;Deux semaines après le retour, j&apos;ai remporté mon premier titre régional. Ce que j&apos;ai construit là-bas, aucun gym en France ne pouvait me le donner.&rdquo;</p>
              <div className="testi-stars" aria-label="5 étoiles sur 5">
                <StarSvg /><StarSvg /><StarSvg /><StarSvg /><StarSvg />
              </div>
              <span className="testi-video-name">Thomas B.</span>
              <span className="testi-video-discipline">Boxe · Lyon</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
