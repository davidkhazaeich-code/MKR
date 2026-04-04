import Link from 'next/link'

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
              PRÊT À<br />POSTULER ?
            </h2>
            <p className="cand-subtitle">
              Les places sont limitées à 15 athlètes par session.
              Chaque candidature est étudiée individuellement.
              L&apos;entretien vidéo est obligatoire.
            </p>
            <Link href="/inscription" className="contact-cta-btn">
              DÉPOSER MA CANDIDATURE
            </Link>
          </div>

          <div className="contact-right reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="contact-info-card">
              <h3 className="contact-info-title">Autres moyens de contact</h3>

              <div className="contact-info-row">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <polyline points="2,4 12,13 22,4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <div>
                  <span className="contact-info-label">Email</span>
                  <a href="mailto:contact@mkrcaucasiancamp.com" className="contact-info-value">
                    contact@mkrcaucasiancamp.com
                  </a>
                </div>
              </div>

              <div className="contact-info-row">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.73-1.25a2 2 0 0 1 2.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <div>
                  <span className="contact-info-label">WhatsApp</span>
                  <a href="https://wa.me/41000000000" target="_blank" rel="noopener noreferrer" className="contact-info-value">
                    +41 XX XXX XX XX
                  </a>
                </div>
              </div>

              <div className="contact-info-row">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="18" cy="6" r="1.5" fill="currentColor" />
                </svg>
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
      </div>
    </section>
  )
}
