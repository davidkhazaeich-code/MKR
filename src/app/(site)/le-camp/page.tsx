import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'Le Camp | MKR Caucasian Camp | MMA & Lutte au Caucase',
  description: "Decouvrez le concept MKR : immersion totale de 3 semaines au coeur du Caucase georgien. Coaching de haut niveau, hebergement, repas inclus. Zero distraction.",
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
    desc: 'Transferts aeroport-camp et tous les deplacements sur place.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="10" width="24" height="18" /><path d="M4 16 L16 10 L28 16" />
      </svg>
    ),
    title: 'Hebergement',
    desc: 'Logement de camp partage, propre et confortable. Tu te concentres sur l&apos;entrainement.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="16" cy="16" r="10" /><path d="M10 16 L16 12 L22 16 L16 20 Z" />
      </svg>
    ),
    title: '2 sessions/jour',
    desc: 'Entrainement biquotidien : matin lutte, apres-midi MMA.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="16" cy="10" r="5" /><path d="M6 28 C6 20 10 16 16 16 S26 20 26 28" />
      </svg>
    ),
    title: 'Coachs locaux',
    desc: 'Champions et veterans du Caucase. Methodes transmises de generation en generation.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 24 L10 14 L16 20 L22 10 L28 18" /><circle cx="6" cy="8" r="2" />
      </svg>
    ),
    title: 'Excursions',
    desc: 'Randonnees en montagne, visites culturelles le jour de repos.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="6" width="20" height="20" /><line x1="6" y1="14" x2="26" y2="14" />
        <line x1="14" y1="14" x2="14" y2="26" />
      </svg>
    ),
    title: '3 repas/jour',
    desc: 'Cuisine caucasienne riche en proteines. Regime adapte aux athletes.',
  },
]

const NOT_INCLUDED = [
  'Vol international aller-retour',
  'Visa (si applicable a ta nationalite)',
  'Assurance voyage (obligatoire)',
  'Equipement personnel (gants, protege-tibias, etc.)',
]

const DAILY_SCHEDULE = [
  { time: '06:00', activity: 'Reveil', desc: 'La journee commence tot. Le Caucase se merite.' },
  { time: '07:00', activity: 'Petit-dejeuner', desc: 'Repas copieux, proteines, energie pour la matinee.' },
  { time: '08:00 - 10:00', activity: 'Session Lutte', desc: 'Technique, drills, sparring. Coachs daghestanais.' },
  { time: '12:00', activity: 'Dejeuner', desc: 'Recuperation et nutrition.' },
  { time: '14:00', activity: 'Recuperation', desc: 'Repos, etirements, soins si necessaire.' },
  { time: '16:00 - 18:00', activity: 'Session MMA', desc: 'Striking, clinch, ground, sparring dirige.' },
  { time: '19:00', activity: 'Diner', desc: 'Repas complet. Debrief de la journee.' },
  { time: '21:00', activity: 'Repos', desc: 'Sommeil. Le corps se reconstruit.' },
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
        title="3 SEMAINES QUI CHANGENT<br/>TA MANIERE DE COMBATTRE."
        subtitle="Immersion totale au Caucase georgien. Coaching, hebergement, repas. Toi, tu combats."
      />

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/action/sparring-mma-wall.webp"
        alt="Sparring MMA dans une salle du Caucase"
        label="IMMERSION"
        title="LE CAUCASE SUR LE TAPIS"
        tagline="Sparring quotidien avec des combattants locaux. Methodes transmises de generation en generation."
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
                Les meilleurs combattants de la planete sortent tous du meme endroit. Le Caucase. Ici, les methodes
                de combat se transmettent de pere en fils depuis des siecles. Des tapis, de la sueur, et des coachs
                qui ont forme des champions du monde.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                MKR t&apos;ouvre les portes de cet univers. Que tu sois competiteur confirme ou passionné qui veut
                vivre une experience unique, tu t&apos;entraines dans les memes conditions que l&apos;elite.
              </p>
            </div>
            <div>
              <div className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: '0.1s' }}>
                <h3 className="card-title">IMMERSION TOTALE</h3>
                <p className="card-body">Pendant 3 semaines, tu vis, manges et t&apos;entraines avec des athletes locaux. Une immersion complete dans la culture du combat caucasien.</p>
              </div>
              <div className="content-card fx-grain fx-corner-glow reveal" style={{ marginTop: '1.25rem', transitionDelay: '0.18s' }}>
                <h3 className="card-title">HERITAGE DU CAUCASE</h3>
                <p className="card-body">Des methodes qui ont produit Khabib, Makhachev, et des centaines de champions olympiques de lutte.</p>
              </div>
              <div className="content-card fx-grain fx-corner-glow reveal" style={{ marginTop: '1.25rem', transitionDelay: '0.26s' }}>
                <h3 className="card-title">TOUT COMPRIS</h3>
                <p className="card-body">Transport, hebergement, repas, entrainement. Tu ne t&apos;occupes de rien d&apos;autre que de progresser.</p>
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
              DETAIL LOGISTIQUE
            </Link>
          </div>
        </div>
      </section>

      {/* Journee type */}
      <section id="journee-type" className="camp-section fx-texture-concrete fx-mask-b fx-stack-4">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>24 HEURES</span>
            <h2>UNE JOURNEE TYPE</h2>
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
            <h2>LES SALLES D&apos;ENTRAINEMENT</h2>
          </div>
          <div className="grid-2">
            <figure className="photo-card reveal">
              <img
                src="/images/environment/gym-interior.webp"
                alt="Salle d'entrainement principale au Caucase, tapis olympiques"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Salle principale. Tapis olympiques, climat controle. Capacite 30 athletes.</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: '0.1s' }}>
              <img
                src="/images/action/boxing-pads.webp"
                alt="Entrainement de frappe sur mitaines dans la salle secondaire"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Salle secondaire. Equipement de frappe, sacs lourds, cage MMA.</figcaption>
            </figure>
          </div>

          {/* Hebergement & vie au camp */}
          <div className="grid-2" style={{ marginTop: '2rem' }}>
            <figure className="photo-card reveal">
              <img
                src="/images/environment/accommodation.webp"
                alt="Hebergement du camp MKR au Caucase"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Hebergement de camp. Simple, propre, fonctionnel. Pas un hotel, un lieu de repos.</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: '0.1s' }}>
              <img
                src="/images/environment/communal-meal.webp"
                alt="Repas communautaire entre athletes et coachs"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Repas communautaire. Cuisine caucasienne, proteines, fraternite.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VOIR LES SESSIONS DISPONIBLES"
        ghostHref="/programme"
        ghostLabel="DECOUVRIR LE PROGRAMME"
      />
    </>
  )
}
