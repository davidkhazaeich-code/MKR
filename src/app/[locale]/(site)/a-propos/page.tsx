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

const PILLARS = [
  {
    title: 'AUTHENTICITÉ',
    body: "Pas un camp d'inspiration Caucase. LE camp au Caucase. Vraies salles, vrais coachs locaux, ambiance qui ne s'invente pas.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'DISCIPLINE',
    body: 'Deux entraînements par jour, six jours par semaine. Pas du tourisme sportif : la rigueur du tapis qui fabrique des champions du monde.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 1.5" />
        <path d="M9 2h6" />
      </svg>
    ),
  },
  {
    title: 'FRATERNITÉ',
    body: 'Tu es accueilli comme un des leurs. Sparring avec les locaux, repas partagés, soirées de famille. Le tapis crée des liens.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'TRANSMISSION',
    body: 'Lutte au Daghestan depuis des siècles. MMA en Tchétchénie depuis 30 ans. Tu reçois un héritage, pas une technique.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 21v-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5" />
        <path d="M12 3v10" />
        <path d="m8 7 4-4 4 4" />
      </svg>
    ),
  },
]

export default function AProposPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Accueil', url: 'https://mkrcamp.com/' },
          { name: 'À Propos', url: 'https://mkrcamp.com/a-propos' },
        ]}
      />

      <PageHero
        label="À PROPOS"
        title="L'IMMERSION AU MILIEU DES CHAMPIONS."
        subtitle="MKR Caucasian Camp est fondé par Ruslan Mukhtarov, ancien équipe de France de lutte (INSEP 2012-2016). Voici pourquoi il a créé ce camp."
      />

      {/* L'histoire — editorial 2-col full inner */}
      <section className="logi-section fx-grid fx-stack-1" aria-labelledby="histoire-heading">
        <div className="inner">
          <div className="apropos-history-grid reveal">
            <div className="apropos-history-head">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.7rem' }}>
                NOTRE HISTOIRE
              </span>
              <h2 id="histoire-heading">POURQUOI MKR EXISTE</h2>
              <span className="apropos-history-rule" aria-hidden="true" />
            </div>
            <div className="apropos-history-copy">
              <p>
                Les meilleurs combattants viennent du même endroit. Le Caucase. Lutte au Daghestan,
                MMA en Tchétchénie : deux écoles, un héritage. Mais personne ne propose un accès
                structuré à ces méthodes d&apos;entraînement pour les athlètes européens.
              </p>
              <p>
                Ruslan Mukhtarov a passé quatre ans à l&apos;INSEP en équipe olympique de lutte
                (2012-2016), sous les couleurs de l&apos;équipe de France. De ses voyages au Daghestan
                et en Tchétchénie est née une conviction simple : il fallait ouvrir cette porte aux
                athlètes francophones, en levant tous les obstacles logistiques. MKR, c&apos;est le
                diminutif de Mukhtarov, son nom de famille.
              </p>
              <p className="apropos-history-quote">
                «&nbsp;Je souhaitais mettre en place ce camp pour qu&apos;un maximum d&apos;athlètes,
                MMA comme lutte, puissent y accéder. Faciliter leur trajet, leur séjour. Il n&apos;y a
                besoin de penser à rien, juste à préparer son sac.&nbsp;»
              </p>
            </div>
          </div>

          {/* Logo MKR — brand seal centre */}
          <div className="reveal apropos-brand-seal" aria-hidden="true">
            <span className="apropos-brand-seal-rule" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-white.webp"
              alt=""
              width={260}
              height={120}
              className="apropos-brand-seal-logo"
              loading="lazy"
            />
            <span className="apropos-brand-seal-rule" />
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

      {/* Mission — quote centree (volontairement compact) */}
      <section className="dag-security fx-texture-concrete fx-glow fx-glow-breathe fx-mask-b fx-stack-2">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div
            className="reveal"
            style={{ maxWidth: '820px', textAlign: 'center', margin: '0 auto' }}
          >
            <p
              style={{
                fontFamily: 'var(--font-teko)',
                fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                fontWeight: 600,
                lineHeight: 1.25,
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              &laquo; Notre mission : donner aux athlètes francophones accès aux méthodes
              d&apos;entraînement de combat les plus efficaces au monde, dans un cadre authentique
              et encadré. &raquo;
            </p>
          </div>
        </div>
      </section>

      {/* NOS PILIERS — 4 cards full inner */}
      <section className="logi-section fx-grid fx-stack-3" aria-labelledby="piliers-heading">
        <div className="inner">
          <div className="apropos-section-head reveal">
            <span className="label-tag">NOS PILIERS</span>
            <h2 id="piliers-heading">CE SUR QUOI MKR NE TRANSIGE PAS</h2>
            <p>
              Quatre principes qui guident chaque session, chaque sélection, chaque coach choisi.
              Pas négociables.
            </p>
          </div>
          <div className="reveal apropos-pillars-grid">
            {PILLARS.map((p) => (
              <article key={p.title} className="apropos-pillar">
                <div className="apropos-pillar-icon">{p.icon}</div>
                <h3 className="apropos-pillar-title">{p.title}</h3>
                <p className="apropos-pillar-body">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe — Ruslan slider + bio + sub-cards EN FRANCE / SUR PLACE */}
      <section className="logi-section fx-grid fx-stack-4" aria-labelledby="equipe-heading">
        <div className="inner">
          <div className="apropos-section-head reveal">
            <span className="label-tag">ÉQUIPE · FONDATEUR</span>
            <h2 id="equipe-heading">QUI SOMMES-NOUS</h2>
            <p>
              Un fondateur, une équipe en France, des référents sur place. Tout est conçu pour
              qu&apos;un athlète francophone n&apos;ait à penser qu&apos;à son sac.
            </p>
          </div>

          <div className="reveal apropos-split apropos-split--featured">
            <div className="ruslan-portrait-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-costard-detoure.webp"
                alt="Ruslan Mukhtarov en costume noir, fondateur de MKR Caucasian Camp"
                loading="lazy"
                width={702}
                height={840}
              />
              <span className="ruslan-portrait-card-caption">FONDATEUR MKR</span>
            </div>
            <div>
              <span
                className="label-tag"
                style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.55rem' }}
              >
                FONDATEUR · TRIPLE CASQUETTE
              </span>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>RUSLAN MUKHTAROV</h3>
              <p className="coach-ext-bio" style={{ marginBottom: '0.9rem', lineHeight: 1.65 }}>
                32 ans. <strong>Né au Daghestan, d&apos;origine tchétchène</strong>, formé à
                l&apos;équipe de France de lutte à l&apos;INSEP (2012-2016). Une triple appartenance
                qui ouvre des portes que personne d&apos;autre ne peut ouvrir pour un athlète
                francophone.
              </p>
              <p className="coach-ext-bio" style={{ marginBottom: '0.9rem', lineHeight: 1.65 }}>
                Sous le costume, le lutteur. Sur le tapis, l&apos;ancien équipe de France. Au
                Caucase, l&apos;enfant du pays. C&apos;est ce qui rend l&apos;accès aux salles de
                Makhachkala, Kaspiysk et Grozny possible : Ruslan est connu, attendu, respecté.
              </p>
              <p className="coach-ext-bio" style={{ lineHeight: 1.65 }}>
                Aujourd&apos;hui il organise les camps MKR, accompagne chaque candidat en visio, gère
                les coachs et salles partenaires, et s&apos;entraîne lui-même avec les participants
                sur place.
              </p>
            </div>
          </div>

          {/* Notre force : équipe en France + référents sur place */}
          <div className="reveal apropos-support-grid">
            <div className="content-card fx-grain">
              <span
                className="label-tag"
                style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.55rem' }}
              >
                EN FRANCE
              </span>
              <h3 className="card-title">UNE VRAIE ÉQUIPE</h3>
              <p className="card-body">
                Toute l&apos;administratif et les réseaux sociaux sont gérés depuis la France. Visa,
                vol, navette, hébergement, préparation : tu as un interlocuteur francophone à
                chaque étape, avant et pendant ton camp.
              </p>
            </div>
            <div className="content-card fx-grain">
              <span
                className="label-tag"
                style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.55rem' }}
              >
                SUR PLACE
              </span>
              <h3 className="card-title">DES RÉFÉRENTS DANS LES SALLES</h3>
              <p className="card-body">
                Au Daghestan comme en Tchétchénie, MKR a ses référents locaux. Ils
                t&apos;accompagnent dans les salles d&apos;entraînement, avec Ruslan lui-même, et
                font le lien avec les coachs caucasiens du quotidien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie parcours Ruslan */}
      <section
        className="logi-section fx-grid fx-stack-5"
        aria-labelledby="ruslan-galerie-heading"
      >
        <div className="inner">
          <div className="apropos-section-head reveal">
            <span className="label-tag">PARCOURS</span>
            <h2 id="ruslan-galerie-heading">DU TAPIS FRANÇAIS AUX SALLES DU CAUCASE</h2>
            <p>
              Compétitions FFL en bleu sous le maillot tricolore, entraînements à Besançon, retour
              aux sources au Daghestan. Quelques images d&apos;un parcours qui rend MKR possible.
            </p>
          </div>
          <div className="reveal ruslan-galerie-grid">
            <figure className="ruslan-galerie-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-championnat-france-takedown.webp"
                alt="Ruslan Mukhtarov en pleine action de takedown lors d'un championnat de France de lutte, singlet bleu FRA LUTTE"
                loading="lazy"
                width={1600}
                height={1066}
              />
              <figcaption className="ruslan-galerie-caption">
                Championnat de France · takedown
              </figcaption>
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
              <figcaption className="ruslan-galerie-caption">
                FFL · Mukhtarov R. en finale
              </figcaption>
            </figure>
            <figure className="ruslan-galerie-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ruslan/ruslan-lutte-clinch-nb.webp"
                alt="Ruslan Mukhtarov en clinch lors d'un combat de lutte, photo noir et blanc"
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
                alt="Entraînement de lutte intense à Besançon, projection aérienne d'un partenaire"
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
        className="logi-section fx-texture-concrete fx-glow fx-mask-c fx-stack-6"
        aria-labelledby="dkdp-heading"
      >
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="apropos-section-head reveal">
            <span className="label-tag">PARTENAIRE &amp; DIGITAL</span>
            <h2 id="dkdp-heading">L&apos;AGENCE DKDP À LA TECH</h2>
            <p>
              Site, contenu, communication. MKR Caucasian Camp n&apos;avance pas seul : le camp
              s&apos;appuie sur une agence partenaire genevoise pour toute la partie digitale.
            </p>
          </div>
          <div className="reveal apropos-split apropos-split--featured">
            <div className="david-photo-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/team/david-khazaei.webp"
                alt="David Khazaei, directeur de l'agence DKDP et partenaire digital de MKR Caucasian Camp"
                loading="lazy"
                width={896}
                height={1200}
              />
            </div>
            <div>
              <span
                className="label-tag"
                style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.55rem' }}
              >
                PARTENAIRE · AGENCE DKDP
              </span>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>DAVID KHAZAEI</h3>
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
                , basée à Genève. Partenaire de Ruslan sur MKR Caucasian Camp depuis le début du
                projet : il pilote le site, le contenu et toute la communication digitale du camp.
              </p>
              <p className="coach-ext-bio" style={{ lineHeight: 1.65 }}>
                Combattant amateur en kickboxing, David enseigne aussi les{' '}
                <strong>cours enfants à la Strike Academy de Genève</strong>. Deux terrains, une
                même conviction : la rigueur du tapis se transmet à l&apos;écran.
              </p>

              {/* Container DKDP : compact, sous le bio, dans la colonne droite */}
              <div className="dkdp-info-card dkdp-info-card--compact" aria-label="L'agence DKDP">
                <div className="dkdp-info-head">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="dkdp-info-logo"
                    src="/images/team/dkdp-logo-white.webp"
                    alt="Logo DKDP, agence digitale à Genève"
                    loading="lazy"
                    width={2180}
                    height={374}
                  />
                  <p className="dkdp-info-tagline">
                    <strong>Agence digitale genevoise.</strong> Sites web, SEO, IA et formation pour les entreprises de Suisse romande.
                  </p>
                </div>

                <div className="dkdp-info-grid">
                  <div className="dkdp-info-service">
                    <span className="dkdp-info-service-dot" aria-hidden="true" />
                    <span className="dkdp-info-service-label">Sites web</span>
                  </div>
                  <div className="dkdp-info-service">
                    <span className="dkdp-info-service-dot" aria-hidden="true" />
                    <span className="dkdp-info-service-label">SEO &amp; GEO</span>
                  </div>
                  <div className="dkdp-info-service">
                    <span className="dkdp-info-service-dot" aria-hidden="true" />
                    <span className="dkdp-info-service-label">IA &amp; Automatisation</span>
                  </div>
                  <div className="dkdp-info-service">
                    <span className="dkdp-info-service-dot" aria-hidden="true" />
                    <span className="dkdp-info-service-label">Formation</span>
                  </div>
                </div>

                <div className="dkdp-info-foot">
                  <div className="dkdp-info-stats">
                    <div>
                      <span className="dkdp-info-stat-num">700+</span>
                      <span className="dkdp-info-stat-label">Clients</span>
                    </div>
                    <div>
                      <span className="dkdp-info-stat-num">10 ans</span>
                      <span className="dkdp-info-stat-label">D&apos;expérience</span>
                    </div>
                  </div>
                  <a
                    className="dkdp-info-cta"
                    href="https://dkdp.ch"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Découvrir l&apos;agence</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                </div>
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
