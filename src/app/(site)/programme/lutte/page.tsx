import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'Programme Lutte libre au Daghestan | MKR Caucasian Camp',
  description: "Programme de lutte libre au Caucase. Méthodes daghestanaises ancestrales, leg rides, chain wrestling, sparring quotidien, coachs champions du monde.",
  alternates: { canonical: 'https://mkrcamp.com/programme/lutte' },
}

const TECHNIQUES = [
  { title: 'Lutte libre', desc: 'Takedowns explosifs, contrôle des jambes, scrambles. La base du combat au Daghestan.' },
  { title: 'Leg rides', desc: 'Spécialité daghestanaise. Contrôle au sol avec les jambes. Technique introuvable en Europe.' },
  { title: 'Chain wrestling', desc: 'Enchaînement de takedowns. Si le premier échoue, le deuxième est déjà en route.' },
  { title: 'Funk rolls', desc: 'Reprises de position acrobatiques. Transformer une situation défensive en attaque.' },
  { title: 'Mat returns', desc: "Ramener l'adversaire au sol depuis la position debout. Technique de contrôle." },
  { title: 'Défense de takedown', desc: "Sprawl, underhooks, contre-attaques. Annuler l'attaque adverse et reprendre l'initiative." },
]

const SESSION_FLOW = [
  { time: '15 min', activity: 'Échauffement', desc: 'Course, exercices au sol, mobilité des hanches.' },
  { time: '30 min', activity: 'Technique', desc: 'Démonstration par le coach. Répétition par paires. Corrections individuelles.' },
  { time: '20 min', activity: 'Situations', desc: 'Positions de départ imposées. Attaque-défense chronométrée.' },
  { time: '30 min', activity: 'Sparring', desc: 'Rounds de 6 minutes (rythme compétition). Rotation partenaires.' },
  { time: '10 min', activity: 'Conditioning', desc: 'Circuit final : pompes, squats, pont de lutte, gainage.' },
]

export default function ProgrammeLuttePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Programme', url: 'https://mkrcamp.com/programme' },
        { name: 'Lutte', url: 'https://mkrcamp.com/programme/lutte' },
      ]} />
      <PageHero
        label="LUTTE"
        title="LA DISCIPLINE QUI A<br/>FORGÉ LE CAUCASE"
        subtitle="Lutte libre uniquement. Les méthodes ancestrales du Daghestan."
        breadcrumb={[
          { href: '/programme', label: 'Programme' },
          { href: '/programme/lutte', label: 'Lutte' },
        ]}
      />

      {/* Description */}
      <section className="logi-section fx-grid fx-stack-1 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>LE PROGRAMME</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>LUTTE AU DAGHESTAN</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Au Daghestan, la lutte n&apos;est pas un sport. C&apos;est une identité. Chaque village a son champion,
                chaque famille transmet ses techniques. Les méthodes daghestanaises ont produit plus de champions
                olympiques de lutte par habitant que n&apos;importe quel autre endroit au monde.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le programme MKR te donne accès à ce savoir : lutte libre exclusivement, et les techniques
                spécifiques du Caucase que tu ne trouveras dans aucune académie européenne.
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/action/takedown-wrestling.webp"
                  alt="Takedown de lutte, entraînement au Caucase"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/action/ground-control.webp"
                  alt="Contrôle au sol en lutte, technique daghestanaise"
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

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/action/takedown-wrestling.webp"
        alt="Takedown de lutte libre en entraînement au Caucase"
        label="PROJECTION"
        title="L'ART DU TAKEDOWN"
        tagline="Lutte libre. Les techniques qui ont forgé les champions du Caucase."
      />

      {/* Techniques */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>TECHNIQUES</span>
            <h2>CE QUE TU VAS TRAVAILLER</h2>
          </div>
          <div className="grid-3x2">
            {TECHNIQUES.map((t, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{t.title}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Session type */}
      <section className="logi-section fx-grid fx-mask-c fx-stack-4 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>SESSION TYPE</span>
            <h2>DÉROULEMENT D&apos;UNE SESSION</h2>
          </div>
          <div className="daily-timeline">
            {SESSION_FLOW.map((step, i) => (
              <div key={i} className="daily-step reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="daily-time">{step.time}</span>
                <div className="daily-step-content">
                  <h3>{step.activity}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="logi-updated" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            Horaires officiels Lutte adultes : <strong>matin 10h30</strong> et <strong>après-midi 17h30</strong>. Pas de chevauchement avec les sessions MMA.
          </p>
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VOIR LES SESSIONS"
        ghostHref="/programme/mma"
        ghostLabel="VOIR AUSSI : MMA"
      />
    </>
  )
}
