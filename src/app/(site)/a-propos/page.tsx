import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata = buildMetadata({
  title: 'À propos | Ruslan Mukhtarov, fondateur | MKR Caucasian Camp',
  description: "Ruslan Mukhtarov, fondateur de MKR Caucasian Camp. Ancien équipe de France de lutte, INSEP 2012-2016. MKR organise tout pour les athlètes francophones au Caucase.",
  path: '/a-propos',
})
export default function AProposPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'À Propos', url: 'https://mkrcamp.com/a-propos' },
      ]} />

      <PageHero
        label="À PROPOS"
        title="L'IMMERSION AU MILIEU DES CHAMPIONS."
        subtitle="MKR Caucasian Camp est fondé par Ruslan Mukhtarov, ancien équipe de France de lutte (INSEP 2012-2016). Voici pourquoi il a créé ce camp."
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
              Ruslan Mukhtarov a passé quatre ans à l&apos;INSEP en équipe olympique de lutte (2012-2016), sous les couleurs de l&apos;équipe de France.
              De ses voyages au Daghestan et en Tchétchénie est née une conviction simple : il fallait ouvrir cette porte aux athlètes francophones, en levant
              tous les obstacles logistiques. MKR, c&apos;est le diminutif de Mukhtarov, son nom de famille.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              «&nbsp;Je souhaitais mettre en place ce camp pour qu&apos;un maximum d&apos;athlètes, MMA comme lutte, puissent y accéder. Faciliter leur trajet, leur séjour.
              Il n&apos;y a besoin de penser à rien, juste à préparer son sac.&nbsp;»
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
                  alt="Ruslan Mukhtarov, fondateur de MKR Caucasian Camp et ancien équipe de France de lutte"
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
                <h3>RUSLAN MUKHTAROV</h3>
                <p className="coach-ext-bio" style={{ marginBottom: '0.9rem' }}>
                  32 ans, entraîneur de lutte et de MMA. Ruslan a commencé la lutte à 12 ans et a intégré l&apos;équipe olympique
                  à l&apos;INSEP de 2012 à 2016, sous les couleurs de l&apos;équipe de France.
                </p>
                <p className="coach-ext-bio">
                  Aujourd&apos;hui, il organise les camps MKR au Caucase, accompagne chaque candidat en visio et gère
                  les relations avec les coachs et salles partenaires au Daghestan (Lutte) et en Tchétchénie (MMA).
                  Sur place, il s&apos;entraîne lui-même dans les salles avec les participants.
                </p>
              </div>
            </div>
          </div>

          {/* Notre force : équipe en France + référents sur place */}
          <div className="reveal" style={{ maxWidth: '860px', margin: '2.5rem auto 0' }}>
            <div className="layout-split layout-split--balanced" style={{ gap: '1.25rem' }}>
              <div className="content-card fx-grain">
                <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.6rem' }}>EN FRANCE</span>
                <h3 className="card-title">UNE VRAIE ÉQUIPE</h3>
                <p className="card-body">
                  Toute l&apos;administratif et les réseaux sociaux sont gérés depuis la France. Visa, vol, navette, hébergement,
                  préparation : tu as un interlocuteur francophone à chaque étape, avant et pendant ton camp.
                </p>
              </div>
              <div className="content-card fx-grain">
                <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.6rem' }}>SUR PLACE</span>
                <h3 className="card-title">DES RÉFÉRENTS DANS LES SALLES</h3>
                <p className="card-body">
                  Au Daghestan comme en Tchétchénie, MKR a ses référents locaux. Ils t&apos;accompagnent dans les salles
                  d&apos;entraînement, avec Ruslan lui-même, et font le lien avec les coachs caucasiens du quotidien.
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
