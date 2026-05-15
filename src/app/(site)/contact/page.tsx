import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import ContactForm from '@/components/ContactForm'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata = buildMetadata({
  title: 'Contact | MKR Caucasian Camp',
  description: "Contacte MKR Caucasian Camp. Question générale, partenariat, clubs, presse. Réponse sous 48h.",
  path: '/contact',
})
export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Contact', url: 'https://mkrcamp.com/contact' },
      ]} />
      <PageHero
        label="CONTACT"
        title="PARLE-NOUS"
        compact
      />

      <section className="contact-page-section fx-grid fx-glow fx-glow-breathe fx-stack-1">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="layout-split layout-split--balanced">
            <div className="reveal">
              <ContactForm />
            </div>

            <div className="reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="grid-3" style={{ gridTemplateColumns: '1fr' }}>
                <div className="content-card fx-grain fx-corner-glow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" width="24" height="24" style={{ marginBottom: '0.8rem' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="15" y2="17" />
                  </svg>
                  <h3 className="card-title" style={{ fontSize: '0.9rem' }}>Formulaire</h3>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Utilise le formulaire ci-contre. Réponse sous 48h.
                  </span>
                </div>
                <div className="content-card fx-grain fx-corner-glow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" width="24" height="24" style={{ marginBottom: '0.8rem' }}>
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  </svg>
                  <h3 className="card-title" style={{ fontSize: '0.9rem' }}>WhatsApp</h3>
                  <a href="https://wa.me/33666177691" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    +33 6 66 17 76 91
                  </a>
                </div>
                <div className="content-card fx-grain fx-corner-glow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" width="24" height="24" style={{ marginBottom: '0.8rem' }}>
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4.5" /><circle cx="17.5" cy="6.5" r="1" fill="var(--primary)" stroke="none" />
                  </svg>
                  <h3 className="card-title" style={{ fontSize: '0.9rem' }}>Instagram</h3>
                  <a href="https://instagram.com/mkr.caucasiancamp" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    @mkr.caucasiancamp
                  </a>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
                On répond sous 48h. Fuseau horaire : GMT+3 (Caucase).
              </p>
              <figure className="photo-card" style={{ marginTop: '1.5rem' }}>
                <img
                  src="/images/environment/mountain-road.webp"
                  alt="Route de montagne vers le camp au Caucase"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
