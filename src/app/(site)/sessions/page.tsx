import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import AudienceSwitcher from '@/components/AudienceSwitcher'
import PricingTable from '@/components/PricingTable'

export const metadata: Metadata = {
  title: 'Sessions & Tarifs | MKR Caucasian Camp | Prix Camps MMA Dagestan',
  description: "Calendrier 2026 des camps MMA & Lutte au Caucase. Prix, dates, places disponibles. Reserve ta session.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/sessions' },
}

const SESSIONS = [
  {
    month: 'AOÛ',
    season: 'Session Été · Août 2026',
    name: 'CAMP\nDAGHESTANAIS',
    dates: '17 AOÛT · 5 SEPTEMBRE 2026',
    intensity: 'Maximale',
    places: '15 max.',
    duration: '3 semaines',
    price: '2 900 €',
    status: 'open' as const,
    statusLabel: 'Places disponibles',
    delay: '0s',
  },
]

const INCLUDES = [
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 28 L16 6 L28 28 Z" /><line x1="10" y1="20" x2="22" y2="20" />
      </svg>
    ),
    title: 'Transport local',
    desc: 'Transferts aéroport-camp et deplacements sur place pris en charge.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="10" width="24" height="18" /><path d="M4 16 L16 10 L28 16" />
      </svg>
    ),
    title: 'Hebergement',
    desc: 'Logement de camp partage, propre et fonctionnel.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="16" cy="16" r="10" /><path d="M10 16 L16 12 L22 16 L16 20 Z" />
      </svg>
    ),
    title: '2 sessions/jour',
    desc: 'Entrainement biquotidien avec des coachs locaux.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="16" cy="10" r="5" /><path d="M6 28 C6 20 10 16 16 16 S26 20 26 28" />
      </svg>
    ),
    title: 'Coachs locaux',
    desc: 'Entraineurs daghestanais, champions et veterans. Equipe complete de 9 coachs experimentes.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 24 L10 14 L16 20 L22 10 L28 18" /><circle cx="6" cy="8" r="2" />
      </svg>
    ),
    title: 'Excursions (en option)',
    desc: 'Sorties culturelles et randonnees en montagne le jour de repos, en option.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="6" width="20" height="20" /><line x1="6" y1="14" x2="26" y2="14" />
        <line x1="14" y1="14" x2="14" y2="26" />
      </svg>
    ),
    title: '2 repas/jour',
    desc: 'Petit-dejeuner et dejeuner pris en charge. Nutrition adaptee a l\'effort, cuisine locale.',
  },
]

