import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'Préparer son camp MMA au Daghestan : guide 6 semaines | MKR',
  description: "Tout ce qu'il faut savoir pour arriver prêt au camp MKR. Niveau minimum, programme de préparation 6 semaines, équipement, préparation mentale.",
  alternates: { canonical: 'https://mkrcamp.com/preparer-son-camp' },
}

const WEEKS = [
  { week: 'Semaine 1', focus: 'Cardio', desc: 'Base aérobique. Course 30 à 45 min, natation, vélo. Test de Cooper initial.' },
  { week: 'Semaine 2', focus: 'Force', desc: 'Squats, tractions, pompes, deadlifts. Circuits fonctionnels.' },
  { week: 'Semaine 3', focus: 'Mobilité', desc: 'Yoga, stretching dynamique, travail de hanches et épaules.' },
  { week: 'Semaine 4', focus: 'Endurance spécifique', desc: 'Sparring simulé, rounds de 5 min, HIIT combat.' },
  { week: 'Semaine 5', focus: 'Intensité', desc: 'Combinaison force-cardio. Circuits de 45 min. Sparring réel.' },
  { week: 'Semaine 6', focus: 'Affûtage', desc: 'Volume réduit, intensité maintenue. Repos actif. Préparation mentale.' },
]

const EQUIPMENT = {
  'Vêtements et Protection': [
    'Gants de boxe 16 oz',
    'Protège-tibias',
    'Protège-dents (moulé)',
    'Coquille',
    'Rash guard (x3 minimum)',
    'Short de combat (x3)',
    'Chaussures de lutte (optionnel)',
  ],
  'Hygiène et Admin': [
    'Passeport (valide 6+ mois)',
    'Copie confirmation MKR',
    'Attestation assurance',
    'Anti-moustique',
    'Cadenas valise',
  ],
}

export default function PreparerSonCampPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Préparer son camp', url: 'https://mkrcamp.com/preparer-son-camp' },
      ]} />
      <PageHero
        label="PRÉPARATION"
        title="ARRIVE PRÊT.<br/>REPARS TRANSFORMÉ."
        subtitle="Le camp commence 6 semaines avant ton départ."
      />

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/action/conditioning-rope.webp"
        alt="Athlète grimpant à la corde dans une salle du Caucase"
        label="PRÉPARATION"
        title="LE TRAVAIL COMMENCE AVANT LE DÉPART"
        tagline="Conditioning, endurance, mental. Arrive prêt, progresse plus vite."
      />

      {/* Niveau minimum */}
      <section className="logi-section fx-grid fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="layout-split layout-split--balanced">
            <div className="reveal">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PRÉREQUIS</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>NIVEAU MINIMUM</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le niveau exigé dépend de la discipline. <strong>Camp Lutte au Daghestan : ouvert à tous les
                niveaux</strong>, y compris débutants motivés. Tu progresses dans un cadre adapté à ton point
                de départ. <strong>Camp MMA en Tchétchénie : niveau Avancé minimum</strong> (plus de 5 ans de
                pratique régulière) ou Compétiteur, car les sparring partners locaux sont des combattants pros.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Dans les deux cas le camp est intense. Si tu arrives sans préparation physique, tu ne tiendras
                pas la première semaine. On te fournit donc un programme de préparation de 6 semaines.
              </p>
            </div>
            <div className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: '0.1s' }}>
              <h3 className="card-title">CHECKLIST AVANT DÉPART</h3>
              <ul className="logi-check-list">
                <li>Courir 5 km sans s&apos;arrêter</li>
                <li>Enchaîner 50 squats corps libre</li>
                <li>Tenir 3 min de gainage</li>
                <li>Faire 10 tractions strictes</li>
                <li>Sparring régulier (1 à 2 fois par semaine)</li>
                <li>Certificat médical sport de contact</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Programme 6 semaines */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PROGRAMME</span>
            <h2>PRÉPARATION 6 SEMAINES</h2>
          </div>
          <div className="grid-3x2">
            {WEEKS.map((w, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.3rem', fontSize: '0.6rem' }}>
                  {w.week.toUpperCase()}
                </span>
                <h3 className="card-title" style={{ fontSize: '1rem' }}>{w.focus}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>{w.desc}</p>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ marginTop: '2rem' }}>
            <Link href="/guide-dagestan" className="btn-ghost">TÉLÉCHARGER LE PROGRAMME PDF</Link>
          </div>
        </div>
      </section>

      {/* Equipement */}
      <section className="logi-section fx-grid fx-mask-c fx-stack-5">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>ÉQUIPEMENT</span>
            <h2>QUOI EMPORTER</h2>
          </div>
          <div className="grid-2">
            {Object.entries(EQUIPMENT).map(([category, items], ci) => (
              <div key={ci} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${ci * 0.1}s` }}>
                <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{category}</h3>
                <ul className="equip-list">
                  {items.map((item, i) => (
                    <li key={i}>
                      <span className="equip-check" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preparation mentale */}
      <section className="dag-security fx-texture-concrete fx-glow fx-mask-a fx-stack-7">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="layout-split layout-split--balanced reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>MENTAL</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
                PRÉPARATION MENTALE
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                La barrière de la langue, le choc culturel, l&apos;inconfort physique : le camp va te pousser
                hors de ta zone de confort. C&apos;est le but. Les meilleurs combattants du monde s&apos;entraînent
                dans ces conditions depuis l&apos;enfance.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Ne t&apos;attends pas à un hôtel 5 étoiles. Le logement est simple, la nourriture est abondante
                mais rustique, et les coachs ne vont pas te ménager. Si tu cherches le confort, ce camp n&apos;est pas pour toi.
                Si tu cherches la progression, tu es au bon endroit.
              </p>
              <p className="pull-quote">
                &laquo; Un mois de camp qui vaut deux ans de salle. Les Daghestanais t&apos;apprennent à souffrir avec le sourire. &raquo;
              </p>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Yassine K. · Grappling · Bruxelles</span>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/action/recovery.webp"
                  alt="Athlète en récupération après un entraînement intensif"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/environment/accommodation.webp"
                  alt="Hébergement simple et fonctionnel du camp MKR"
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

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VOIR LES SESSIONS"
        ghostHref="/guide-dagestan"
        ghostLabel="TÉLÉCHARGER LE GUIDE COMPLET"
      />
    </>
  )
}
