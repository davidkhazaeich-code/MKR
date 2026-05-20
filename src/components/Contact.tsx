import Link from 'next/link'
import Icon from './Icon'

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading">
      <div className="contact-glow" aria-hidden="true" />
      <div className="inner">
        <div className="contact-layout">

          <div className="contact-left reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              CANDIDATURE
            </span>
            <h2 id="contact-heading" className="cand-title">
              PRÊT À<br />FRANCHIR<br />LE CAP ?
            </h2>
            <p className="cand-subtitle">
              Quinze places maximum par session. On retient des athlètes motivés, à tous les niveaux,
              pas seulement des pros. L&apos;entretien vidéo nous sert à cerner tes objectifs.
            </p>
            <Link href="/inscription" className="contact-cta-btn">
              DÉPOSER MA CANDIDATURE
            </Link>
          </div>

          <div className="contact-right reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="contact-info-card">
              <h3 className="contact-info-title">Autres moyens de contact</h3>

              <div className="contact-info-row">
                <Icon name="mail" />
                <div>
                  <span className="contact-info-label">Formulaire</span>
                  <Link href="/contact" className="contact-info-value">
                    Page contact
                  </Link>
                </div>
              </div>

              <div className="contact-info-row">
                <Icon name="whatsapp" />
                <div>
                  <span className="contact-info-label">WhatsApp</span>
                  <a href="https://wa.me/33666177691" target="_blank" rel="noopener noreferrer" className="contact-info-value">
                    +33 6 66 17 76 91
                  </a>
                </div>
              </div>

              <div className="contact-info-row">
                <Icon name="instagram" />
                <div>
                  <span className="contact-info-label">Instagram</span>
                  <a href="https://instagram.com/mkr.caucasiancamp" target="_blank" rel="noopener noreferrer" className="contact-info-value">
                    @mkr.caucasiancamp
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Processus de candidature */}
        <div className="contact-process reveal" style={{ transitionDelay: '0.15s' }}>
          <h3 className="contact-process-title">COMMENT ÇA SE PASSE</h3>
          <div className="contact-process-steps">
            <div className="contact-step">
              <span className="contact-step-num">01</span>
              <h4 className="contact-step-label">Formulaire</h4>
              <p className="contact-step-desc">Tu remplis le formulaire de candidature en ligne. Niveau, objectifs, expérience.</p>
            </div>
            <div className="contact-step">
              <span className="contact-step-num">02</span>
              <h4 className="contact-step-label">Entretien vidéo</h4>
              <p className="contact-step-desc">Un appel de quinze minutes avec notre équipe pour cerner ta motivation et ton niveau.</p>
            </div>
            <div className="contact-step">
              <span className="contact-step-num">03</span>
              <h4 className="contact-step-label">Confirmation</h4>
              <p className="contact-step-desc">Réponse sous 72 h. Si tu es retenu, tu reçois le guide de préparation complet.</p>
            </div>
            <div className="contact-step">
              <span className="contact-step-num">04</span>
              <h4 className="contact-step-label">Départ</h4>
              <p className="contact-step-desc">Transfert aéroport inclus. On vient te chercher à ton arrivée. Tu n&apos;as rien à gérer.</p>
            </div>
          </div>
        </div>

        {/* Badges de reassurance */}
        <div className="contact-badges reveal" style={{ transitionDelay: '0.2s' }}>
          <div className="contact-badge">
            <Icon name="star" />
            <span>Sélection sur dossier</span>
          </div>
          <div className="contact-badge">
            <Icon name="check-circle" />
            <span>15 places max par session</span>
          </div>
          <div className="contact-badge">
            <Icon name="calendar" />
            <span>Réponse sous 72h</span>
          </div>
          <div className="contact-badge">
            <Icon name="shield" />
            <span>Transferts inclus</span>
          </div>
        </div>

      </div>
    </section>
  )
}
