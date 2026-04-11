import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'A Propos | MKR Caucasian Camp | Notre Histoire',
  description: "L'histoire de MKR Caucasian Camp. Pourquoi le Caucase, notre mission, notre equipe, nos partenaires.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/a-propos' },
}

export default function AProposPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'A Propos', url: 'https://mkrcaucasiancamp.com/a-propos' },
      ]} />

      <PageHero
        label="A PROPOS"
        title="NOTRE HISTOIRE"
        subtitle="Comment MKR Caucasian Camp est ne, et pourquoi on fait ca."
      />

      {/* L'histoire */}
      <section className="logi-section fx-grid fx-stack-1">
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>NOTRE HISTOIRE</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>
                POURQUOI MKR EXISTE
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                MKR est ne d&apos;un constat simple : les meilleurs combattants de la planete viennent tous du meme endroit,
                mais personne ne propose un acces structure a ces methodes d&apos;entrainement pour les athletes europeens.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Apres des annees de voyages au Dagestan et en Tchetchenie, des relations construites avec les coachs locaux,
                et des dizaines d&apos;athletes accompagnes, MKR Caucasian Camp est devenu le pont entre l&apos;Europe
                francophone et les salles du Caucase.
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/coaches/ruslan.webp"
                  alt="Ruslan, fondateur de MKR Caucasian Camp"
                  width={600}
                  height={990}
                  loading="lazy"
                  className="coach-photo-img"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/environment/communal-meal.webp"
        alt="Repas communautaire au camp MKR au Caucase"
        label="COMMUNAUTE"
        title="PLUS QU'UN CAMP"
        tagline="Repas partages, liens forges sur le tapis. Une fraternite entre athletes qui depasse les frontieres."
      />

      {/* Mission */}
      <section className="dag-security fx-texture-concrete fx-glow fx-glow-breathe fx-mask-b fx-stack-2">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="reveal" style={{ maxWidth: '700px', textAlign: 'center', margin: '0 auto' }}>
            <p style={{
              fontFamily: 'var(--font-teko)',
              fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
              fontWeight: 600,
              lineHeight: 1.2,
              textTransform: 'uppercase',
            }}>
              &laquo; Notre mission : donner aux athletes francophones acces aux methodes de combat
              d&apos;entrainement les plus efficaces au monde, dans un cadre authentique et encadre. &raquo;
            </p>
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="logi-section fx-grid fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>EQUIPE</span>
            <h2>QUI SOMMES-NOUS</h2>
          </div>
          <div className="grid-2">
            <div className="coach-extended-card reveal">
              <div className="coach-ext-photo">
                <img
                  src="/images/coaches/ruslan.webp"
                  alt="Ruslan, fondateur de MKR Caucasian Camp"
                  width={600}
                  height={990}
                  loading="lazy"
                  className="coach-photo-img"
                />
              </div>
              <div className="coach-ext-info">
                <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                  FONDATEUR
                </span>
                <h3>RUSLAN</h3>
                <p className="coach-ext-bio">
                  Fondateur de MKR Caucasian Camp. Pratiquant de sports de combat depuis plus de 15 ans.
                  Connecte au Caucase depuis 2018. Organise les camps et gere les relations avec les coachs
                  et salles partenaires sur place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partenaires */}
      <section className="logi-section logi-alt fx-texture-basalt fx-stack-4">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PARTENAIRES</span>
            <h2>SALLES PARTENAIRES</h2>
          </div>
          <div className="grid-3 reveal">
            {['Salle 1 · Makhachkala', 'Salle 2 · Kaspiysk', 'Salle 3 · Grozny'].map((name, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--surface-lowest)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Logo</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VOIR LES SESSIONS"
        ghostHref="/contact"
        ghostLabel="NOUS CONTACTER"
      />
    </>
  )
}
