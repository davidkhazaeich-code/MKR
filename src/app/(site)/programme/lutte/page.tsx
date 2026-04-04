import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'

export const metadata: Metadata = {
  title: 'Programme Lutte | MKR Caucasian Camp | Lutte libre & greco au Caucase',
  description: "Programme de lutte libre et greco-romaine. Methodes daghestanaises ancestrales, sparring quotidien, coaching de haut niveau au Caucase.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/programme/lutte' },
}

const TECHNIQUES = [
  { title: 'Lutte libre', desc: 'Takedowns explosifs, controle des jambes, scrambles. La base du combat au Dagestan.' },
  { title: 'Greco-romaine', desc: 'Projections de hanche, suplex, controle au corps-a-corps. Pas de prise de jambes : tout passe par le haut.' },
  { title: 'Leg rides', desc: 'Specialite daghestanaise. Controle au sol avec les jambes. Technique introuvable en Europe.' },
  { title: 'Chain wrestling', desc: 'Enchainement de takedowns. Si le premier echoue, le deuxieme est deja en route.' },
  { title: 'Funk rolls', desc: 'Reprises de position acrobatiques. Transformer une situation defensive en attaque.' },
  { title: 'Mat returns', desc: 'Ramener l\'adversaire au sol depuis la position debout. Technique de controle.' },
]

const SESSION_FLOW = [
  { time: '15 min', activity: 'Echauffement', desc: 'Course, exercices au sol, mobilite des hanches.' },
  { time: '30 min', activity: 'Technique', desc: 'Demonstration par le coach. Repetition par paires. Corrections individuelles.' },
  { time: '20 min', activity: 'Situations', desc: 'Positions de depart imposees. Attaque-defense chronometree.' },
  { time: '30 min', activity: 'Sparring', desc: 'Rounds de 6 minutes (rythme competition). Rotation partenaires.' },
  { time: '10 min', activity: 'Conditioning', desc: 'Circuit final : pompes, squats, pont de lutte, gainage.' },
]

export default function ProgrammeLuttePage() {
  return (
    <>
      <PageHero
        label="LUTTE"
        title="LA DISCIPLINE QUI A<br/>FORGE LE CAUCASE"
        subtitle="Lutte libre et greco-romaine. Les methodes ancestrales du Dagestan."
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
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>LUTTE AU DAGESTAN</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Au Dagestan, la lutte n&apos;est pas un sport. C&apos;est une identite. Chaque village a son champion,
                chaque famille transmet ses techniques. Les methodes daghestanaises ont produit plus de champions
                olympiques de lutte par habitant que n&apos;importe quel autre endroit au monde.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le programme MKR te donne acces a ce savoir. Lutte libre, greco-romaine, et les techniques
                specifiques du Caucase que tu ne trouveras dans aucune academie europeenne.
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/action/takedown-wrestling.webp"
                  alt="Takedown de lutte, entrainement au Caucase"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/action/ground-control.webp"
                  alt="Controle au sol en lutte, technique daghestanaise"
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
      <section className="cinematic-banner fx-stack-2">
        <div className="inner">
          <img
            src="/images/action/sambo-throw.webp"
            alt="Projection de Sambo en entrainement au Caucase"
            width={1200}
            height={514}
            loading="lazy"
            className="section-photo-img"
          />
        </div>
      </section>

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
        ghostHref="/programme/mma"
        ghostLabel="VOIR AUSSI : MMA"
      />
    </>
  )
}
