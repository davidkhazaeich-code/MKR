import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import AudienceSwitcher from '@/components/AudienceSwitcher'
import PricingTable from '@/components/PricingTable'
import PlacesRestantes from '@/components/PlacesRestantes'
import {
  MIN_PRICE_PER_ADULT_LABEL,
  FAMILY_BASE_1WEEK_LABEL,
  SOLO_PRICE_1WEEK_LABEL,
} from '@/lib/pricing-copy'
import { PRICING_TIERS, formatEUR } from '@/data/pricing'

const PRICE_FROM_LABEL = `à partir de ${MIN_PRICE_PER_ADULT_LABEL}`

export const metadata: Metadata = {
  title: 'Sessions et Tarifs 2026 - 2027 | Lutte Daghestan, MMA Tchétchénie | MKR',
  description: "Calendrier des 4 camps MMA et Lutte au Caucase : Été 2026, Toussaint 2026, Hiver 2027, Pâques 2027. Lutte au Daghestan, MMA en Tchétchénie. Prix, dates vacances scolaires, places.",
  alternates: { canonical: 'https://mkrcamp.com/sessions' },
}

const SESSIONS = [
  {
    id: 'aout-2026',
    month: 'AOÛ',
    season: 'Session Été · Août 2026',
    name: 'CAMP\nCAUCASIEN',
    dates: '17 AOÛT · 5 SEPTEMBRE 2026',
    intensity: 'Maximale',
    maxCapacity: 15,
    duration: '1 à 3 semaines',
    price: PRICE_FROM_LABEL,
    status: 'open' as const,
    statusLabel: 'Places disponibles',
    delay: '0s',
  },
  {
    id: 'toussaint-2026',
    month: 'OCT',
    season: 'Session Automne · Toussaint 2026',
    name: 'CAMP\nTOUSSAINT',
    dates: '17 OCTOBRE · 7 NOVEMBRE 2026',
    intensity: 'Élevée',
    maxCapacity: 15,
    duration: '1 à 3 semaines',
    price: PRICE_FROM_LABEL,
    status: 'open' as const,
    statusLabel: 'Places disponibles',
    delay: '0.08s',
  },
  {
    id: 'fevrier-2027',
    month: 'FÉV',
    season: 'Session Hiver · Février 2027',
    name: 'CAMP\nHIVER',
    dates: '13 FÉVRIER · 6 MARS 2027',
    intensity: 'Maximale',
    maxCapacity: 15,
    duration: '1 à 3 semaines',
    price: PRICE_FROM_LABEL,
    status: 'open' as const,
    statusLabel: 'Places disponibles',
    delay: '0.16s',
  },
  {
    id: 'paques-2027',
    month: 'AVR',
    season: 'Session Printemps · Pâques 2027',
    name: 'CAMP\nPRINTEMPS',
    dates: '3 · 24 AVRIL 2027',
    intensity: 'Élevée',
    maxCapacity: 15,
    duration: '1 à 3 semaines',
    price: PRICE_FROM_LABEL,
    status: 'open' as const,
    statusLabel: 'Places disponibles',
    delay: '0.24s',
  },
]

