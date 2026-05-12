import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import { FAMILY_BASE_PROSE, FAMILY_EXTRA_CHILD_1WEEK_LABEL } from '@/lib/pricing-copy'

export const metadata: Metadata = {
  title: 'Programme MMA en Tchétchénie et Lutte au Daghestan | MKR Caucasian Camp',
  description: "Trois disciplines, deux destinations : Lutte adultes et Lutte enfants au Daghestan, MMA en Tchétchénie. Sparring quotidien, coaching d'élite au cœur du Caucase.",
  alternates: { canonical: 'https://mkrcamp.com/programme' },
}

export default function ProgrammePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Programme', url: 'https://mkrcamp.com/programme' },
      ]} />
      <PageHero
        label="PROGRAMME"
        title="TROIS DISCIPLINES.<br/>DEUX TERRES DU CAUCASE."
        subtitle="Lutte adultes et Lutte enfants au Daghestan. MMA en Tchétchénie. Le combo possible uniquement en sur-mesure."
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
          <span className="stat-num">3</span>
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
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>DISCIPLINE · TCHÉTCHÉNIE</span>
              <h2>MMA</h2>
              <p>Striking, clinch, takedowns, soumissions. Sparring quotidien avec les combattants de l&apos;écurie Akhmat. Camp basé à Grozny, en Tchétchénie. Le MMA tchétchène en immersion totale.</p>
              <span className="btn-ghost" style={{ marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                VOIR LE PROGRAMME MMA
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Lutte adultes card */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="inner">
          <Link href="/programme/lutte" className="prog-discipline-card reveal">
            <img
              src="/images/action/takedown-wrestling.webp"
              alt="Takedown de lutte libre au Daghestan"
              width={800}
              height={600}
              loading="lazy"
              className="prog-disc-bg"
            />
            <div className="prog-disc-content">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>DISCIPLINE · DAGHESTAN</span>
              <h2>LUTTE ADULTES</h2>
              <p>Lutte libre exclusivement, au cœur du Daghestan. Méthodes daghestanaises transmises par des champions. Projections, contrôle au sol, scrambles. La discipline fondatrice du combat au Caucase.</p>
              <span className="btn-ghost" style={{ marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                VOIR LE PROGRAMME LUTTE
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Lutte enfants card */}
      <section className="logi-section fx-grid fx-stack-3b">
        <div className="inner">
          <Link href="/programme/lutte-enfants" className="prog-discipline-card reveal">
            <img
              src="/images/action/ground-control.webp"
              alt="Lutte adaptée aux jeunes athlètes au Daghestan"
              width={800}
              height={600}
              loading="lazy"
              className="prog-disc-bg"
            />
            <div className="prog-disc-content">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>DISCIPLINE · DAGHESTAN</span>
              <h2>LUTTE ENFANTS</h2>
              <p>Programme jeunesse au Daghestan. Pédagogie progressive, encadrement spécialisé. Les fondamentaux daghestanais transmis aux nouvelles générations dans un cadre adapté et sécurisant.</p>
              <span className="btn-ghost" style={{ marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                VOIR LE PROGRAMME LUTTE ENFANTS
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Jeunesse — remplace S&C */}
      <section id="jeunesse" className="logi-section fx-grid fx-stack-4">
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <figure className="photo-card">
              <img
                src="/images/ruslan/kids/kids-coach-cercle-mkr.webp"
                alt="Cercle de jeunes lutteurs autour d'un coach daghestanais, programme jeunesse MKR"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
            </figure>
            <div className="content-card fx-grain fx-corner-glow">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>JEUNESSE</span>
              <h3 className="card-title" style={{ fontSize: '1.3rem' }}>PROGRAMME 8-17 ANS</h3>
              <p className="card-body">
                Au Daghestan, on commence la lutte très jeune. MKR ouvre cet accès aux 8-17 ans dans un cadre
                adapté : coach jeunesse dédié, ratio 1 pour 5, sécurité renforcée. Enfant 8-17 ans toujours
                accompagné d&apos;un parent participant. Forfait Famille (1P + 1E inclus) : {FAMILY_BASE_PROSE}. Chaque enfant supplémentaire : {FAMILY_EXTRA_CHILD_1WEEK_LABEL}.
              </p>
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/programme/lutte-enfants" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.55rem 1.25rem' }}>
                  PROGRAMME LUTTE ENFANTS
                </Link>
                <Link href="/familles" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.55rem 1.25rem' }}>
                  CAMP FAMILLE
                </Link>
              </div>
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
                desc: 'Combattants pro ou semi-pro. Sparring soutenu, coaching tactique avancé, préparation spécifique compétition.',
              },
              {
                level: 'INTERMÉDIAIRE',
                desc: '2 à 5 ans de pratique régulière. Base solide debout et au sol. Le cœur du groupe MKR.',
              },
              {
                level: 'AMATEUR SÉRIEUX',
                desc: '2 ans minimum de pratique. Condition physique solide. Engagement total pendant le camp.',
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
        ghostHref="/destinations"
        ghostLabel="VOIR LES DESTINATIONS"
      />
    </>
  )
}
