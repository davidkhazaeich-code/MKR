export default function Footer() {
  return (
    <footer id="footer" aria-label="Pied de page">
      <div className="inner">
        <div className="footer-inner">
          <a href="/" className="footer-logo-mkr" aria-label="MKR Caucasian Camp · Accueil">
            MKR
          </a>

          <ul className="footer-nav" role="list">
            <li><a href="#video-section">Camp</a></li>
            <li><a href="#coaches">Coaches</a></li>
            <li><a href="#sessions">Sessions</a></li>
            <li><a href="#timeline">Processus</a></li>
            <li><a href="mailto:contact@mkrcaucasiancamp.com">Contact</a></li>
          </ul>

          <div className="footer-social">
            <a
              href="https://instagram.com/mkrcaucasiancamp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MKR Caucasian Camp sur Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </a>
            <a
              href="https://facebook.com/mkrcaucasiancamp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MKR Caucasian Camp sur Facebook"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              Facebook
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">&copy; 2026 MKR Caucasian Camp · Tous droits réservés</span>
          <span className="footer-copy" style={{ opacity: 0.5 }}>Géorgie · Caucase · mkrcaucasiancamp.com</span>
        </div>
      </div>
    </footer>
  )
}