export default function SessionsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Sessions et Tarifs', url: 'https://mkrcamp.com/sessions' },
      ]} />

      <PageHero
        label="SESSIONS ET TARIFS"
        title="CHOISIS TON FORMAT.<br/>NOUS ORGANISONS TOUT."
        subtitle="Quatre sessions par an, calées sur les vacances scolaires francophones. Lutte au Daghestan ou MMA en Tchétchénie selon la discipline choisie. Tarifs publics fixes."
      />

      {/* Audience Switcher : 3 types d'inscription */}
      <AudienceSwitcher withHeader={false} />

      {/* Session officielle : carte mise en avant */}
      <section className="sessions-page-section fx-grid fx-glow fx-mask-a fx-stack-2" aria-labelledby="sessions-list-heading">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              SESSIONS OFFICIELLES 2026 / 2027
            </span>
            <h2 id="sessions-list-heading" style={{ scrollMarginTop: '120px' }}>QUATRE SESSIONS, UN OBJECTIF</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem', maxWidth: '720px' }}>
              Une session par saison, calées sur les vacances scolaires des trois zones françaises, suisses romandes et belges. Choisis celle qui colle à ton calendrier.
            </p>
          </div>
          <div className="sessions-grid">
            {SESSIONS.map((s, i) => (
              <article key={i} id={s.id} className="session-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: s.delay, scrollMarginTop: '120px' }}>
                <div className="session-month-bg" aria-hidden="true">{s.month}</div>
                <div className="session-status-badge" data-status={s.status} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                  <PlacesRestantes
                    sessionId={s.id}
                    discipline="lutte"
                    fallbackMax={s.maxCapacity}
                    variant="badge"
                  />
                  <PlacesRestantes
                    sessionId={s.id}
                    discipline="mma"
                    fallbackMax={s.maxCapacity}
                    variant="badge"
                  />
                </div>
                <div className="session-card-body">
                  <span className="session-season">{s.season}</span>
                  <h3 className="session-name" dangerouslySetInnerHTML={{ __html: s.name.replace('\n', '<br/>') }} />
                  <p className="session-dates">{s.dates}</p>
                </div>
                <div className="session-meta">
                  <div className="session-meta-item">
                    <span className="session-meta-label">Intensité</span>
                    <span className="session-meta-value">{s.intensity}</span>
                  </div>
                  <div className="session-meta-item">
                    <span className="session-meta-label">Places</span>
                    <span className="session-meta-value">
                      <PlacesRestantes
                        sessionId={s.id}
                        variant="dual"
                      />
                    </span>
                  </div>
                  <div className="session-meta-item">
                    <span className="session-meta-label">Durée</span>
                    <span className="session-meta-value">{s.duration}</span>
                  </div>
                </div>
                <div className="session-divider" />
                <div className="session-card-footer">
                  <div>
                    <div className="session-price">{s.price}</div>
                    <div className="session-price-sub">Tarif par adulte selon la taille du groupe et la durée. Solo/Duo : {SOLO_PRICE_1WEEK_LABEL} / 1 sem. Club 6-10 : {formatEUR(PRICING_TIERS.club.perAdult[1])} / 1 sem. Forfait Famille (1P+1E) à partir de {FAMILY_BASE_1WEEK_LABEL} la semaine.</div>
                  </div>
                  <Link href={`/inscription?type=session&session=${s.id}`} className="session-cta">POSTULER</Link>
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

      {/* Renvoi /le-camp pour le détail "Inclus / Non inclus" */}
      <section className="logi-section fx-grid fx-stack-3b">
        <div className="inner">
          <div className="group-card reveal" style={{ textAlign: 'center' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>TOUT COMPRIS</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)' }}>VOL INTÉRIEUR, HÉBERGEMENT, 2 REPAS/JOUR, COACHING</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem', maxWidth: '620px', margin: '0.8rem auto 0' }}>
              Le tarif couvre le transfert depuis Istanbul (vol intérieur inclus), l&apos;hébergement de camp, 2 repas par jour, les 2 sessions d&apos;entraînement quotidiennes et l&apos;encadrement local. Le détail complet (inclus / non inclus + journée type) est sur la page Le Camp.
            </p>
            <div style={{ marginTop: '1.4rem' }}>
              <Link href="/le-camp" className="btn-ghost" style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem' }}>
                VOIR LE DÉTAIL SUR LA PAGE LE CAMP
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tarif groupe */}
      <section className="sessions-group fx-grid fx-stack-5" aria-labelledby="group-heading">
        <div className="inner">
          <div className="group-card fx-grain fx-corner-glow reveal">
            <h2 id="group-heading">TU VIENS AVEC TON CLUB ?</h2>
            <p>Tarif dégressif dès 3 personnes (palier Trio à {formatEUR(PRICING_TIERS.trio.perAdult[1])} / pers / sem). À partir de 6, palier Club à {formatEUR(PRICING_TIERS.club.perAdult[1])} / pers / sem. Club entier ou 11+ personnes : devis personnalisé.</p>
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
              <a href="mailto:contact@mkrcamp.com" className="btn-ghost">
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
                MODALITÉS
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>
                PAIEMENT ET CONDITIONS
              </h2>
              <ul className="terms-list">
                <li>Aucun paiement à l&apos;inscription en ligne</li>
                <li>Visio de validation avec l&apos;équipe MKR sous 48h</li>
                <li>Paiement intégral après validation : virement bancaire ou espèces</li>
                <li>Annulation gratuite jusqu&apos;à 60 jours avant le départ</li>
              </ul>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/cgv" className="btn-ghost" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>CGV COMPLÈTES</Link>
                <Link href="/comment-ca-marche" className="btn-ghost" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>COMMENT ÇA MARCHE</Link>
              </div>
            </div>
            <div>
              <table className="table-tonal">
                <thead>
                  <tr><th>Délai</th><th>Remboursement</th></tr>
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

      <SectionCTA
        primaryHref="/inscription"
        primaryLabel="POSTULER AU CAMP"
        ghostHref="/faq"
        ghostLabel="DES QUESTIONS ?"
      />
    </>
  )
}
