import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import PricingTable from '@/components/PricingTable'

export const metadata: Metadata = {
  title: 'Camp Famille | MKR Caucasian Camp | MMA et Lutte parent-enfant au Daghestan',
  description: "Viens t'entraîner en famille au Daghestan. Parent et enfant 8-17 ans côte à côte sur le tapis. Programme adapté, tarifs famille publics, encadrement spécialisé.",
  alternates: { canonical: 'https://mkrcamp.com/familles' },
}

const PILLARS = [
  {
    title: 'Parent obligatoire',
    desc: "Enfant 8-17 ans toujours accompagné d'un parent participant. Un seul tunnel d'inscription pour toute la famille.",
  },
  {
    title: 'Programme adapté',
    desc: "Parent dans les sessions adultes (Lutte ou MMA), enfant dans les sessions Lutte enfants à 10h30 et 17h30. Vous vous retrouvez aux repas et excursions.",
  },
  {
    title: 'Coach jeunesse dédié',
    desc: "Un coach formé à la pédagogie des plus jeunes encadre les sessions enfants. Ratio 1 coach pour 5 enfants maximum.",
  },
  {
    title: 'Hébergement famille',
    desc: "Chambre privée pour la famille (selon disponibilité). Repas communautaires entre familles et athlètes solo.",
  },
  {
    title: 'Communication parents',
    desc: "Briefing chaque fin de session, photos quotidiennes, contact d'urgence permanent. Tu peux assister aux sessions de ton enfant.",
  },
  {
    title: 'Tarifs famille publics',
    desc: "Pas de remise affichée. Tarif adulte fixe et tarif enfant fixe (1 900 € / 3 sem par enfant). Total transparent.",
  },
]

const FAMILY_TESTIMONIALS = [
  {
    name: 'Karim D.',
    role: 'Père · Genève',
    discipline: 'Avec son fils de 13 ans',
    quote: "Mon fils est revenu transformé. Plus discipliné, plus confiant. Et il a appris des choses qu'aucun coach en France ne lui aurait montrées. On y retourne l'année prochaine, en famille.",
  },
  {
    name: 'Sophie L.',
    role: 'Mère · Lyon',
    discipline: 'Avec son fils de 11 ans et sa fille de 14 ans',
    quote: "On hésitait à embarquer les enfants. Le coach jeunesse les a captivés dès la première session. Trois semaines plus tard, ma fille veut faire de la lutte en compétition. Une expérience qu'on n'oubliera jamais.",
  },
  {
    name: 'Marc T.',
    role: 'Père · Bruxelles',
    discipline: 'Avec son fils de 16 ans',
    quote: "À 16 ans, mon fils était au stade où on perd souvent les ados. Le camp lui a redonné le sens de l'effort, du respect, de la ténacité. Pour moi en parallèle, c'est une remise en forme totale.",
  },
]

