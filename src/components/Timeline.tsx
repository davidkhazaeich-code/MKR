export default function Timeline() {
  return (
    <section id="timeline" aria-labelledby="timeline-heading">
      <div className="inner">
        <div className="timeline-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            LE PROCESSUS
          </span>
          <h2 id="timeline-heading" className="timeline-title">
            DE L&apos;INSCRIPTION<br />AU TAPIS
          </h2>
        </div>

        <div className="timeline-track">

          {/* Step 1 -Candidature (GAUCHE : image à l'extérieur, texte vers la ligne) */}
          <div className="timeline-step reveal">
            <div className="timeline-panel">
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/textures/concrete-soviet.webp" alt="Béton soviétique" />
                <div className="timeline-step-img-inner"></div>
              </div>
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="3" width="22" height="26" stroke="#C84B31" strokeWidth="2" />
                    <line x1="10" y1="11" x2="22" y2="11" stroke="#C84B31" strokeWidth="1.5" />
                    <line x1="10" y1="16" x2="22" y2="16" stroke="#C84B31" strokeWidth="1.5" />
                    <line x1="10" y1="21" x2="16" y2="21" stroke="#C84B31" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="timeline-num">01</div>
                <h3 className="timeline-step-title">CANDIDATURE</h3>
                <p className="timeline-step-body">Tu remplis le formulaire de candidature en ligne. Niveau actuel, discipline, objectifs. Nous avons besoin de savoir qui tu es avant de te dire si le camp est fait pour toi.</p>
              </div>
            </div>
            <div className="timeline-dot-wrap">
              <div className="timeline-dot"></div>
            </div>
            <div className="timeline-empty"></div>
          </div>

          {/* Step 2 -Entretien (DROITE : texte vers la ligne, image à l'extérieur) */}
          <div className="timeline-step timeline-step--reversed reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="timeline-empty"></div>
            <div className="timeline-dot-wrap">
              <div className="timeline-dot"></div>
            </div>
            <div className="timeline-panel">
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="20" height="16" stroke="#C84B31" strokeWidth="2" />
                    <polyline points="3,20 13,27 23,20" stroke="#C84B31" strokeWidth="2" fill="none" />
                    <line x1="8" y1="10" x2="18" y2="10" stroke="#C84B31" strokeWidth="1.5" />
                    <line x1="8" y1="15" x2="14" y2="15" stroke="#C84B31" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="timeline-num">02</div>
                <h3 className="timeline-step-title">ENTRETIEN</h3>
                <p className="timeline-step-body">Un échange vidéo avec notre équipe. Pas un interrogatoire, une conversation. Nous voulons comprendre tes motivations et t&apos;expliquer ce qui t&apos;attend vraiment.</p>
              </div>
              <div className="timeline-step-img reveal-clip">
                <div className="timeline-step-img-inner">
                  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '40px', height: '40px', opacity: 0.4 }}>
                    <rect x="3" y="8" width="24" height="20" stroke="#C84B31" strokeWidth="2" />
                    <polygon points="27,14 37,8 37,28 27,22" stroke="#C84B31" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 -Confirmation (GAUCHE : image à l'extérieur, texte vers la ligne) */}
          <div className="timeline-step reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="timeline-panel">
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/textures/basalt-rock.webp" alt="Roche volcanique" />
                <div className="timeline-step-img-inner"></div>
              </div>
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="16,3 29,8 29,18 16,29 3,18 3,8" stroke="#C84B31" strokeWidth="2" fill="none" />
                    <polyline points="10,16 14,21 22,11" stroke="#C84B31" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <div className="timeline-num">03</div>
                <h3 className="timeline-step-title">CONFIRMATION</h3>
                <p className="timeline-step-body">Sélection confirmée, contrat signé, acompte versé. Ta place est réservée. On commence à te préparer à distance avec le guide pré-camp personnalisé.</p>
              </div>
            </div>
            <div className="timeline-dot-wrap">
              <div className="timeline-dot"></div>
            </div>
            <div className="timeline-empty"></div>
          </div>

          {/* Step 4 -Préparation (DROITE : texte vers la ligne, image à l'extérieur) */}
          <div className="timeline-step timeline-step--reversed reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="timeline-empty"></div>
            <div className="timeline-dot-wrap">
              <div className="timeline-dot"></div>
            </div>
            <div className="timeline-panel">
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="13" width="6" height="6" stroke="#C84B31" strokeWidth="2" />
                    <rect x="24" y="13" width="6" height="6" stroke="#C84B31" strokeWidth="2" />
                    <line x1="8" y1="16" x2="24" y2="16" stroke="#C84B31" strokeWidth="2.5" />
                    <rect x="11" y="11" width="10" height="10" stroke="#C84B31" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="timeline-num">04</div>
                <h3 className="timeline-step-title">PRÉPARATION</h3>
                <p className="timeline-step-body">4 semaines de protocole préparatoire à distance : conditioning spécifique, nutrition, logistique Géorgie. On maximise chaque jour avant ton arrivée.</p>
              </div>
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/action/conditioning-rope.webp" alt="Conditioning -grimper de corde" />
                <div className="timeline-step-img-inner"></div>
              </div>
            </div>
          </div>

          {/* Step 5 -Immersion (GAUCHE : image à l'extérieur, texte vers la ligne) */}
          <div className="timeline-step reveal" style={{ transitionDelay: '0.4s' }}>
            <div className="timeline-panel">
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/environment/mountain-road.webp" alt="Route vers le camp -Caucase" />
                <div className="timeline-step-img-inner"></div>
              </div>
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="2,30 10,10 16,18 22,6 30,30" stroke="#C41E3A" strokeWidth="2" fill="none" />
                    <polygon points="22,6 18,14 26,14" stroke="#C41E3A" strokeWidth="1.5" fill="rgba(196,30,58,0.2)" />
                  </svg>
                </div>
                <div className="timeline-num" style={{ color: 'var(--cta)' }}>05</div>
                <h3 className="timeline-step-title">IMMERSION</h3>
                <p className="timeline-step-body">Trois semaines dans le Caucase géorgien. Entraînements biquotidiens, sparring avec des combattants locaux, vie en communauté. Tu reviens avec un niveau que tu n&apos;aurais jamais atteint autrement.</p>
              </div>
            </div>
            <div className="timeline-dot-wrap">
              <div className="timeline-dot" style={{ background: 'var(--cta)' }}></div>
            </div>
            <div className="timeline-empty"></div>
          </div>

        </div>
      </div>
    </section>
  )
}
