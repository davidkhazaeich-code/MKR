import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Destinations | MKR Caucasian Camp | Dagestan & Tchetchenie',
  description: "Deux destinations au coeur du Caucase : Dagestan et Tchetchenie. Decouvre les lieux d'entrainement, la culture, la logistique.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/destinations' },
}

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        label="DESTINATIONS"
        title="LE CAUCASE T'ATTEND"
        subtitle="Deux terres de combat. Un heritage commun."
      />

      <section className="dest-hub">
        <div className="inner">
          <div className="dest-hub-grid">
            <a href="/destinations/dagestan" className="dest-hub-card reveal">
              <img
                src="/images/environment/dagestan-panorama.webp"
                alt="Montagnes du Dagestan"
                width={1200}
                height={600}
                className="dest-hub-bg-img"
                aria-hidden="true"
              />
              <div className="dest-hub-overlay" aria-hidden="true" />
              <div className="dest-hub-content">
                <span className="dest-hub-region">Caucase · Russie</span>
                <h2>DAGESTAN</h2>
                <p>La terre qui a forge les meilleurs combattants de la planete. Khabib, Makhachev, et des centaines de champions olympiques.</p>
                <span className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                  EXPLORER LE DAGESTAN
                </span>
              </div>
            </a>
            <a href="/destinations/tchetchenie" className="dest-hub-card reveal" style={{ transitionDelay: '0.12s' }}>
              <img
                src="/images/environment/grozny-city.webp"
                alt="Vue de Grozny, Tchetchenie"
                width={1200}
                height={600}
                className="dest-hub-bg-img"
                aria-hidden="true"
              />
              <div className="dest-hub-overlay" aria-hidden="true" />
              <div className="dest-hub-content">
                <span className="dest-hub-region">Caucase · Russie</span>
                <h2>TCHETCHENIE</h2>
                <p>Grozny, le renouveau. Culture guerriere millenaire et salles de MMA parmi les mieux equipees du Caucase.</p>
                <span className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                  EXPLORER LA TCHETCHENIE
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
