import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata = buildMetadata({
  title: 'Destinations Daghestan et Tchétchénie | MKR Caucasian Camp',
  description: "Deux destinations, deux disciplines : Lutte adultes et enfants au Daghestan, MMA en Tchétchénie. Combo possible uniquement en sur-mesure.",
  path: '/destinations',
})
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

      {/* Comparatif Daghestan vs Tchétchénie */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              COMMENT CHOISIR
            </span>
            <h2>DAGHESTAN OU TCHÉTCHÉNIE ?</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.6rem', maxWidth: '720px' }}>
              Ta destination dépend de la discipline choisie à l&apos;inscription. Voici les différences concrètes entre les deux camps.
            </p>
          </div>
          <div className="reveal" style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
            <table className="table-tonal" style={{ minWidth: '640px', width: '100%' }}>
              <thead>
                <tr>
                  <th></th>
                  <th>Daghestan</th>
                  <th>Tchétchénie</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Discipline</strong></td>
                  <td>Lutte adultes · Lutte enfants 8-17 ans</td>
                  <td>MMA adultes (niveau Avancé minimum)</td>
                </tr>
                <tr>
                  <td><strong>Capitale du camp</strong></td>
                  <td>Makhachkala · Kaspiysk</td>
                  <td>Grozny</td>
                </tr>
                <tr>
                  <td><strong>Aéroport</strong></td>
                  <td>Makhachkala (MCX) · vol intérieur Istanbul → MCX inclus</td>
                  <td>Grozny (GRV) · vol intérieur Istanbul → GRV inclus</td>
                </tr>
                <tr>
                  <td><strong>Transfert vers le camp</strong></td>
                  <td>1h30 environ depuis MCX, inclus</td>
                  <td>30 min environ depuis GRV, inclus</td>
                </tr>
                <tr>
                  <td><strong>Signature</strong></td>
                  <td>Berceau de la lutte libre. Khabib Nurmagomedov, Islam Makhachev, plus de 30 champions olympiques de lutte.</td>
                  <td>Épicentre du MMA moderne. Akhmat Fight Club, héritage de Khamzat Chimaev, sparring très haut niveau.</td>
                </tr>
                <tr>
                  <td><strong>Ambiance</strong></td>
                  <td>Tradition montagnarde, villages de lutteurs, transmission père-fils, esprit fondateur.</td>
                  <td>MMA moderne, écuries pro, ambiance urbaine forte, architecture spectaculaire (mosquée Akhmad Kadyrov).</td>
                </tr>
                <tr>
                  <td><strong>Pour qui</strong></td>
                  <td>Tout niveau adulte (Pro / Inter / Amateur sérieux) · enfants 8-17 ans avec parent participant.</td>
                  <td>Niveau Avancé minimum exigé (form bloquant). Compétiteurs régionaux à internationaux.</td>
                </tr>
                <tr>
                  <td><strong>Combo Lutte + MMA</strong></td>
                  <td colSpan={2} style={{ textAlign: 'center' }}>Possible uniquement sur les inscriptions Sur Mesure (séquentiel : X jours Daghestan + Y jours Tchétchénie).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel="POSTULER AU CAMP"
        ghostHref="/programme"
        ghostLabel="VOIR LES DISCIPLINES"
      />
    </>
  )
}
