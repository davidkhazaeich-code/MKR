import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'

export const metadata: Metadata = {
  title: 'Programme MMA | MKR Caucasian Camp | Entrainement MMA au Caucase',
  description: "Detail du programme MMA : techniques couvertes, sparring, coaching, niveaux. Entrainement intensif au coeur du Caucase.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/programme/mma' },
}

const TECHNIQUES = [
  { title: 'Stand-up', desc: 'Boxing, kickboxing, coups de coude et genou. Travail de distance et de timing.' },
  { title: 'Clinch', desc: 'Controle mural, dirty boxing, projections depuis le clinch. Specialite caucasienne.' },
  { title: 'Takedowns', desc: 'Singles, doubles, body locks. Integration des techniques de lutte dans le MMA.' },
  { title: 'Ground & Pound', desc: 'Controle au sol, frappe en position dominante. Gestion de la garde.' },
  { title: 'Soumissions', desc: 'Etranglements, clefs de bras et jambes. Enchainements depuis les transitions.' },
  { title: 'Transitions', desc: 'Passage debout-sol fluide. Scrambles, reprises de position. Le point fort du Caucase.' },
]

const SESSION_FLOW = [
  { time: '15 min', activity: 'Echauffement', desc: 'Mobilite, activation, shadow boxing.' },
  { time: '30 min', activity: 'Technique', desc: 'Demonstration et repetition par paires. Focus du jour.' },
  { time: '20 min', activity: 'Drills', desc: 'Situations de combat, enchainements, timing.' },
  { time: '30 min', activity: 'Sparring', desc: 'Rounds de 5 minutes. Intensite adaptee au niveau.' },
  { time: '10 min', activity: 'Debrief', desc: 'Retour du coach, points cles, feedback individuel.' },
]

export default function ProgrammeMMAPage() {
  return (
    <>
      <PageHero
        label="MMA"
        title="FRAPPE. PROJETTE.<br/>SOUMETS."
        subtitle="Programme MMA complet. Des methodes forgees dans les salles du Caucase."
        breadcrumb={[
          { href: '/programme', label: 'Programme' },
          { href: '/programme/mma', label: 'MMA' },
        ]}
      />

      {/* Description */}
      <section className="logi-section">
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>LE PROGRAMME</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>MMA AU CAUCASE</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le MMA au Caucase n&apos;est pas un sport de salle climatisee. C&apos;est une discipline forgee dans
                la tradition de la lutte, enrichie par des decennies de competition internationale. Les coachs MKR
                enseignent un MMA complet, avec un accent particulier sur les transitions et le controle.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Chaque session est structuree : technique, drills, sparring. Le niveau s&apos;adapte a chaque
                participant, mais l&apos;intensite reste elevee pour tous.
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

      {/* Action banner */}
      <section className="cinematic-banner">
        <div className="inner">
          <img
            src="/images/action/ground-control.webp"
            alt="Controle au sol MMA dans une salle du Caucase"
            width={1200}
            height={514}
            loading="lazy"
            className="section-photo-img"
          />
        </div>
      </section>

      {/* Techniques grid */}
      <section className="logi-section logi-alt">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>TECHNIQUES</span>
            <h2>CE QUE TU VAS TRAVAILLER</h2>
          </div>
          <div className="grid-3x2">
            {TECHNIQUES.map((t, i) => (
              <div key={i} className="content-card reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{t.title}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Session type timeline */}
      <section className="logi-section">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>SESSION TYPE</span>
            <h2>DEROULEMENT D&apos;UNE SESSION</h2>
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
