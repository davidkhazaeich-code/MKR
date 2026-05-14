import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <>
      {/* Transition line */}
      <div className="footer-transition" aria-hidden="true">
        <div className="footer-transition-line"></div>
      </div>

      <footer id="footer" aria-label="Pied de page">

        {/* Contact strip */}
        <div className="footer-contact">
          <div className="footer-contact-inner">
            <div className="footer-contact-left">
              <span className="footer-contact-eyebrow">Rejoins le prochain camp</span>
              <h2 className="footer-contact-heading">LE CAUCASE T&apos;ATTEND. POSTULE.</h2>
            </div>
            <div className="footer-contact-right">
              <a href="https://wa.me/33666177691" target="_blank" rel="noopener noreferrer"
                className="footer-contact-link" aria-label="WhatsApp MKR Caucasian Camp">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M2.5 15.5l1.3-3.2a7 7 0 1 1 2.7 2.4L2.5 15.5"/>
                </svg>
                +33 6 66 17 76 91
              </a>
              <a href="mailto:contact@mkrcamp.com" className="footer-contact-link">
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="1.5" y="3.5" width="15" height="11"/>
                  <polyline points="1.5,3.5 9,10 16.5,3.5"/>
                </svg>
                contact@mkrcamp.com
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
              <Image src="/logo-white.webp" alt="MKR Caucasian Camp" className="footer-logo-img" width={320} height={193} />
            </Link>
            <p className="footer-tagline">Camp d&apos;entraînement au Caucase.</p>
            <p className="footer-desc">
              Camps d&apos;entraînement intensifs au cœur du Caucase. Lutte adultes et enfants au Daghestan, MMA en Tchétchénie. Coachs locaux. Immersion totale. Zéro distraction.
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

          {/* Inscriptions */}
          <div>
            <span className="footer-col-label">Nos Camps</span>
            <ul className="footer-nav-list" role="list">
              <li><Link href="/mkr-camp-2026" className="accent">MKR Camp 2026</Link></li>
              <li><Link href="/sur-mesure">Sur Mesure</Link></li>
              <li><Link href="/familles">Famille</Link></li>
              <li><Link href="/clubs-groupes">Club et Groupe</Link></li>
              <li><Link href="/sessions">Tarifs publics</Link></li>
              <li><Link href="/comment-ca-marche">Comment ça marche</Link></li>
            </ul>
          </div>

          {/* Programmes */}
          <div>
            <span className="footer-col-label">Programmes</span>
            <ul className="footer-nav-list" role="list">
              <li><Link href="/programme/mma">MMA</Link></li>
              <li><Link href="/programme/lutte">Lutte adultes</Link></li>
              <li><Link href="/programme/lutte-enfants">Lutte enfants</Link></li>
              <li><Link href="/destinations/dagestan">Daghestan · Lutte</Link></li>
              <li><Link href="/destinations/tchetchenie">Tchétchénie · MMA</Link></li>
              <li><Link href="/le-camp">Le Camp</Link></li>
              <li><Link href="/preparer-son-camp">Préparer son camp</Link></li>
              <li><Link href="/logistique">Logistique et visa</Link></li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <span className="footer-col-label">Informations</span>
            <ul className="footer-nav-list" role="list">
              <li><Link href="/galerie">Galerie</Link></li>
              <li><Link href="/temoignages">Témoignages</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/a-propos">À propos</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom strip */}
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <span className="footer-copy">&copy; 2026 MKR Caucasian Camp · Tous droits réservés · mkrcamp.com · Site conçu par <a href="https://dkdp.ch" target="_blank" rel="noopener noreferrer" className="footer-dkdp">DKDP</a></span>
            <nav className="footer-legal" aria-label="Liens légaux">
              <Link href="/mentions-legales">Mentions légales</Link>
              <span className="footer-legal-dot" aria-hidden="true">·</span>
              <Link href="/cgv">CGV</Link>
              <span className="footer-legal-dot" aria-hidden="true">·</span>
              <Link href="/politique-de-confidentialite">Confidentialité</Link>
            </nav>
          </div>
        </div>

      </footer>
    </>
  )
}
