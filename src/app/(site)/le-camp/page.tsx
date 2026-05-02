import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'Le Camp MKR au Daghestan : MMA et Lutte au Caucase',
  description: "Camp MMA et Lutte au Daghestan, 1 à 3 semaines d'immersion au cœur du Caucase. Coaching d'élite, hébergement, 2 repas par jour, vol intérieur Istanbul-Makhachkala inclus.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/le-camp' },
}

const INCLUDES = [
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 28 L16 6 L28 28 Z" /><line x1="10" y1="20" x2="22" y2="20" />
      </svg>
    ),
    title: 'Transport local',
    desc: 'Transferts aéroport-camp et tous les déplacements sur place.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="10" width="24" height="18" /><path d="M4 16 L16 10 L28 16" />
      </svg>
    ),
    title: 'Hébergement',
    desc: 'Logement de camp partagé, propre et fonctionnel. Tu te concentres sur l&apos;entraînement.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="16" cy="16" r="10" /><path d="M10 16 L16 12 L22 16 L16 20 Z" />
      </svg>
    ),
    title: '2 sessions/jour',
    desc: 'Entraînement biquotidien dans ta discipline. Matin et fin d’après-midi.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="16" cy="10" r="5" /><path d="M6 28 C6 20 10 16 16 16 S26 20 26 28" />
      </svg>
    ),
    title: 'Coachs locaux',
    desc: 'Champions et vétérans du Caucase. Méthodes transmises de génération en génération.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 24 L10 14 L16 20 L22 10 L28 18" /><circle cx="6" cy="8" r="2" />
      </svg>
    ),
    title: 'Excursions',
    desc: 'Randonnées en montagne et visites culturelles le jour de repos.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="6" width="20" height="20" /><line x1="6" y1="14" x2="26" y2="14" />
        <line x1="14" y1="14" x2="14" y2="26" />
      </svg>
    ),
    title: '2 repas/jour',
    desc: 'Cuisine caucasienne riche en protéines. Régime adapté aux athlètes.',
  },
]

const NOT_INCLUDED = [
  'Vol international aller-retour',
  'Visa (si applicable à ta nationalité)',
  'Assurance voyage (obligatoire)',
  'Équipement personnel (gants, protège-tibias, etc.)',
]

const DAILY_SCHEDULE = [
  { time: '07:30', activity: 'Réveil', desc: 'Le matin appartient à ceux qui se lèvent tôt.' },
  { time: '08:30', activity: 'Petit-déjeuner', desc: 'Repas copieux, protéines, énergie pour la matinée.' },
  { time: '10:30 / 11:00', activity: 'Session matin', desc: 'Lutte (adultes ou enfants) à 10h30. MMA à 11h00. Sparring, technique, drills.' },
  { time: '13:00', activity: 'Déjeuner', desc: 'Récupération et nutrition.' },
  { time: '14:30', activity: 'Récupération', desc: 'Repos, étirements, soins si nécessaire.' },
  { time: '17:30 / 18:00', activity: 'Session après-midi', desc: 'Lutte à 17h30. MMA à 18h00. Intensité compétition, sparring dirigé.' },
  { time: '20:00', activity: 'Dîner', desc: 'Repas du soir libre selon ton plan personnel.' },
  { time: '22:00', activity: 'Repos', desc: 'Sommeil. Le corps se reconstruit.' },
]

