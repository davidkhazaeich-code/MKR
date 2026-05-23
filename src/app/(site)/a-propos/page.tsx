import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import RuslanRevealSlider from '@/components/RuslanRevealSlider'

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
        image="/images/ruslan/heritage/priere-collective-mkr.webp"
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
          <div className="reveal" style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div
              className="layout-split layout-split--balanced"
              style={{ gap: '2rem', alignItems: 'center' }}
            >
              <RuslanRevealSlider
                beforeSrc="/images/ruslan/ruslan-superman-reveal.webp"
                beforeAlt="Ruslan Mukhtarov en singlet équipe de France de lutte, ancien INSEP"
                beforeLabel="L’ATHLÈTE INSEP"
                afterSrc="/images/ruslan/ruslan-portrait-chemise-noire.webp"
                afterAlt="Ruslan Mukhtarov en costume noir, fondateur de MKR Caucasian Camp"
                afterLabel="LE FONDATEUR"
                initialPosition={72}
                beforeObjectPosition="center 22%"
                afterObjectPosition="center 18%"
              />
              <div>
                <span
                  className="label-tag"
                  style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}
                >
                  FONDATEUR · TRIPLE CASQUETTE
                </span>
                <h3 style={{ marginTop: 0 }}>RUSLAN MUKHTAROV</h3>
                <p className="coach-ext-bio" style={{ marginBottom: '0.9rem' }}>
                  32 ans. <strong>Né au Daghestan, d&apos;origine tchétchène</strong>, formé à l&apos;équipe de France de lutte
                  à l&apos;INSEP (2012-2016). Une triple appartenance qui ouvre des portes que personne d&apos;autre
                  ne peut ouvrir pour un athlète francophone.
                </p>
                <p className="coach-ext-bio" style={{ marginBottom: '0.9rem' }}>
                  Sous le costume, le lutteur. Sur le tapis, l&apos;ancien équipe de France. Au Caucase, l&apos;enfant
                  du pays. C&apos;est ce qui rend l&apos;accès aux salles de Makhachkala, Kaspiysk et Grozny possible :
                  Ruslan est connu, attendu, respecté.
                </p>
                <p className="coach-ext-bio">
                  Aujourd&apos;hui il organise les camps MKR, accompagne chaque candidat en visio, gère les coachs
                  et salles partenaires, et s&apos;entraîne lui-même avec les participants sur place.
                </p>
              </div>
            </div>
          </div>

          {/* Notre force : équipe en France + référents sur place */}
          <div className="reveal" style={{ maxWidth: '860px', margin: '3.5rem auto 0' }}>
            <div className="layout-split layout-split--balanced" style={{ gap: '1.5rem' }}>
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

      {/* Galerie parcours Ruslan */}
      <section className="logi-section fx-grid fx-stack-4" aria-labelledby="ruslan-galerie-heading">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              PARCOURS
            </span>
            <h2 id="ruslan-galerie-heading">DU TAPIS FRANÇAIS AUX SALLES DU CAUCASE</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.6rem', maxWidth: '720px' }}>
              Compétitions FFL en bleu sous le maillot tricolore, entraînements à Besançon, retour aux sources
              au Daghestan. Quelques images d&apos;un parcours qui rend MKR possible.
            </p>
          </div>
          <div className="reveal ruslan-galerie-grid">
            <figure className="ruslan-galerie-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-championnat-france-takedown.webp"
                alt="Ruslan Mukhtarov en pleine action de takedown lors d&apos;un championnat de France de lutte, singlet bleu FRA LUTTE"
                loading="lazy"
                width={1600}
                height={1066}
              />
              <figcaption className="ruslan-galerie-caption">Championnat de France · takedown</figcaption>
            </figure>
            <figure className="ruslan-galerie-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-championnat-france-ffl.webp"
                alt="Ruslan Mukhtarov en singlet bleu équipe de France face à un adversaire en rouge, scoreboard FFL"
                loading="lazy"
                width={1600}
                height={1066}
              />
              <figcaption className="ruslan-galerie-caption">FFL · Mukhtarov R. en finale</figcaption>
            </figure>
            <figure className="ruslan-galerie-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-lutte-clinch-nb.webp"
                alt="Ruslan Mukhtarov en clinch lors d&apos;un combat de lutte, photo noir et blanc"
                loading="lazy"
                width={716}
                height={1074}
              />
              <figcaption className="ruslan-galerie-caption">Combat · clinch</figcaption>
            </figure>
            <figure className="ruslan-galerie-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-entrainement-besancon.webp"
                alt="Entraînement de lutte intense à Besançon, projection aérienne d&apos;un partenaire"
                loading="lazy"
                width={635}
                height={635}
              />
              <figcaption className="ruslan-galerie-caption">Entraînement · Besançon</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Partenaire DKDP — David Khazaei */}
      <section
        className="logi-section fx-texture-concrete fx-glow fx-mask-c fx-stack-5"
        aria-labelledby="dkdp-heading"
        style={{ paddingTop: 'clamp(5rem, 10vh, 7rem)', paddingBottom: 'clamp(5rem, 10vh, 7rem)' }}
      >
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="logi-header reveal" style={{ marginBottom: '3rem' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              PARTENAIRE & DIGITAL
            </span>
            <h2 id="dkdp-heading">L&apos;AGENCE DKDP À LA TECH</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem', maxWidth: '680px', lineHeight: 1.55 }}>
              Site, contenu, communication. MKR Caucasian Camp n&apos;avance pas seul : le camp s&apos;appuie sur une agence partenaire genevoise pour toute la partie digitale.
            </p>
          </div>
          <div className="reveal" style={{ maxWidth: '880px', margin: '0 auto' }}>
            <div
              className="layout-split layout-split--balanced"
              style={{ gap: '3rem', alignItems: 'center' }}
            >
              <div className="david-photo-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/team/david-khazaei.webp"
                  alt="David Khazaei, directeur de l'agence DKDP et partenaire digital de MKR Caucasian Camp"
                  loading="lazy"
                  width={1046}
                  height={1400}
                />
              </div>
              <div>
                <span
                  className="label-tag"
                  style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.6rem' }}
                >
                  PARTENAIRE · AGENCE DKDP
                </span>
                <h3 style={{ marginTop: 0, marginBottom: '1.1rem' }}>DAVID KHAZAEI</h3>
                <p className="coach-ext-bio" style={{ marginBottom: '1rem', lineHeight: 1.65 }}>
                  Directeur de l&apos;agence{' '}
                  <a
                    href="https://dkdp.ch"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--primary)',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                      fontWeight: 600,
                    }}
                  >
                    DKDP
                  </a>
                  , basée à Genève. Partenaire de Ruslan sur MKR Caucasian Camp depuis le début du projet : il pilote le site, le contenu et toute la communication digitale du camp.
                </p>
                <p className="coach-ext-bio" style={{ lineHeight: 1.65 }}>
                  Combattant amateur en kickboxing, David enseigne aussi les <strong>cours enfants à la Strike Academy de Genève</strong>. Deux terrains, une même conviction : la rigueur du tapis se transmet à l&apos;écran.
                </p>
              </div>
            </div>
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