export default function FamillesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Camp Famille', url: 'https://mkrcamp.com/familles' },
      ]} />

      <PageHero
        label="EN FAMILLE"
        title="VIENS T'ENTRAÎNER<br/>EN FAMILLE."
        subtitle="Parent et enfant 8-17 ans côte à côte sur le tapis. Une expérience qui se transmet."
      />

      {/* Cinematic reveal — parent-enfant tapis */}
      <CinematicReveal
        image="/images/ruslan/kids/parent-enfant-tapis-mkr.webp"
        alt="Père et fils côte à côte sur le tapis du camp MKR, transmission générationnelle"
        label="HÉRITAGE"
        title="L'HÉRITAGE<br/>SE TRANSMET"
        tagline="Au Daghestan, la lutte est une affaire de famille depuis des générations. Tu viens t'inscrire dans cette tradition avec ton enfant."
      />

      {/* Description split */}
      <section className="logi-section fx-grid fx-stack-1 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
                LE PRINCIPE
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
                UN CAMP, DEUX EXPÉRIENCES
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                Tu viens au camp comme adulte (sessions Lutte ou MMA à 10h30 / 11h00 et 17h30 / 18h00).
                Ton enfant suit le programme Lutte enfants en parallèle (10h30 et 17h30, encadrement spécialisé).
                Vous vous retrouvez aux repas, excursions, et moments libres.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                MKR organise tout : visa, vol intérieur Istanbul-Makhachkala, transferts, hébergement famille,
                2 repas par jour, encadrement par 9 coachs expérimentés.
                Tu embarques ton sac et celui de ton enfant.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                <strong>Important</strong> : l&apos;enfant 8-17 ans doit être obligatoirement accompagné d&apos;un parent
                participant au camp. Pas de prise en charge enfant seul.
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/ruslan/kids/kids-alignes-tapis-vertical.webp"
                  alt="Jeunes lutteurs alignés sur le tapis, école de lutte daghestanaise"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/ruslan/coaches/Antoine-portrait-makhachkala-mkr.webp"
                  alt="Athlète adulte au camp MKR, programme parallèle aux enfants"
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

      {/* Piliers */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              POURQUOI EN FAMILLE
            </span>
            <h2>NOTRE APPROCHE FAMILLE</h2>
          </div>
          <div className="grid-3x2">
            {PILLARS.map((p, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{p.title}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section dynamique kids */}
      <section className="dag-security fx-texture-concrete fx-glow fx-mask-d fx-stack-4">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <div>
              <figure className="photo-card">
                <img
                  src="/images/ruslan/kids/kids-sparring-encadre-mkr.webp"
                  alt="Jeunes lutteurs en sparring contrôlé sous supervision du coach"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
            </div>
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
                CADRE SÉCURISANT
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
                TON ENFANT EST<br/>ENTRE DE BONNES MAINS
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                Pas de KO autorisé, sparring strictement contrôlé, supervision permanente. Les techniques
                sont enseignées progressivement par un coach jeunesse formé. L&apos;objectif : transmettre
                les fondamentaux du Caucase dans un cadre adapté à l&apos;âge.
              </p>
              <ul className="logi-check-list" style={{ marginTop: '1.5rem' }}>
                <li><strong>Tapis olympiques homologués</strong>, salle dédiée enfants</li>
                <li><strong>Ratio 1 coach pour 5 enfants</strong> maximum</li>
                <li><strong>Briefing parents</strong> chaque fin de session</li>
                <li><strong>Photos quotidiennes</strong> partagées avec les parents</li>
                <li><strong>Contact d&apos;urgence</strong> permanent (médical + sécurité)</li>
                <li><strong>Plan repas adapté</strong> aux jeunes athlètes (protéines, hydratation)</li>
              </ul>
              <p className="pull-quote" style={{ marginTop: '1.5rem' }}>
                &laquo; On hésitait à embarquer les enfants. Le coach jeunesse les a captivés dès la première session. &raquo;
              </p>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sophie L. · Mère · Lyon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs famille */}
      <PricingTable withHeader={true} />

      {/* Témoignages parents */}
      <section className="logi-section fx-grid fx-mask-a fx-stack-6 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              ILS SONT VENUS EN FAMILLE
            </span>
            <h2>CE QU&apos;ILS EN DISENT</h2>
          </div>
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {FAMILY_TESTIMONIALS.map((t, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.55', fontSize: '0.92rem', fontStyle: 'italic' }}>
                  &laquo; {t.quote} &raquo;
                </p>
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', fontSize: '0.7rem' }}>
                    {t.name}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '0.2rem' }}>
                    {t.role}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>
                    {t.discipline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process inscription famille */}
      <section className="logi-section fx-texture-concrete fx-mask-b fx-stack-7">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              INSCRIPTION FAMILLE
            </span>
            <h2>COMMENT INSCRIRE TA FAMILLE</h2>
          </div>
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            <div className="content-card fx-grain fx-corner-glow reveal">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem', fontSize: '0.6rem' }}>ÉTAPE 01</span>
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>Choisis ton format</h3>
              <p className="card-body" style={{ fontSize: '0.85rem' }}>
                Rejoindre une de nos quatre sessions officielles (Été 2026, Toussaint 2026, Hiver 2027, Pâques 2027) calées sur les vacances scolaires, ou camp sur mesure (tes dates, 90 jours minimum). Dans le formulaire, coche &quot;Tu viens avec ta famille ?&quot;.
              </p>
            </div>
            <div className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: '0.08s' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem', fontSize: '0.6rem' }}>ÉTAPE 02</span>
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>Indique tes enfants</h3>
              <p className="card-body" style={{ fontSize: '0.85rem' }}>
                Précise le nombre d&apos;enfants (1, 2 ou 3) et leurs âges (entre 8 et 17 ans).
                Tarif enfant selon durée : 1 000 € / 1 sem · 1 400 € / 2 sem · 1 900 € / 3 sem.
              </p>
            </div>
            <div className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: '0.16s' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem', fontSize: '0.6rem' }}>ÉTAPE 03</span>
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>Validation et acompte</h3>
              <p className="card-body" style={{ fontSize: '0.85rem' }}>
                Réponse sous 48h. Si validée : acompte 30%, certificat médical pour chaque membre, guide de préparation.
                Solde 30 jours avant le départ.
              </p>
            </div>
          </div>
          <div className="reveal" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/inscription?type=famille" className="btn-primary" style={{ marginRight: '1rem' }}>
              INSCRIRE MA FAMILLE
            </Link>
            <Link href="/sessions" className="btn-ghost">
              VOIR LES 4 SESSIONS
            </Link>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel="INSCRIRE MA FAMILLE"
        ghostHref="/contact"
        ghostLabel="POSER UNE QUESTION"
      />
    </>
  )
}
