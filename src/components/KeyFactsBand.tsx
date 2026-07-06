import Icon, { type IconName } from './Icon'

export interface KeyFact {
  icon: IconName
  label: string
  sub?: string
}

interface KeyFactsBandProps {
  facts: KeyFact[]
  className?: string
}

/**
 * Bandeau de faits cles sous le hero des pages destination.
 * Message match avec les composants d'annonces Google Ads (visa inclus,
 * vol interieur, places limitees, paiement apres visio, entree selective).
 */
export default function KeyFactsBand({ facts, className }: KeyFactsBandProps) {
  return (
    <section className={`kfb${className ? ` ${className}` : ''}`} aria-label="Points clés">
      <div className="inner">
        <ul className="kfb-list reveal">
          {facts.map((fact, i) => (
            <li key={i} className="kfb-item" style={{ transitionDelay: `${i * 0.05}s` }}>
              <span className="kfb-icon" aria-hidden="true">
                <Icon name={fact.icon} size={20} />
              </span>
              <span className="kfb-text">
                <span className="kfb-label">{fact.label}</span>
                {fact.sub && <span className="kfb-sub">{fact.sub}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
