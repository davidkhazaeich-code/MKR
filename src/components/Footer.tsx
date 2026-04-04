import Link from 'next/link'

export default function Footer() {
  return (
    <>
      {/* Mountain divider */}
      <div className="footer-mtn" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <polygon fill="#0E0E0E" points="
            0,80 0,54 44,42 108,56 178,34 248,50 312,22 368,40
            418,12 464,30 508,6 540,24 568,2 592,18 618,0 644,16
            670,2 696,18 724,4 752,22 784,6 820,28 862,10 908,34
            958,16 1014,40 1072,22 1132,46 1192,30 1254,52 1318,36
            1382,58 1440,44 1440,80
          "/>
        </svg>
      </div>

      <footer id="footer" aria-label="Pied de page">

        {/* Contact strip */}
        <div className="footer-contact">
          <div className="footer-contact-inner">
            <div className="footer-contact-left">
              <span className="footer-contact-eyebrow">Rejoins le prochain camp</span>
              <h2 className="footer-contact-heading">FORGE DANS LE CAUCASE.</h2>
            </div>
            <div className="footer-contact-right">
              <a href="mailto:contact@mkrcaucasiancamp.com" className="footer-contact-link">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="1.5" y="3.5" width="15" height="11"/>
                  <polyline points="1.5,3.5 9,10 16.5,3.5"/>
                </svg>
                contact@mkrcaucasiancamp.com
              </a>
              <a href="https://instagram.com/mkr.caucasiancamp" target="_blank" rel="noopener noreferrer"
                className="footer-contact-link" aria-label="Instagram MKR Caucasian Camp">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="15" height="15" rx="4"/>
                  <circle cx="9" cy="9" r="3.2"/>
                  <circle cx="13.2" cy="4.8" r="0.7" fill="currentColor" stroke="none"/>
                </svg>
                @mkr.caucasiancamp
              </a>
              <Link href="/inscription" className="footer-contact-cta">POSTULER</Link>
            </div>
          </div>
        </div>

        {/* Main columns */}
        <div className="footer-cols">

          {/* Brand */}
          <div>
            <Link href="/" className="footer-logo-link" aria-label="MKR Caucasian Camp · Accueil">
              <span className="footer-logo-mkr">MKR</span>
              <span className="footer-logo-sub">Caucasian Camp</span>
            </Link>
            <p className="footer-tagline">Forge dans le Caucase.</p>
            <p className="footer-desc">
              Camps d&apos;entrainement intensifs de MMA et de lutte au coeur du Dagestan et de la Tchetchenie. Coaches locaux. Immersion totale. Zero distraction.
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com/mkr.caucasiancamp" target="_blank" rel="noopener noreferrer"
                className="footer-social-link" aria-label="MKR sur Instagram">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="15" height="15" rx="4"/>
                  <circle cx="9" cy="9" r="3.2"/>
                  <circle cx="13.2" cy="4.8" r="0.7" fill="currentColor" stroke="none"/>
                </svg>
                Instagram
              </a>
              <a href="https://facebook.com/mkrcaucasiancamp" target="_blank" rel="noopener noreferrer"
                className="footer-social-link" aria-label="MKR sur Facebook">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M15 1.5H12a5 5 0 0 0-5 5v3H4.5v4H7v6h4v-6h3l1-4h-4V6.5a1 1 0 0 1 1-1H15z"/>
                </svg>
                Facebook
              </a>
              <a href="https://youtube.com/@mkrcaucasiancamp" target="_blank" rel="noopener noreferrer"
                className="footer-social-link" aria-label="MKR sur YouTube">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="1" y="3.5" width="16" height="11" rx="3"/>
                  <polygon points="7.5,7 12.5,9 7.5,11" fill="currentColor" stroke="none"/>
                </svg>
                YouTube
              </a>
            </div>
          </div>

          {/* Le Camp */}
          <div>
            <span className="footer-col-label">Le Camp</span>
            <ul className="footer-nav-list" role="list">
              <li><Link href="/le-camp">Le Camp</Link></li>
              <li><Link href="/comment-ca-marche">Comment ca marche</Link></li>
              <li><Link href="/preparer-son-camp">Preparer son camp</Link></li>
              <li><Link href="/logistique">Logistique et visa</Link></li>
              <li><Link href="/sessions" className="accent">Sessions 2026</Link></li>
            </ul>
          </div>

          {/* Disciplines */}
          <div>
            <span className="footer-col-label">Disciplines</span>
            <ul className="footer-nav-list" role="list">
              <li><Link href="/programme/mma">MMA</Link></li>
              <li><Link href="/programme/lutte">Lutte</Link></li>
              <li><Link href="/coachs">Nos coachs</Link></li>
              <li><Link href="/destinations/dagestan">Dagestan</Link></li>
              <li><Link href="/destinations/tchetchenie">Tchetchenie</Link></li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <span className="footer-col-label">Informations</span>
            <ul className="footer-nav-list" role="list">
              <li><Link href="/galerie">Galerie</Link></li>
              <li><Link href="/temoignages">Temoignages</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/a-propos">A propos</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom strip */}
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <span className="footer-copy">&copy; 2026 MKR Caucasian Camp · Tous droits reserves · mkrcaucasiancamp.com · Site concu par <a href="https://dkdp.ch" target="_blank" rel="noopener noreferrer" className="footer-dkdp">DKDP</a></span>
            <nav className="footer-legal" aria-label="Liens legaux">
              <Link href="/mentions-legales">Mentions legales</Link>
              <span className="footer-legal-dot" aria-hidden="true">·</span>
              <Link href="/cgv">CGV</Link>
              <span className="footer-legal-dot" aria-hidden="true">·</span>
              <Link href="/politique-de-confidentialite">Confidentialite</Link>
            </nav>
          </div>
        </div>

      </footer>
    </>
  )
}
