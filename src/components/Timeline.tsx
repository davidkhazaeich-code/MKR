import Icon from './Icon'

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
                <img className="timeline-step-photo" src="/images/action/solo-readiness.webp" alt="Combattant seul dans la salle du camp" />
                <div className="timeline-step-img-inner"></div>
              </div>
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true" style={{ color: 'var(--primary)' }}>
                  <Icon name="edit" size={32} />
                </div>
                <div className="timeline-num">01</div>
                <h3 className="timeline-step-title">CANDIDATURE</h3>
                <p className="timeline-step-body">Tu remplis le formulaire de candidature en ligne. Niveau actuel, discipline, objectifs. On a besoin de savoir qui tu es avant de te confirmer si le camp est fait pour toi.</p>
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
                <div className="timeline-step-icon" aria-hidden="true" style={{ color: 'var(--primary)' }}>
                  <Icon name="chat" size={32} />
                </div>
                <div className="timeline-num">02</div>
                <h3 className="timeline-step-title">ENTRETIEN</h3>
                <p className="timeline-step-body">Un échange vidéo avec notre équipe. Pas un interrogatoire, une conversation. On veut cerner tes motivations et te raconter ce qui t&apos;attend vraiment sur place.</p>
              </div>
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/action/candidate-interview.webp" alt="Candidat en entretien visio depuis son espace" />
                <div className="timeline-step-img-inner"></div>
              </div>
            </div>
          </div>

          {/* Step 3 -Confirmation (GAUCHE : image à l'extérieur, texte vers la ligne) */}
          <div className="timeline-step reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="timeline-panel">
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/action/hand-wraps.webp" alt="Bandes de mains avant l'entraînement" />
                <div className="timeline-step-img-inner"></div>
              </div>
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true" style={{ color: 'var(--primary)' }}>
                  <Icon name="shield-check" size={32} />
                </div>
                <div className="timeline-num">03</div>
                <h3 className="timeline-step-title">CONFIRMATION</h3>
                <p className="timeline-step-body">Visio validée, package réglé par virement, contrat signé. Ta place est réservée. On lance ta préparation à distance avec le guide pré-camp personnalisé.</p>
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
                <div className="timeline-step-icon" aria-hidden="true" style={{ color: 'var(--primary)' }}>
                  <Icon name="fire" size={32} />
                </div>
                <div className="timeline-num">04</div>
                <h3 className="timeline-step-title">PRÉPARATION</h3>
                <p className="timeline-step-body">Quatre semaines de protocole à distance : préparation physique sur mesure, plan nutrition, démarches visa Russie. On exploite chaque jour avant ton arrivée.</p>
              </div>
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/action/conditioning-rope.webp" alt="Préparation physique, grimper de corde" />
                <div className="timeline-step-img-inner"></div>
              </div>
            </div>
          </div>

          {/* Step 5 -Immersion (GAUCHE : image à l'extérieur, texte vers la ligne) */}
          <div className="timeline-step reveal" style={{ transitionDelay: '0.4s' }}>
            <div className="timeline-panel">
              <div className="timeline-step-img reveal-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="timeline-step-photo" src="/images/environment/mountain-road.webp" alt="Route vers le camp au Caucase" />
                <div className="timeline-step-img-inner"></div>
              </div>
              <div className="timeline-text">
                <div className="timeline-step-icon" aria-hidden="true" style={{ color: 'var(--cta)' }}>
                  <Icon name="mountain" size={32} />
                </div>
                <div className="timeline-num" style={{ color: 'var(--cta)' }}>05</div>
                <h3 className="timeline-step-title">IMMERSION</h3>
                <p className="timeline-step-body">De une à trois semaines au Daghestan. Deux entraînements par jour, sparring avec les combattants locaux, vie en communauté. Tu repars avec un niveau que tu n&apos;aurais jamais atteint ailleurs.</p>
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