export default function SessionsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Sessions & Tarifs', url: 'https://mkrcaucasiancamp.com/sessions' },
      ]} />

      <PageHero
        label="SESSIONS & TARIFS"
        title="CHOISIS TON FORMAT.<br/>NOUS ORGANISONS TOUT."
        subtitle="Rejoindre la session groupe, organiser ton camp sur mesure ou venir avec ton club. Tarifs publics fixes."
      />

      {/* Audience Switcher : 3 types d'inscription */}
      <AudienceSwitcher withHeader={false} />

      {/* Session officielle : carte mise en avant */}
      <section className="sessions-page-section fx-grid fx-glow fx-mask-a fx-stack-2" aria-labelledby="sessions-list-heading">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              SESSION OFFICIELLE 2026
            </span>
            <h2 id="sessions-list-heading">UN GROUPE, UNE DATE, UN OBJECTIF</h2>
          </div>
          <div className="sessions-grid">
            {SESSIONS.map((s, i) => (
              <article key={i} className="session-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: s.delay }}>
                <div className="session-month-bg" aria-hidden="true">{s.month}</div>
                <div className="session-status-badge" data-status={s.status}>
                  {s.statusLabel}
                </div>
                <div className="session-card-body">
                  <span className="session-season">{s.season}</span>
                  <h3 className="session-name" dangerouslySetInnerHTML={{ __html: s.name.replace('\n', '<br/>') }} />
                  <p className="session-dates">{s.dates}</p>
                </div>
                <div className="session-meta">
                  <div className="session-meta-item">
                    <span className="session-meta-label">Intensite</span>
                    <span className="session-meta-value">{s.intensity}</span>
                  </div>
                  <div className="session-meta-item">
                    <span className="session-meta-label">Places</span>
                    <span className="session-meta-value">{s.places}</span>
                  </div>
                  <div className="session-meta-item">
                    <span className="session-meta-label">Duree</span>
                    <span className="session-meta-value">{s.duration}</span>
                  </div>
                </div>
                <div className="session-divider" />
                <div className="session-card-footer">
                  <div>
                    <div className="session-price">{s.price}</div>
                    <div className="session-price-sub">Tarif adulte. Enfant 8-17 (avec parent) : 1 900 € / 3 sem.</div>
                  </div>
                  <Link href="/inscription?type=session" className="session-cta">POSTULER</Link>
                </div>
              </article>
            ))}
          </div>
          <p className="logi-updated" style={{ marginTop: '2rem', textAlign: 'center' }}>
            Tes dates ne correspondent pas ?{' '}
            <Link href="/inscription?type=custom" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
              Découvre le camp sur mesure
            </Link>
            {' '}(délai 90 jours minimum).
          </p>
        </div>
      </section>

      {/* Pricing Table : grille tarifaire publique */}
      <PricingTable />

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/action/shadowboxing-group.webp"
        alt="Groupe d'athlètes en shadowboxing dans une salle du Caucase"
        label="INTENSITE"
        title="CHAQUE SESSION COMPTE"
        tagline="Groupe reduit, coaching personnalise. L'energie collective pousse chacun au-dela de ses limites."
      />

      {/* Ce qui est inclus */}
      <section className="sessions-includes fx-texture-concrete fx-glow fx-mask-b fx-stack-4" aria-labelledby="includes-heading">
        <div className="fx-glow-orb fx-glow-orb--left fx-glow-breathe" />
        <div className="inner">
          <div className="sessions-includes-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              TOUT COMPRIS
            </span>
            <h2 id="includes-heading" className="sessions-includes-title">
              CE QUI EST INCLUS
            </h2>
          </div>
          <div className="include-grid">
            {INCLUDES.map((item, i) => (
              <div key={i} className="include-card fx-grain reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                {item.icon}
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarif groupe */}
      <section className="sessions-group fx-grid fx-stack-5" aria-labelledby="group-heading">
        <div className="inner">
          <div className="group-card fx-grain fx-corner-glow reveal">
            <h2 id="group-heading">TU VIENS AVEC TON CLUB ?</h2>
            <p>Prix degressif a partir de 5 personnes. Contacte-nous directement pour un devis sur mesure.</p>
            <img
              src="/images/environment/communal-meal.webp"
              alt="Groupe d'athlètes au camp MKR Caucasian Camp"
              width={800}
              height={343}
              loading="lazy"
              className="group-card-img"
            />
            <div className="group-card-cta">
              <a href="https://wa.me/33666177691" target="_blank" rel="noopener noreferrer" className="btn-primary">
                CONTACTER PAR WHATSAPP
              </a>
              <a href="mailto:contact@mkrcaucasiancamp.com" className="btn-ghost">
                ENVOYER UN EMAIL
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Modalites */}
      <section className="sessions-terms fx-texture-basalt fx-glow fx-mask-d fx-stack-6">
        <div className="fx-glow-orb fx-glow-orb--right fx-glow-breathe" />
        <div className="inner">
          <div className="layout-split layout-split--balanced reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
                MODALITES
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>
                PAIEMENT ET CONDITIONS
              </h2>
              <ul className="terms-list">
                <li>Acompte de 30% a la confirmation de ta candidature</li>
                <li>Solde 30 jours avant le debut du camp</li>
                <li>Paiement par virement bancaire, Stripe (CB) ou PayPal</li>
                <li>Annulation gratuite jusqu&apos;a 60 jours avant le depart</li>
              </ul>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/cgv" className="btn-ghost" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>CGV COMPLETES</Link>
                <Link href="/comment-ca-marche" className="btn-ghost" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>COMMENT CA MARCHE</Link>
              </div>
            </div>
            <div>
              <table className="table-tonal">
                <thead>
                  <tr><th>Delai</th><th>Remboursement</th></tr>
                </thead>
                <tbody>
                  <tr><td>&gt; 60 jours</td><td>100%</td></tr>
                  <tr><td>30 - 60 jours</td><td>50%</td></tr>
                  <tr><td>&lt; 30 jours</td><td>Non remboursable</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Reassurance band */}
      <div className="reassurance-band">
        {[
          { label: 'Tout compris', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3,10 8,15 17,5"/></svg> },
          { label: 'Coachs locaux', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="7" r="3"/><path d="M4 18c0-4 2.5-6 6-6s6 2 6 6"/></svg> },
          { label: 'Transport gere', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 14 L10 4 L18 14"/><line x1="6" y1="10" x2="14" y2="10"/></svg> },
          { label: 'Places limitees', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="14" height="14"/><line x1="10" y1="7" x2="10" y2="13"/><line x1="7" y1="10" x2="13" y2="10"/></svg> },
          { label: 'Paiement sécurise', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="8" width="12" height="10"/><path d="M7 8V5a3 3 0 016 0v3"/></svg> },
        ].map((r, i) => (
          <div key={i} className="reassurance-item">
            {r.icon}
            {r.label}
          </div>
        ))}
      </div>

      <SectionCTA
        primaryHref="/inscription"
        primaryLabel="RESERVE TA PLACE"
        ghostHref="/faq"
        ghostLabel="DES QUESTIONS ?"
      />
    </>
  )
}
