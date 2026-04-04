import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'

export const metadata: Metadata = {
  title: 'Preparer son camp | MKR Caucasian Camp | Guide de preparation MMA',
  description: "Tout ce qu'il faut savoir pour arriver pret au camp MKR. Niveau minimum, programme de preparation 6 semaines, equipement, preparation mentale.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/preparer-son-camp' },
}

const WEEKS = [
  { week: 'Semaine 1', focus: 'Cardio', desc: 'Base aerobique. Course 30-45 min, natation, velo. Test de Cooper initial.' },
  { week: 'Semaine 2', focus: 'Force', desc: 'Squats, tractions, pompes, deadlifts. Circuits fonctionnels.' },
  { week: 'Semaine 3', focus: 'Mobilite', desc: 'Yoga, stretching dynamique, travail de hanches et epaules.' },
  { week: 'Semaine 4', focus: 'Endurance specifique', desc: 'Sparring simule, rounds de 5 min, HIIT combat.' },
  { week: 'Semaine 5', focus: 'Intensite', desc: 'Combinaison force-cardio. Circuits de 45 min. Sparring reel.' },
  { week: 'Semaine 6', focus: 'Affutage', desc: 'Volume reduit, intensite maintenue. Repos actif. Preparation mentale.' },
]

const EQUIPMENT = {
  'Vetements & Protection': [
    'Kimono de lutte (si applicable)',
    'Gants de boxe 16 oz',
    'Protege-tibias',
    'Protege-dents (moule)',
    'Coquille',
    'Rash guard (x3 minimum)',
    'Short de combat (x3)',
    'Chaussures de lutte (optionnel)',
  ],
  'Hygiene & Admin': [
    'Passeport (valide 6+ mois)',
    'Copie confirmation MKR',
    'Attestation assurance',
    'Trousse de premiers soins',
    'Creme solaire SPF 50',
    'Anti-moustique',
    'Adaptateur prise (type C/F)',
    'Cadenas valise',
  ],
}

export default function PreparerSonCampPage() {
  return (
    <>
      <PageHero
        label="PREPARATION"
        title="ARRIVES PRET.<br/>REPARS TRANSFORME."
        subtitle="Le camp commence 6 semaines avant ton depart."
      />

      {/* Cinematic banner */}
      <section className="cinematic-banner">
        <div className="inner">
          <img
            src="/images/action/conditioning-rope.webp"
            alt="Athlete grimpant a la corde dans un gym sovietique du Caucase"
            width={1200}
            height={514}
            loading="lazy"
            className="section-photo-img"
          />
        </div>
      </section>

      {/* Niveau minimum */}
      <section className="logi-section">
        <div className="inner">
          <div className="layout-split layout-split--balanced">
            <div className="reveal">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PREREQUIS</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>NIVEAU MINIMUM</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Tu n&apos;as pas besoin d&apos;etre un professionnel. Mais tu dois etre un pratiquant serieux
                avec au moins 2 ans de pratique reguliere en sport de combat.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le camp est intense. Si tu arrives sans preparation, tu ne tiendras pas la premiere semaine.
                C&apos;est pour ca qu&apos;on te fournit un programme de preparation de 6 semaines.
              </p>
            </div>
            <div className="content-card reveal" style={{ transitionDelay: '0.1s' }}>
              <h3 className="card-title">CHECKLIST AVANT DEPART</h3>
              <ul className="logi-check-list">
                <li>Courir 5 km sans s&apos;arreter</li>
                <li>Enchainer 50 squats corps libre</li>
                <li>Tenir 3 min de gainage</li>
                <li>Faire 10 tractions strictes</li>
                <li>Sparring regulier (1-2x/semaine)</li>
                <li>Certificat medical sport de contact</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Programme 6 semaines */}
      <section className="logi-section logi-alt">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PROGRAMME</span>
            <h2>PREPARATION 6 SEMAINES</h2>
          </div>
          <div className="grid-3x2">
            {WEEKS.map((w, i) => (
              <div key={i} className="content-card reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.3rem', fontSize: '0.6rem' }}>
                  {w.week.toUpperCase()}
                </span>
                <h3 className="card-title" style={{ fontSize: '1rem' }}>{w.focus}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>{w.desc}</p>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ marginTop: '2rem' }}>
            <Link href="/guide-dagestan" className="btn-ghost">TELECHARGER LE PROGRAMME PDF</Link>
          </div>
        </div>
      </section>

      {/* Equipement */}
      <section className="logi-section">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>EQUIPEMENT</span>
            <h2>QUOI EMPORTER</h2>
          </div>
          <div className="grid-2">
            {Object.entries(EQUIPMENT).map(([category, items], ci) => (
              <div key={ci} className="content-card reveal" style={{ transitionDelay: `${ci * 0.1}s` }}>
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
      <section className="dag-security">
        <div className="inner">
          <div className="layout-split layout-split--balanced reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>MENTAL</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
                PREPARATION MENTALE
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                La barriere de la langue, le choc culturel, l&apos;inconfort physique : le camp va te pousser
                hors de ta zone de confort. C&apos;est le but. Les meilleurs combattants du monde s&apos;entrainent
                dans ces conditions depuis l&apos;enfance.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Ne t&apos;attends pas a un hotel 5 etoiles. Le logement est simple, la nourriture est abondante
                mais rustique, et les coachs ne vont pas te menager. Si tu cherches le confort, ce camp n&apos;est pas pour toi.
                Si tu cherches la progression, tu es au bon endroit.
              </p>
              <p className="pull-quote">
                &laquo; Un mois de camp qui vaut deux ans de salle. Les Dagestanais t&apos;apprennent a souffrir avec le sourire. &raquo;
              </p>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Yassine K. · Grappling · Bruxelles</span>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/action/recovery.webp"
                  alt="Athlete en recuperation apres un entrainement intensif"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/environment/accommodation.webp"
                  alt="Hebergement simple et fonctionnel du camp MKR"
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
        ghostLabel="TELECHARGER LE GUIDE COMPLET"
      />
    </>
  )
}