export default function LeCampPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Le Camp', url: 'https://mkrcaucasiancamp.com/le-camp' },
      ]} />

      <PageHero
        label="LE CAMP"
        title="1 À 3 SEMAINES QUI CHANGENT<br/>TA MANIÈRE DE COMBATTRE."
        subtitle="Immersion totale au Caucase, au Daghestan. Coaching, hébergement, repas. Toi, tu combats."
      />

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/action/sparring-mma-wall.webp"
        alt="Sparring MMA dans une salle du Caucase"
        label="IMMERSION"
        title="LE CAUCASE SUR LE TAPIS"
        tagline="Sparring quotidien avec des combattants locaux. Méthodes transmises de génération en génération."
      />

      {/* Philosophie / Pourquoi le Caucase */}
      <section className="camp-section fx-grid fx-glow fx-mask-a fx-stack-2">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="layout-split layout-split--center">
            <div className="reveal">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PHILOSOPHIE</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', textTransform: 'uppercase', lineHeight: '0.92' }}>
                POURQUOI LE CAUCASE
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                Les meilleurs combattants de la planète sortent tous du même endroit. Le Caucase. Ici, les méthodes
                de combat se transmettent de père en fils depuis des siècles. Tapis, sueur, et coachs
                qui ont formé des champions du monde.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                MKR t&apos;ouvre les portes de cet univers. Que tu sois compétiteur confirmé ou amateur sérieux qui veut
                vivre les conditions de l&apos;élite, tu t&apos;entraînes au même niveau d&apos;exigence.
              </p>
            </div>
            <div>
              <div className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: '0.1s' }}>
                <h3 className="card-title">IMMERSION TOTALE</h3>
                <p className="card-body">Pendant 1 à 3 semaines, tu vis, manges et t&apos;entraînes avec des athlètes locaux. Immersion complète dans la culture du combat caucasien.</p>
              </div>
              <div className="content-card fx-grain fx-corner-glow reveal" style={{ marginTop: '1.25rem', transitionDelay: '0.18s' }}>
                <h3 className="card-title">HÉRITAGE DU CAUCASE</h3>
                <p className="card-body">Des méthodes qui ont produit Khabib, Makhachev, et des centaines de champions olympiques de lutte.</p>
              </div>
              <div className="content-card fx-grain fx-corner-glow reveal" style={{ marginTop: '1.25rem', transitionDelay: '0.26s' }}>
                <h3 className="card-title">TOUT COMPRIS</h3>
                <p className="card-body">Transport, hébergement, repas, entraînement. Tu te concentres sur une seule chose : progresser.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ce qui est inclus */}
      <section className="camp-section fx-texture-basalt fx-glow fx-stack-3">
        <div className="fx-glow-orb fx-glow-orb--left fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>INCLUS</span>
            <h2>CE QUI EST INCLUS</h2>
          </div>
          <div className="include-grid">
            {INCLUDES.map((item, i) => (
              <div key={i} className="include-card fx-grain reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                {item.icon}
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ce qui n'est PAS inclus */}
      <section className="exclude-section fx-grid">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>NON INCLUS</span>
            <h2>CE QUI N&apos;EST PAS INCLUS</h2>
          </div>
          <div className="reveal" style={{ maxWidth: '600px' }}>
            {NOT_INCLUDED.map((item, i) => (
              <div key={i} className="exclude-item">{item}</div>
            ))}
            <Link href="/logistique" className="btn-ghost" style={{ marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
              DÉTAIL LOGISTIQUE
            </Link>
          </div>
        </div>
      </section>

      {/* Journee type */}
      <section id="journee-type" className="camp-section fx-texture-concrete fx-mask-b fx-stack-4">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>24 HEURES</span>
            <h2>UNE JOURNÉE TYPE</h2>
          </div>
          <div className="daily-timeline">
            {DAILY_SCHEDULE.map((slot, i) => (
              <div key={i} className="daily-step reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="daily-time">{slot.time}</span>
                <div className="daily-step-content">
                  <h3>{slot.activity}</h3>
                  <p>{slot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Les salles */}
      <section className="camp-section fx-grid fx-glow fx-stack-5">
        <div className="fx-glow-orb fx-glow-orb--right fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>LIEUX</span>
            <h2>LES SALLES D&apos;ENTRAÎNEMENT</h2>
          </div>
          <div className="grid-2">
            <figure className="photo-card reveal">
              <img
                src="/images/environment/gym-interior.webp"
                alt="Salle d'entraînement principale au Caucase, tapis olympiques"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Salle principale. Tapis olympiques, climat contrôlé. Capacité 30 athlètes.</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: '0.1s' }}>
              <img
                src="/images/action/boxing-pads.webp"
                alt="Entraînement de frappe sur mitaines dans la salle secondaire"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Salle secondaire. Équipement de frappe, sacs lourds, cage MMA.</figcaption>
            </figure>
          </div>

          {/* Hebergement et vie au camp */}
          <div className="grid-2" style={{ marginTop: '2rem' }}>
            <figure className="photo-card reveal">
              <img
                src="/images/environment/accommodation.webp"
                alt="Hébergement du camp MKR au Caucase"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Hébergement de camp. Simple, propre, fonctionnel. Pas un hôtel, un lieu de repos.</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: '0.1s' }}>
              <img
                src="/images/environment/communal-meal.webp"
                alt="Repas communautaire entre athlètes et coachs"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Repas communautaire. Cuisine caucasienne, protéines, fraternité.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VOIR LES SESSIONS DISPONIBLES"
        ghostHref="/programme"
        ghostLabel="DÉCOUVRIR LE PROGRAMME"
      />
    </>
  )
}
