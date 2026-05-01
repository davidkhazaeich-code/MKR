const FACILITATOR_ITEMS = [
  {
    title: 'Visa Russie',
    desc: 'Lettre d\'invitation officielle, questionnaire UE, accompagnement complet du dossier.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="6" y="4" width="20" height="24" rx="1.5" />
        <line x1="10" y1="9" x2="22" y2="9" />
        <line x1="10" y1="13" x2="22" y2="13" />
        <line x1="10" y1="17" x2="18" y2="17" />
        <circle cx="22" cy="22" r="3" />
        <path d="M20 22l1.5 1.5L24 21" />
      </svg>
    ),
  },
  {
    title: 'Vol intérieur',
    desc: 'Istanbul → Makhachkala inclus dans le package. Tu n\'organises que ton vol intl.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 18l11-3 5-9 2 1-3 9 9 3-1 2-10-1-2 6-2 1-1-5-6-1-1-2 1-1z" />
      </svg>
    ),
  },
  {
    title: 'Transferts',
    desc: 'Aéroport Makhachkala → camp en 1h30. Véhicule MKR à ton arrivée. Tous déplacements inclus.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M4 22V14l3-7h18l3 7v8" />
        <circle cx="9" cy="22" r="2.5" />
        <circle cx="23" cy="22" r="2.5" />
        <line x1="11.5" y1="22" x2="20.5" y2="22" />
        <line x1="4" y1="14" x2="28" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Hébergement',
    desc: 'Logement de camp confortable. Chambre famille disponible. Espaces communs partagés.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M4 14L16 4l12 10" />
        <path d="M7 13v15h18V13" />
        <rect x="13" y="20" width="6" height="8" />
      </svg>
    ),
  },
  {
    title: '2 repas / jour',
    desc: 'Petit-déjeuner et déjeuner inclus. Cuisine caucasienne adaptée aux athlètes (protéines, légumes).',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="16" cy="16" r="11" />
        <line x1="9" y1="4" x2="9" y2="13" />
        <path d="M9 13c0 2 0 4 0 4" />
        <line x1="13" y1="4" x2="13" y2="13" />
        <line x1="11" y1="4" x2="11" y2="11" />
        <path d="M22 4c-2 2-3 5-3 9s1 5 3 5v10" />
      </svg>
    ),
  },
  {
    title: 'Encadrement',
    desc: '9 coachs expérimentés. Sessions Lutte adultes, Lutte enfants et MMA. Coach jeunesse dédié 8-17 ans.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="16" cy="10" r="4" />
        <path d="M6 27c0-5 4-9 10-9s10 4 10 9" />
        <path d="M11 18l-2 6" />
        <path d="M21 18l2 6" />
      </svg>
    ),
  },
]

interface FacilitatorBandProps {
  /** Affiche le titre + eyebrow au-dessus */
  withHeader?: boolean
}

export default function FacilitatorBand({ withHeader = true }: FacilitatorBandProps) {
  return (
    <section
      id="facilitator"
      className="facilitator-band fx-texture-concrete fx-glow fx-mask-c fx-stack-3"
      aria-labelledby="facilitator-heading"
    >
      <div className="fx-glow-orb fx-glow-orb--right fx-glow-breathe" aria-hidden="true" />
      <div className="inner">
        {withHeader && (
          <div className="facilitator-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              MKR ORGANISE TOUT
            </span>
            <h2 id="facilitator-heading" className="facilitator-title">
              ON S&apos;OCCUPE DE TOUT.<br/>
              TU N&apos;AS QU&apos;À T&apos;ENTRAÎNER.
            </h2>
            <p className="facilitator-sub">
              Du dossier visa à ton arrivée sur le tapis : 6 prestations incluses dans tous nos camps,
              peu importe le format choisi.
            </p>
          </div>
        )}

        <div className="facilitator-grid">
          {FACILITATOR_ITEMS.map((item, i) => (
            <article
              key={i}
              className="facilitator-card reveal"
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div className="facilitator-card-icon" aria-hidden="true">
                {item.icon}
              </div>
              <h3 className="facilitator-card-title">{item.title}</h3>
              <p className="facilitator-card-desc">{item.desc}</p>
            </article>
          ))}
        </div>

        <p className="facilitator-footnote reveal">
          Tu fais une seule chose : t&apos;entraîner et progresser. Le reste, on le coordonne pour toi.
        </p>
      </div>
    </section>
  )
}
