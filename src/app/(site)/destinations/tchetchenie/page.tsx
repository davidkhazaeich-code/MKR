import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import DestinationReveal from '@/components/DestinationReveal'

export const metadata: Metadata = {
  title: 'Tchetchenie | MKR Caucasian Camp | Camps MMA a Grozny',
  description: "Grozny, Tchetchenie : decouvre les salles d'entrainement, la culture tchetchene, la logistique. Camp MMA au coeur du Caucase.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/destinations/tchetchenie' },
}

export default function TchetcheniePage() {
  return (
    <>
      <PageHero
        label="TCHETCHENIE"
        title="GROZNY, LE RENOUVEAU"
        subtitle="Culture guerriere millenaire et salles de MMA parmi les mieux equipees du Caucase."
        breadcrumb={[
          { href: '/destinations', label: 'Destinations' },
          { href: '/destinations/tchetchenie', label: 'Tchetchenie' },
        ]}
      />

      <DestinationReveal
        image="/images/environment/grozny-city.webp"
        alt="Vue de Grozny, capitale de la Tchetchenie"
        label="CAUCASE · RUSSIE"
        title="GROZNY,<br/>LE RENOUVEAU"
        facts={[
          { label: 'Capitale', value: 'Grozny' },
          { label: 'Altitude', value: '170 m' },
          { label: 'Salles de combat', value: '50+' },
          { label: 'Population', value: '1.5 million' },
          { label: 'Sport national', value: 'MMA / Lutte' },
          { label: 'Reconstruction', value: 'Ville moderne' },
        ]}
        badges={['INFRASTRUCTURES NEUVES', 'TRADITION GUERRIERE', 'CULTURE MILLENAIRE']}
      />

      {/* Presentation */}
      <section className="logi-section">
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PRESENTATION</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>LA TCHETCHENIE</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                La Tchetchenie a connu une reconstruction spectaculaire. Grozny, la capitale, est aujourd&apos;hui
                une ville moderne dotee d&apos;infrastructures sportives de pointe. Le MMA y est un sport national
                et les salles de combat sont parmi les mieux equipees de la region.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                La tradition de lutte tchetchene est ancree dans la culture locale. Les methodes d&apos;entrainement
                combinent discipline militaire et heritage martial ancestral.
              </p>
            </div>
            <div className="content-card">
              <h3 className="card-title">CHIFFRES CLES</h3>
              <div className="dag-stat"><span>Capitale</span><strong>Grozny</strong></div>
              <div className="dag-stat"><span>Population</span><strong>1.5 million</strong></div>
              <div className="dag-stat"><span>Altitude</span><strong>170 m (Grozny)</strong></div>
              <div className="dag-stat"><span>Salles de combat</span><strong>50+</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* Securite */}
      <section className="dag-security">
        <div className="inner">
          <div className="reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>SECURITE</span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
              SECURITE EN TCHETCHENIE
            </h2>
          </div>
          <div className="reveal" style={{ maxWidth: '700px', marginTop: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Grozny est une ville reconstruite, securisee et moderne. Les zones d&apos;entrainement MKR sont
              situees dans le centre urbain, dans des complexes sportifs officiels. L&apos;equipe MKR est presente
              en permanence et le meme protocole de securite qu&apos;au Dagestan s&apos;applique.
            </p>
            <div className="content-card" style={{ marginTop: '1.5rem' }}>
              <h3 className="card-title">PROTOCOLE MKR</h3>
              <ul className="logi-check-list">
                <li>Accompagnement permanent equipe MKR</li>
                <li>Hebergement securise en centre-ville</li>
                <li>Contact d&apos;urgence 24/7</li>
                <li>Assurance rapatriement obligatoire</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Salles */}
      <section className="logi-section">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>SALLES</span>
            <h2>LIEUX D&apos;ENTRAINEMENT</h2>
          </div>
          <div className="grid-2">
            <figure className="photo-card reveal">
              <img
                src="/images/environment/gym-interior.webp"
                alt="Complexe sportif central a Grozny, Tchetchenie"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Complexe sportif central, Grozny. Equipement de niveau international.</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: '0.1s' }}>
              <img
                src="/images/action/boxing-pads.webp"
                alt="Salle MMA a Grozny, cage et equipement de frappe"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Salle MMA, Grozny. Cage octogonale, sacs lourds, espace frappe.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="logi-section logi-alt">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>CULTURE</span>
            <h2>DECOUVERTE</h2>
          </div>
          <div className="grid-3">
            {[
              { title: 'Mosquee Akhmad Kadyrov', desc: "L'une des plus grandes mosquees d'Europe. Architecture spectaculaire au coeur de Grozny.", img: '/images/environment/mosque-grozny.webp' },
              { title: 'Lac Kezenoy-Am', desc: "Le plus grand lac de montagne du Caucase Nord. Cadre exceptionnel pour la recuperation.", img: '/images/environment/lake-kezenoy.webp' },
              { title: 'Tour Vainakh', desc: "Tours medievales de defense perchees dans les montagnes. Temoignage de l'histoire guerriere.", img: '/images/environment/vainakh-towers.webp' },
            ].map((exc, i) => (
              <div key={i} className="content-card reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
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

      {/* Atmospheric banner */}
      <section className="cinematic-banner">
        <div className="inner">
          <img
            src="/images/action/shadowboxing-group.webp"
            alt="Groupe d'athletes en shadowboxing"
            width={1200}
            height={514}
            loading="lazy"
            className="section-photo-img"
          />
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VOIR LES SESSIONS"
        ghostHref="/destinations/dagestan"
        ghostLabel="VOIR AUSSI : DAGESTAN"
      />
    </>
  )
}
