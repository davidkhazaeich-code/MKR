import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'Programme MMA au Daghestan | MKR Caucasian Camp',
  description: "Programme MMA complet au Caucase : techniques debout, clinch, takedowns, soumissions, transitions. Sparring quotidien et coaching d'élite au Daghestan.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/programme/mma' },
}

const TECHNIQUES = [
  { title: 'Stand-up', desc: 'Boxe, kickboxing, coups de coude et de genou. Travail de distance et de timing.' },
  { title: 'Clinch', desc: 'Contrôle mural, dirty boxing, projections depuis le clinch. Spécialité caucasienne.' },
  { title: 'Takedowns', desc: 'Singles, doubles, body locks. Intégration des techniques de lutte dans le MMA.' },
  { title: 'Ground et Pound', desc: 'Contrôle au sol, frappe en position dominante. Gestion de la garde.' },
  { title: 'Soumissions', desc: 'Étranglements, clés de bras et de jambes. Enchaînements depuis les transitions.' },
  { title: 'Transitions', desc: 'Passage debout-sol fluide. Scrambles, reprises de position. Le point fort du Caucase.' },
]

const SESSION_FLOW = [
  { time: '15 min', activity: 'Échauffement', desc: 'Mobilité, activation, shadow boxing.' },
  { time: '30 min', activity: 'Technique', desc: 'Démonstration et répétition par paires. Focus du jour.' },
  { time: '20 min', activity: 'Drills', desc: 'Situations de combat, enchaînements, timing.' },
  { time: '30 min', activity: 'Sparring', desc: 'Rounds de 5 minutes. Intensité adaptée au niveau.' },
  { time: '10 min', activity: 'Débrief', desc: 'Retour du coach, points clés, feedback individuel.' },
]

export default function ProgrammeMMAPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Programme', url: 'https://mkrcaucasiancamp.com/programme' },
        { name: 'MMA', url: 'https://mkrcaucasiancamp.com/programme/mma' },
      ]} />
      <PageHero
        label="MMA"
        title="FRAPPE. PROJETTE.<br/>SOUMETS."
        subtitle="Programme MMA complet. Des méthodes forgées dans les salles du Caucase."
        breadcrumb={[
          { href: '/programme', label: 'Programme' },
          { href: '/programme/mma', label: 'MMA' },
        ]}
      />

      {/* Description */}
      <section className="logi-section fx-grid fx-stack-1 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>LE PROGRAMME</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>MMA AU CAUCASE</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le MMA au Caucase n&apos;est pas un sport de salle climatisée. C&apos;est une discipline forgée dans
                la tradition de la lutte, enrichie par des décennies de compétition internationale. Les coachs MKR
                enseignent un MMA complet, avec un accent particulier sur les transitions et le contrôle.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Chaque session est structurée : technique, drills, sparring. Le niveau s&apos;adapte à chaque
                participant, mais l&apos;intensité reste élevée pour tous.
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/action/sparring-mma-wall.webp"
                  alt="Sparring MMA en clinch contre le mur, salle du Caucase"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/action/boxing-pads.webp"
                  alt="Travail de frappe sur mitaines avec coach"
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
        image="/images/action/ground-control.webp"
        alt="Contrôle au sol MMA dans une salle du Caucase"
        label="GROUND GAME"
        title="LE CONTRÔLE AU SOL"
        tagline="Position dominante, soumissions, transitions. Le MMA caucasien commence par le sol."
      />

      {/* Techniques grid */}
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

      {/* Session type timeline */}
      <section className="logi-section fx-grid fx-mask-c fx-stack-4 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left" />
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
            Horaires officiels MMA : <strong>matin 11h00</strong> et <strong>après-midi 18h00</strong>. Pas de chevauchement avec les sessions Lutte.
          </p>
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VOIR LES SESSIONS"
        ghostHref="/programme/lutte"
        ghostLabel="VOIR AUSSI : LUTTE"
      />
    </>
  )
}
