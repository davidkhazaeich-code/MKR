import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'À propos de MKR Caucasian Camp : notre histoire et notre mission',
  description: "L'histoire de MKR Caucasian Camp. Pourquoi le Caucase, notre mission, notre équipe, nos partenaires.",
  alternates: { canonical: 'https://mkrcamp.com/a-propos' },
}

export default function AProposPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'À Propos', url: 'https://mkrcamp.com/a-propos' },
      ]} />

      <PageHero
        label="À PROPOS"
        title="NOTRE HISTOIRE"
        subtitle="Comment MKR Caucasian Camp est né, et pourquoi on fait ça."
      />

      {/* L'histoire */}
      <section className="logi-section fx-grid fx-stack-1">
        <div className="inner">
          <div className="reveal" style={{ maxWidth: '780px', margin: '0 auto' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>NOTRE HISTOIRE</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)', textTransform: 'uppercase' }}>
              POURQUOI MKR EXISTE
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              Les meilleurs combattants viennent du même endroit. Le Caucase. Lutte au Daghestan, MMA en Tchétchénie : deux écoles, un héritage. Mais personne ne propose
              un accès structuré à ces méthodes d&apos;entraînement pour les athlètes européens.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              Après des années de voyages au Daghestan et en Tchétchénie, des relations construites avec les coachs locaux,
              et des dizaines d&apos;athlètes accompagnés, MKR Caucasian Camp est devenu le pont entre l&apos;Europe
              francophone et les salles du Caucase Nord.
            </p>
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/heritage/priere-collective-mkr.webp"
        alt="Athlètes en prière collective au camp MKR, héritage et discipline du Caucase"
        label="HÉRITAGE"
        title="PLUS QU'UN CAMP"
        tagline="Discipline, héritage caucasien, fraternité du tapis. Une expérience qui marque autant le corps que l'esprit."
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
              &laquo; Notre mission : donner aux athlètes francophones accès aux méthodes d&apos;entraînement
              de combat les plus efficaces au monde, dans un cadre authentique et encadré. &raquo;
            </p>
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="logi-section fx-grid fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>ÉQUIPE</span>
            <h2>QUI SOMMES-NOUS</h2>
          </div>
          <div className="reveal" style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div className="coach-extended-card">
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
                  Connecté au Caucase depuis 2018. Organise les camps, accompagne chaque candidat en visio
                  et gère les relations avec les coachs et salles partenaires au Daghestan et en Tchétchénie.
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
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.6rem' }}>Au Daghestan (Lutte) et en Tchétchénie (MMA), MKR collabore avec des salles d&apos;entraînement de référence locales.</p>
          </div>
          <ul className="reveal" style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0 0', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {[
              { label: 'Lutte · Makhachkala', desc: 'Daghestan' },
              { label: 'Lutte · Kaspiysk', desc: 'Daghestan' },
              { label: 'MMA · Grozny', desc: 'Tchétchénie' },
            ].map((p, i) => (
              <li key={i} style={{ padding: '0.75rem 1.1rem', border: '1px solid var(--surface-lowest)', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-teko), sans-serif', fontSize: '1rem', letterSpacing: '0.04em' }}>{p.label}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.desc}</span>
              </li>
            ))}
          </ul>
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
