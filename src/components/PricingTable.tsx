import Link from 'next/link'
import { ADULT_PRICING, CHILD_PRICING, FAMILY_EXAMPLES, calculatePrice, formatEUR } from '@/data/pricing'

interface PricingTableProps {
  /** Affiche le titre + eyebrow au-dessus */
  withHeader?: boolean
  /** Variation compacte (sans famille examples) */
  compact?: boolean
}

export default function PricingTable({ withHeader = true, compact = false }: PricingTableProps) {
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
              GRILLE DE PRIX FIXE
            </h2>
            <p className="pricing-table-sub">
              Pas de surprise. Tarifs identiques pour la session groupe, le camp sur mesure et les groupes/clubs.
              Pas de réduction, pas de variations.
            </p>
          </div>
        )}

        <div className="pricing-grid reveal" style={{ transitionDelay: '0.1s' }}>
          {/* Adulte */}
          <div className="pricing-card content-card fx-grain fx-corner-glow">
            <span className="pricing-card-tag">ADULTE</span>
            <h3 className="pricing-card-title">18 ans et plus</h3>
            <p className="pricing-card-sub">Tarif par adulte, identique en groupe.</p>
            <ul className="pricing-card-list">
              {Object.values(ADULT_PRICING).map(p => (
                <li key={p.weeks}>
                  <span className="pricing-list-label">{p.label}</span>
                  <span className="pricing-list-value">{formatEUR(p.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enfant */}
          <div className="pricing-card content-card fx-grain fx-corner-glow">
            <span className="pricing-card-tag">ENFANT / ADO</span>
            <h3 className="pricing-card-title">8 à 17 ans</h3>
            <p className="pricing-card-sub">
              Avec parent participant obligatoire. Programme adapté (Lutte enfants, Junior, MMA junior).
            </p>
            <ul className="pricing-card-list">
              {Object.values(CHILD_PRICING).map(p => (
                <li key={p.weeks}>
                  <span className="pricing-list-label">{p.label}</span>
                  <span className="pricing-list-value">{formatEUR(p.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {!compact && (
          <div className="pricing-family reveal" style={{ transitionDelay: '0.2s' }}>
            <h3 className="pricing-family-title">EXEMPLES FAMILLE / GROUPE (BASE 3 SEMAINES, AJUSTABLE 1 OU 2 SEM)</h3>
            <div className="pricing-family-grid">
              {FAMILY_EXAMPLES.map(ex => {
                const total = calculatePrice({ adults: ex.adults, children: ex.children, weeks: 3 })
                return (
                  <div key={ex.label} className="pricing-family-item">
                    <span className="pricing-family-label">{ex.label}</span>
                    <span className="pricing-family-value">{formatEUR(total)}</span>
                    <span className="pricing-family-detail">
                      {ex.adults > 0 && `${ex.adults} × 2 900`}
                      {ex.adults > 0 && ex.children > 0 && ' + '}
                      {ex.children > 0 && `${ex.children} × 1 900`}
                    </span>
                  </div>
                )
              })}
            </div>
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
