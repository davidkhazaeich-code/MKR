import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'Programme Lutte Enfants | MKR Caucasian Camp | Lutte jeunesse au Daghestan',
  description: "Programme de lutte adapte aux jeunes athletes (8-15 ans). Pedagogie progressive, encadrement specialise, fondamentaux daghestanais transmis dans un cadre adapte.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/programme/lutte-enfants' },
}

const PILLARS = [
  { title: 'Pedagogie progressive', desc: 'Les fondamentaux d\'abord. On construit le geste juste avant l\'intensite. Chaque enfant progresse a son rythme.' },
  { title: 'Encadrement specialise', desc: 'Coachs formes a la pedagogie jeunesse. Securite renforcee, communication adaptee, suivi individuel.' },
  { title: 'Heritage daghestanais', desc: 'Les techniques ancestrales du Caucase, transmises avec patience aux nouvelles generations.' },
  { title: 'Esprit du tapis', desc: 'Respect, discipline, perseverance. La lutte forge le caractere autant que le corps.' },
  { title: 'Groupes de niveau', desc: 'Sessions par tranche d\'age et de niveau. Apprentissage adapte sans pression de competition.' },
  { title: 'Cadre securisant', desc: 'Salles equipees, tapis homologues, supervision constante. Les parents peuvent assister aux sessions.' },
]

const SESSION_FLOW = [
  { time: '15 min', activity: 'Echauffement ludique', desc: 'Jeux, mobilite, activation. Mise en route progressive et bienveillante.' },
  { time: '20 min', activity: 'Technique de base', desc: 'Demonstration pas-a-pas. Chutes, postures, premieres saisies. Repetition guidee.' },
  { time: '15 min', activity: 'Drills par paires', desc: 'Application en duo, niveaux similaires. Coach circule et corrige.' },
  { time: '15 min', activity: 'Situations encadrees', desc: 'Mises en situation supervisees. Jamais de sparring libre, toujours sous controle du coach.' },
  { time: '10 min', activity: 'Retour au calme', desc: 'Etirements, debrief, points cles. Chaque enfant repart avec un objectif pour la prochaine session.' },
]

export default function ProgrammeLutteEnfantsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Programme', url: 'https://mkrcaucasiancamp.com/programme' },
        { name: 'Lutte enfants', url: 'https://mkrcaucasiancamp.com/programme/lutte-enfants' },
      ]} />
      <PageHero
        label="LUTTE ENFANTS"
        title="LA NOUVELLE GENERATION<br/>DU CAUCASE"
        subtitle="Programme jeunesse adapte. Pedagogie progressive, encadrement specialise."
        breadcrumb={[
          { href: '/programme', label: 'Programme' },
          { href: '/programme/lutte-enfants', label: 'Lutte enfants' },
        ]}
      />

      {/* Description */}
      <section className="logi-section fx-grid fx-stack-1 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>LE PROGRAMME</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>LUTTE POUR LES JEUNES</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Au Daghestan, on commence la lutte tres jeune. Les champions du monde y ont tous appris les memes
                gestes, dans les memes salles, par les memes coachs. MKR ouvre cet acces aux jeunes athletes
                europeens dans un cadre adapte a leur age.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le programme Lutte enfants est conduit par des coachs formes a la pedagogie jeunesse. La progression
                est progressive, jamais forcee. L&apos;objectif : transmettre la passion et les fondamentaux,
                sans pression ni competition prematuree.
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/ruslan/kids/kids-alignes-tapis-vertical.webp"
                  alt="Jeunes lutteurs alignes sur le tapis, ecole de lutte daghestanaise"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/ruslan/kids/kid-stretching-debout.webp"
                  alt="Jeune lutteur en echauffement individuel, salle de lutte du Daghestan"
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

      {/* Cinematic reveal — kid lutteur Rossiya */}
      <CinematicReveal
        image="/images/ruslan/kids/kid-lutteur-rouge-rossiya.webp"
        alt="Jeune lutteur en kimono rouge, ecole daghestanaise"
        label="TRANSMISSION"
        title="LE GESTE JUSTE,<br/>AVANT TOUT"
        tagline="Fondamentaux d&apos;abord. Confiance, technique, respect du tapis. Tout commence la."
      />

      {/* Piliers */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PILIERS</span>
            <h2>NOTRE APPROCHE</h2>
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
          <p className="logi-updated" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            Sessions matin a 10h30 et apres-midi a 17h30. Pas de chevauchement avec les sessions adultes.
          </p>
        </div>
      </section>

      {/* Pour les parents : section rassurance */}
      <section className="dag-security fx-texture-concrete fx-glow fx-mask-d fx-stack-5">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
                POUR LES PARENTS
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
                TON ENFANT EST<br/>ENTRE DE BONNES MAINS
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                Le programme Lutte enfants est <strong>strictement encadré par un coach jeunesse</strong> formé
                à la pédagogie sportive des plus jeunes. Pas de KO, sparring contrôlé, supervision constante.
                Tu participes au camp en parallèle, et tu peux assister aux sessions de ton enfant quand tu le souhaites.
              </p>
              <ul className="logi-check-list" style={{ marginTop: '1.5rem' }}>
                <li><strong>Parent obligatoire</strong> : enfant 8-17 ans toujours accompagné d&apos;un parent participant au camp</li>
                <li><strong>Ratio sécurité</strong> : 1 coach pour 5 enfants maximum</li>
                <li><strong>Communication parents</strong> : briefing chaque fin de session, photos quotidiennes</li>
                <li><strong>Cadre adapté</strong> : tapis olympiques homologués, salle dédiée, surveillance permanente</li>
                <li><strong>Tarif enfant fixe</strong> : 1 900 CHF / 3 semaines, 1 400 CHF / 2 sem, 1 000 CHF / 1 sem</li>
              </ul>
              <p className="pull-quote" style={{ marginTop: '1.5rem' }}>
                &laquo; Mon fils est revenu transformé. Plus discipliné, plus confiant. Et il a appris des choses
                qu&apos;aucun coach en France ne lui aurait montrées. &raquo;
              </p>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Karim D. · Père · Genève</span>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/ruslan/kids/kids-course-flou-1.webp"
                  alt="Jeunes lutteurs en course d'echauffement, dynamique du groupe"
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

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel="INSCRIRE MON ENFANT"
        ghostHref="/contact"
        ghostLabel="POSER UNE QUESTION"
      />
    </>
  )
}
