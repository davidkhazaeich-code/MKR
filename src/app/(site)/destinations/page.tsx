import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Destinations Daghestan et Tchétchénie | MKR Caucasian Camp',
  description: "Deux destinations, deux disciplines : Lutte adultes et enfants au Daghestan, MMA en Tchétchénie. Combo possible uniquement en sur-mesure.",
  alternates: { canonical: 'https://mkrcamp.com/destinations' },
}

const DESTINATIONS = [
  {
    href: '/destinations/dagestan',
    region: 'Caucase · Russie · Lutte',
    name: 'DAGHESTAN',
    tagline: "Berceau de la lutte libre mondiale. Khabib, Makhachev, des centaines de champions olympiques.",
    discipline: 'Lutte adultes et Lutte enfants',
    img: '/images/environment/dagestan-panorama.webp',
    cta: 'EXPLORER LE DAGHESTAN',
  },
  {
    href: '/destinations/tchetchenie',
    region: 'Caucase · Russie · MMA',
    name: 'TCHÉTCHÉNIE',
    tagline: "Épicentre du MMA moderne. Akhmat Fight Club, Khamzat Chimaev, la nouvelle génération du combat.",
    discipline: 'MMA adultes',
    img: '/images/environment/mosque-grozny.webp',
    cta: 'EXPLORER LA TCHÉTCHÉNIE',
  },
]

export default function DestinationsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Destinations', url: 'https://mkrcamp.com/destinations' },
      ]} />
      <PageHero
        label="DESTINATIONS"
        title="DEUX TERRES DU CAUCASE.<br/>UNE DISCIPLINE PAR CAMP."
        subtitle="Lutte au Daghestan. MMA en Tchétchénie. Le combo Daghestan + Tchétchénie n'est possible qu'en sur-mesure."
      />

      <section className="dest-hub fx-grid fx-glow">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="dest-hub-grid">
            {DESTINATIONS.map((d, i) => (
              <Link href={d.href} key={d.name} className="dest-hub-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <img
                  src={d.img}
                  alt={`Paysage ${d.name === 'DAGHESTAN' ? 'du Daghestan' : 'de Tchétchénie'}`}
                  width={1200}
                  height={600}
                  className="dest-hub-bg-img"
                  aria-hidden="true"
                />
                <div className="dest-hub-overlay" aria-hidden="true" />
                <div className="dest-hub-content">
                  <span className="dest-hub-region">{d.region}</span>
                  <h2>{d.name}</h2>
                  <p>{d.tagline}</p>
                  <p style={{ marginTop: '0.4rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Camp {d.discipline}
                  </p>
                  <span className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                    {d.cta}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="reveal" style={{ maxWidth: '760px', margin: '2.5rem auto 0', textAlign: 'center', padding: '1.5rem 1.75rem', border: '1px solid var(--surface-lowest)', background: 'rgba(200,75,49,0.06)' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>SUR MESURE UNIQUEMENT</span>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Tu veux combiner Lutte au Daghestan et MMA en Tchétchénie ? Une partie du camp dans chaque destination,
              c&apos;est possible uniquement sur les inscriptions Sur Mesure. Parle-nous de ton projet.
            </p>
            <Link href="/sur-mesure" className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.85rem', padding: '0.55rem 1.4rem' }}>
              DÉCOUVRIR LE SUR MESURE
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
