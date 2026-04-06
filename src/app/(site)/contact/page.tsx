import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import ContactForm from '@/components/ContactForm'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Contact | MKR Caucasian Camp',
  description: "Contacte MKR Caucasian Camp. Question generale, partenariat, clubs, presse. Reponse sous 48h.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/contact' },
}

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Contact', url: 'https://mkrcaucasiancamp.com/contact' },
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
                    <rect x="2" y="4" width="20" height="16" /><polyline points="2,4 12,13 22,4" />
                  </svg>
                  <h3 className="card-title" style={{ fontSize: '0.9rem' }}>Email</h3>
                  <a href="mailto:contact@mkrcaucasiancamp.com" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    contact@mkrcaucasiancamp.com
                  </a>
                </div>
                <div className="content-card fx-grain fx-corner-glow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" width="24" height="24" style={{ marginBottom: '0.8rem' }}>
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  </svg>
                  <h3 className="card-title" style={{ fontSize: '0.9rem' }}>WhatsApp</h3>
                  <a href="https://wa.me/41XXXXXXXXX" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Envoyer un message
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
                On repond sous 48h. Fuseau horaire : GMT+3 (Caucase).
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
