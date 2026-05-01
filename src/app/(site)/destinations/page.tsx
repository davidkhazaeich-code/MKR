import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Destinations | MKR Caucasian Camp | Dagestan',
  description: "Notre destination unique : le Dagestan, terre des champions du Caucase. Decouvre les lieux d'entrainement, la culture, la logistique.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/destinations' },
}

export default function DestinationsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Destinations', url: 'https://mkrcaucasiancamp.com/destinations' },
      ]} />
      <PageHero
        label="DESTINATION"
        title="LE DAGHESTAN T'ATTEND"
        subtitle="La terre qui forge les meilleurs combattants de la planete."
      />

      <section className="dest-hub fx-grid fx-glow">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="dest-hub-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '900px', margin: '0 auto' }}>
            <Link href="/destinations/dagestan" className="dest-hub-card reveal">
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
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
