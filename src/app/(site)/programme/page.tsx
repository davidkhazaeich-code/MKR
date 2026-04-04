import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'

export const metadata: Metadata = {
  title: 'Programme MMA & Lutte | MKR Caucasian Camp | Entrainement au Caucase',
  description: "Programme d'entrainement complet : MMA, lutte libre, lutte greco-romaine, strength & conditioning. Decouvre les methodes du Caucase.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/programme' },
}

export default function ProgrammePage() {
  return (
    <>
      <PageHero
        label="PROGRAMME"
        title="DEUX DISCIPLINES.<br/>UN OBJECTIF : PROGRESSER."
        subtitle="MMA, lutte, strength & conditioning. Chaque session te rapproche du sommet."
      />

      {/* Stats band */}
      <div className="stats-band fx-grid fx-stack-1">
        <div className="stat-item">
          <span className="stat-num">2</span>
          <span className="stat-label">Sessions par jour</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">6</span>
          <span className="stat-label">Jours par semaine</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">4</span>
          <span className="stat-label">Disciplines</span>
        </div>
      </div>

      {/* MMA card */}
      <section className="logi-section fx-grid fx-stack-2">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <Link href="/programme/mma" className="prog-discipline-card reveal">
            <img
              src="/images/action/sparring-mma-wall.webp"
              alt="Sparring MMA dans une salle du Caucase"
              width={800}
              height={600}
              loading="lazy"
              className="prog-disc-bg"
            />
            <div className="prog-disc-content">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>DISCIPLINE</span>
              <h2>MMA</h2>
              <p>Striking, clinch, takedowns, soumissions. Sparring quotidien avec des combattants locaux. Transitions debout-sol. Methodes inspirees des meilleurs fighters du Caucase.</p>
              <span className="btn-ghost" style={{ marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                VOIR LE PROGRAMME MMA
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Lutte card */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="inner">
          <Link href="/programme/lutte" className="prog-discipline-card reveal">
            <img
              src="/images/action/takedown-wrestling.webp"
              alt="Takedown de lutte au Caucase"
              width={800}
              height={600}
              loading="lazy"
              className="prog-disc-bg"
            />
            <div className="prog-disc-content">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>DISCIPLINE</span>
              <h2>LUTTE</h2>
              <p>Lutte libre et greco-romaine. Methodes daghestanaises transmises par des champions. Projections, controle au sol, scrambles. La discipline fondatrice du combat au Caucase.</p>
              <span className="btn-ghost" style={{ marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                VOIR LE PROGRAMME LUTTE
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* S&C */}
      <section id="conditioning" className="logi-section fx-grid fx-stack-4">
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <figure className="photo-card">
              <img
                src="/images/action/conditioning-rope.webp"
                alt="Athlete grimpant a la corde dans un gym sovietique"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
            </figure>
            <div className="content-card fx-grain fx-corner-glow">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>INCLUS</span>
              <h3 className="card-title" style={{ fontSize: '1.3rem' }}>STRENGTH &amp; CONDITIONING</h3>
              <p className="card-body">
                Sessions complementaires integrees au programme : course en montagne, exercices au poids du corps,
                gainage fonctionnel, endurance specifique au combat. Pas de salle de muscu clinquante.
                Le Caucase est ta salle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Niveaux */}
      <section className="logi-section fx-texture-concrete fx-mask-c fx-stack-5 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>NIVEAUX</span>
            <h2>POUR QUI ?</h2>
          </div>
          <div className="grid-3">
            {[
              {
                level: 'PROFESSIONNEL',
                desc: 'Combattants pro ou semi-pro. Sparring non retenu, coaching tactique avance, preparation specifique competition.',
              },
              {
                level: 'INTERMEDIAIRE',
                desc: '2-5 ans de pratique reguliere. Base solide debout et au sol. Le coeur du groupe MKR.',
              },
              {
                level: 'AMATEUR SERIEUX',
                desc: '2 ans minimum de pratique. Condition physique solide. Motivation et engagement total pendant le camp.',
              },
            ].map((n, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <h3 className="card-title">{n.level}</h3>
                <p className="card-body">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VOIR LES SESSIONS"
        ghostHref="/coachs"
        ghostLabel="DECOUVRIR NOS COACHS"
      />
    </>
  )
}
