import Link from 'next/link'
import {
  PRICING_TIERS,
  FAMILY_PRICING,
  formatEUR,
  type Duration,
  type GroupTier,
} from '@/data/pricing'

interface PricingTableProps {
  /** Affiche le titre + eyebrow au-dessus */
  withHeader?: boolean
  /** Variation compacte (sans forfait famille détaillé) */
  compact?: boolean
}

const GROUP_TIERS_ORDER: GroupTier[] = ['duo', 'trio', 'club']
const DURATIONS: Duration[] = [1, 2, 3]

export default function PricingTable({ withHeader = true, compact = false }: PricingTableProps) {
  const privateTier = PRICING_TIERS.private

  return (
    <section
      id="pricing"
      className="pricing-table-section fx-texture-basalt fx-glow fx-mask-b fx-stack-3"
      aria-labelledby="pricing-heading"
    >
      <div className="fx-glow-orb fx-glow-orb--left fx-glow-breathe" aria-hidden="true" />
      <div className="inner">
        {withHeader && (
          <div className="pricing-table-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              TARIFS PUBLICS
            </span>
            <h2 id="pricing-heading" className="pricing-table-title">
              GRILLE PAR TAILLE DE GROUPE
            </h2>
            <p className="pricing-table-sub">
              Tarifs identiques pour la session officielle, le camp Sur Mesure et les groupes/clubs.
              Plus vous êtes nombreux, plus le tarif par personne baisse. Pas de réduction discrétionnaire.
            </p>
          </div>
        )}

        {/* Grille 3 paliers groupe (1-2 / 3-5 / 6-10) */}
        <div
          className="pricing-grid reveal"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '1080px', transitionDelay: '0.1s' }}
        >
          {GROUP_TIERS_ORDER.map((tierKey, i) => {
            const tier = PRICING_TIERS[tierKey]
            return (
              <div key={tierKey} className="pricing-card content-card fx-grain fx-corner-glow">
                <span className="pricing-card-tag">{tier.rangeLabel}</span>
                <h3 className="pricing-card-title">{tier.label}</h3>
                <p className="pricing-card-sub">{tier.pitch}</p>
                <ul className="pricing-card-list">
                  {DURATIONS.map(w => (
                    <li key={w}>
                      <span className="pricing-list-label">
                        {w === 1 ? '1 semaine' : `${w} semaines`}
                      </span>
                      <span className="pricing-list-value">{formatEUR(tier.perAdult[w])} <small style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 400 }}>/ pers.</small></span>
                    </li>
                  ))}
                </ul>
                {i === 0 && (
                  <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    S&apos;applique aussi au solo (1 adulte)
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Bande "Salle privée / Devis" */}
        <div
          className="pricing-quote-band reveal"
          style={{
            maxWidth: '1080px',
            margin: '0 auto 3rem',
            padding: '1.4rem 1.75rem',
            background: 'rgba(255,255,255,0.025)',
            borderRadius: '4px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            transitionDelay: '0.15s',
          }}
        >
          <div style={{ flex: '1 1 360px' }}>
            <span className="pricing-card-tag" style={{ marginBottom: '0.4rem' }}>
              {privateTier.rangeLabel.toUpperCase()}
            </span>
            <h3 style={{ fontFamily: 'var(--font-teko), sans-serif', fontSize: '1.4rem', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
              {privateTier.label}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
              {privateTier.pitch}
            </p>
          </div>
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Sur devis
            </span>
            <Link href="/contact" className="btn-ghost" style={{ fontSize: '0.78rem', padding: '0.6rem 1.1rem' }}>
              DEMANDER UN DEVIS
            </Link>
          </div>
        </div>

        {/* Section dédiée Famille */}
        {!compact && (
          <div
            className="pricing-family reveal"
            style={{ transitionDelay: '0.2s', maxWidth: '1080px', padding: '2.2rem' }}
          >
            <span className="pricing-card-tag" style={{ display: 'block', textAlign: 'center', marginBottom: '0.4rem' }}>
              FORMULE FAMILLE
            </span>
            <h3 className="pricing-family-title" style={{ marginBottom: '0.5rem', fontSize: '1.15rem' }}>
              FORFAIT PARENT + ENFANT
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto 1.6rem', lineHeight: 1.5 }}>
              Tu pars avec ton enfant 8-17 ans. Le forfait couvre <strong>1 parent + 1 enfant</strong>.
              Chaque enfant supplémentaire est facturé au tarif &quot;enfant supp.&quot;. Si ton conjoint participe aussi,
              les 2 parents passent au tarif Solo/Duo ({formatEUR(PRICING_TIERS.duo.perAdult[1])} par personne et par semaine) et chaque enfant est ajouté à {formatEUR(FAMILY_PRICING.extraChildPerWeek[1])} par semaine.
            </p>

            <div
              className="pricing-grid"
              style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '760px', marginBottom: 0, gap: '1.25rem' }}
            >
              {/* Forfait base */}
              <div className="pricing-card content-card fx-grain" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="pricing-card-tag">FORFAIT BASE</span>
                <h4 className="pricing-card-title" style={{ fontSize: '1.15rem' }}>1 parent + 1 enfant inclus</h4>
                <p className="pricing-card-sub">Forfait fixe selon la durée. Le premier enfant est compris.</p>
                <ul className="pricing-card-list">
                  {DURATIONS.map(w => (
                    <li key={w}>
                      <span className="pricing-list-label">{w === 1 ? '1 semaine' : `${w} semaines`}</span>
                      <span className="pricing-list-value">{formatEUR(FAMILY_PRICING.base[w])}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Enfant supplémentaire */}
              <div className="pricing-card content-card fx-grain" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="pricing-card-tag">ENFANT SUPPLÉMENTAIRE</span>
                <h4 className="pricing-card-title" style={{ fontSize: '1.15rem' }}>À ajouter au forfait</h4>
                <p className="pricing-card-sub">Tarif par enfant additionnel, ou par enfant si les deux parents participent.</p>
                <ul className="pricing-card-list">
                  {DURATIONS.map(w => (
                    <li key={w}>
                      <span className="pricing-list-label">{w === 1 ? '1 semaine' : `${w} semaines`}</span>
                      <span className="pricing-list-value">+{formatEUR(FAMILY_PRICING.extraChildPerWeek[w])}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Exemple :</strong> 1 parent + 2 enfants sur 1 semaine = {formatEUR(FAMILY_PRICING.base[1])} + {formatEUR(FAMILY_PRICING.extraChildPerWeek[1])} = {formatEUR(FAMILY_PRICING.base[1] + FAMILY_PRICING.extraChildPerWeek[1])}.
              {' '}2 parents + 1 enfant sur 2 semaines = 2 × {formatEUR(PRICING_TIERS.duo.perAdult[2])} + {formatEUR(FAMILY_PRICING.extraChildPerWeek[2])} = {formatEUR(2 * PRICING_TIERS.duo.perAdult[2] + FAMILY_PRICING.extraChildPerWeek[2])}.
            </p>
          </div>
        )}

        <div className="pricing-included reveal" style={{ transitionDelay: '0.3s' }}>
          <h3 className="pricing-included-title">INCLUS DANS TOUS LES TARIFS</h3>
          <ul className="pricing-included-list">
            <li>Hébergement de camp</li>
            <li>2 repas par jour</li>
            <li>2 sessions d&apos;entraînement / jour</li>
            <li>Vol intérieur Istanbul → Makhachkala</li>
            <li>Transferts aéroport-camp</li>
            <li>Encadrement par 9 coachs expérimentés</li>
            <li>Lettre d&apos;invitation visa Russie</li>
            <li>Suivi préparatoire à distance</li>
          </ul>
          <p className="pricing-not-included">
            <strong>Non inclus</strong> : vol international aller-retour, frais de visa, assurance voyage, équipement personnel.
          </p>
        </div>

        <div className="pricing-cta reveal" style={{ transitionDelay: '0.4s' }}>
          <Link href="/inscription" className="btn-primary">
            CHOISIR MON CAMP
          </Link>
          <Link href="/contact" className="btn-ghost">
            UNE QUESTION ?
          </Link>
        </div>
      </div>
    </section>
  )
}
