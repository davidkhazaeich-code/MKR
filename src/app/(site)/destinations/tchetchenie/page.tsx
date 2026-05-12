import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import DestinationReveal from '@/components/DestinationReveal'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'Tchétchénie : Camp MMA au cœur du Caucase | MKR Caucasian Camp',
  description: "Tout savoir sur la Tchétchénie : salles MMA de Grozny, sécurité, culture, logistique. La terre qui a vu naître Khamzat Chimaev et la nouvelle génération du MMA mondial.",
  alternates: { canonical: 'https://mkrcamp.com/destinations/tchetchenie' },
}

export default function TchetcheniePage() {
  return (
    <>
      <PageHero
        label="TCHÉTCHÉNIE"
        title="LA TERRE QUI FORGE<br/>LA NOUVELLE GÉNÉRATION DU MMA"
        subtitle="Akhmat Fight Club, Khamzat Chimaev, et un écosystème MMA parmi les plus durs au monde."
        breadcrumb={[
          { href: '/destinations', label: 'Destinations' },
          { href: '/destinations/tchetchenie', label: 'Tchétchénie' },
        ]}
      />

      <DestinationReveal
        image="/images/environment/mosque-grozny.webp"
        alt="Mosquée Akhmad Kadyrov et tours de Grozny City au crépuscule, Tchétchénie"
        label="CAUCASE · RUSSIE"
        title="LE PAYS<br/>VAÏNAKH"
        facts={[
          { label: 'Capitale', value: 'Grozny' },
          { label: 'Altitude moyenne', value: '600 m' },
          { label: 'Champions MMA top mondial', value: '15+' },
          { label: 'Champion UFC top 5', value: '1' },
          { label: 'Salles MMA professionnelles', value: '30+' },
          { label: 'Population', value: '1.5 millions' },
        ]}
        badges={['TERRE DU MMA MODERNE', 'AKHMAT FIGHT CLUB', 'KHAMZAT CHIMAEV']}
      />

      {/* Presentation */}
      <section className="logi-section fx-grid fx-stack-1">
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PRÉSENTATION</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>LA TCHÉTCHÉNIE</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                République du Caucase russe à l&apos;ouest du Daghestan, la Tchétchénie est l&apos;épicentre du MMA moderne.
                En quinze ans, Grozny est devenue un point de passage obligé pour les combattants mondiaux : structures
                d&apos;État, écuries privées et sparring de très haut niveau.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                L&apos;Akhmat Fight Club rassemble une concentration unique de combattants pro. C&apos;est dans cet écosystème
                que MKR ouvre l&apos;accès pour ses camps MMA, avec un encadrement francophone et des partenariats locaux.
              </p>
            </div>
            <div className="content-card">
              <h3 className="card-title">CHIFFRES CLÉS</h3>
              <div className="dag-stat"><span>Surface</span><strong>17 300 km²</strong></div>
              <div className="dag-stat"><span>Population</span><strong>1.5 millions</strong></div>
              <div className="dag-stat"><span>Altitude moyenne</span><strong>600 m</strong></div>
              <div className="dag-stat"><span>Combattants top mondial</span><strong>15+</strong></div>
              <div className="dag-stat"><span>Salles MMA pro</span><strong>30+</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section sécurité */}
      <section className="dag-security fx-texture-concrete fx-glow fx-glow-breathe fx-mask-b fx-stack-2">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>SÉCURITÉ</span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
              LA QUESTION QUE TOUT LE MONDE POSE
            </h2>
          </div>
          <div className="layout-split reveal" style={{ marginTop: '2rem' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Pas de formule creuse. La réalité du terrain en 2026 :
                Grozny est aujourd&apos;hui l&apos;une des villes les plus sûres du Caucase en termes de criminalité urbaine.
                Police visible, vie nocturne quasi inexistante, hospitalité forte envers les sportifs étrangers.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le Quai d&apos;Orsay maintient une vigilance régionale. MKR opère uniquement dans les zones urbaines
                et les salles partenaires accréditées. Chaque participant reçoit un briefing détaillé.
              </p>
              <p className="pull-quote">
                &laquo; Le respect pour les combattants est total. Sur le tapis, on ne te fait aucun cadeau. &raquo;
              </p>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Mehdi R. · MMA Pro · Marseille</span>
            </div>
            <div>
              <div className="content-card">
                <h3 className="card-title">PROTOCOLE MKR</h3>
                <ul className="logi-check-list">
                  <li>Contact d&apos;urgence 24/7 sur place</li>
                  <li>Équipe francophone permanente</li>
                  <li>Assurance rapatriement obligatoire</li>
                  <li>Briefing sécurité avant départ</li>
                  <li>Suivi Quai d&apos;Orsay en continu</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lieux d'entraînement */}
      <section className="logi-section fx-grid fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>SALLES</span>
            <h2>LIEUX D&apos;ENTRAÎNEMENT</h2>
          </div>
          <div className="grid-2">
            <figure className="photo-card reveal">
              <img
                src="/images/environment/gym-interior.webp"
                alt="Salle MMA partenaire de MKR à Grozny, Tchétchénie"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Salle principale, Grozny. Cage MMA, tapis, équipement de frappe complet.</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: '0.1s' }}>
              <img
                src="/images/action/sparring-mma-wall.webp"
                alt="Sparring MMA dans une salle partenaire à Grozny"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Salle secondaire. Sparring quotidien avec les combattants de l&apos;écurie locale.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Culture & excursions */}
      <section className="logi-section fx-texture-basalt fx-mask-c fx-stack-4 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>CULTURE</span>
            <h2>EXCURSIONS ET DÉCOUVERTE</h2>
          </div>
          <div className="grid-3">
            {[
              { title: 'Mosquée Akhmad Kadyrov', desc: "L'une des plus grandes mosquées d'Europe, au cœur de Grozny. Architecture spectaculaire.", img: '/images/environment/mosque-grozny.webp' },
              { title: 'Tours vaïnakh d\'Itoum-Kalé', desc: "Tours médiévales de pierre dressées dans les vallées montagneuses. Patrimoine vaïnakh millénaire.", img: '/images/environment/vainakh-towers.webp' },
              { title: 'Lac Kezenoy-Am', desc: "Plus grand lac de haute altitude du Caucase Nord, à cheval entre Tchétchénie et Daghestan.", img: '/images/environment/lake-kezenoy.webp' },
            ].map((exc, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <img
                  src={exc.img}
                  alt={exc.title}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
                <h3 className="card-title">{exc.title}</h3>
                <p className="card-body">{exc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/environment/vainakh-towers.webp"
        alt="Tours vaïnakh dans les montagnes de Tchétchénie"
        label="TCHÉTCHÉNIE"
        title="L'HÉRITAGE VAÏNAKH"
        tagline="Une terre de guerriers, de pierre et d'honneur. Chaque entraînement s'inscrit dans cet héritage."
      />

      {/* Logistique resume */}
      <section className="logi-section fx-grid fx-stack-5">
        <div className="inner">
          <div className="group-card reveal">
            <h2>LOGISTIQUE TCHÉTCHÉNIE</h2>
            <p>Aéroport : Grozny (GRV). Vol intérieur depuis Istanbul inclus dans le package. Transfert MKR depuis l&apos;aéroport inclus. Hébergement en logement de camp à Grozny.</p>
            <Link href="/logistique" className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
              DÉTAIL COMPLET
            </Link>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel="POSTULER · CAMP MMA TCHÉTCHÉNIE"
        ghostHref="/destinations/dagestan"
        ghostLabel="VOIR LE DAGHESTAN · LUTTE"
      />
    </>
  )
}
