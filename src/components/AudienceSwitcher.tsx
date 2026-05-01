import Image from 'next/image'
import Link from 'next/link'
import { REGISTRATION_TYPES } from '@/data/registration-types'

const ICONS: Record<string, React.ReactNode> = {
  session: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="10" cy="11" r="4" />
      <circle cx="22" cy="11" r="4" />
      <path d="M3 26c0-3.5 3-6 7-6s7 2.5 7 6" />
      <path d="M15 26c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  ),
  custom: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5" y="7" width="22" height="20" rx="1.5" />
      <line x1="5" y1="12" x2="27" y2="12" />
      <line x1="11" y1="4" x2="11" y2="9" />
      <line x1="21" y1="4" x2="21" y2="9" />
      <circle cx="11" cy="18" r="1.2" fill="currentColor" />
      <circle cx="16" cy="18" r="1.2" fill="currentColor" />
      <circle cx="21" cy="18" r="1.2" fill="currentColor" />
    </svg>
  ),
  groupe: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="16" cy="9" r="3.5" />
      <circle cx="7" cy="11" r="3" />
      <circle cx="25" cy="11" r="3" />
      <path d="M9 28c0-3 2.5-5.5 7-5.5S23 25 23 28" />
      <path d="M2 28c0-2.8 1.8-5 4.5-5.3" />
      <path d="M30 28c0-2.8-1.8-5-4.5-5.3" />
    </svg>
  ),
}

interface AudienceSwitcherProps {
  /** Affiche un titre et eyebrow au-dessus du grid */
  withHeader?: boolean
  /** Variation compacte (cards plus petites, moins de texte) */
  compact?: boolean
}

export default function AudienceSwitcher({ withHeader = true, compact = false }: AudienceSwitcherProps) {
  return (
    <section
      id="audiences"
      className={`audience-switcher${compact ? ' audience-switcher--compact' : ''} fx-grid fx-glow fx-stack-2`}
      aria-labelledby="audiences-heading"
    >
      <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" aria-hidden="true" />
      <div className="inner">
        {withHeader && (
          <div className="audience-switcher-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              POUR QUI ?
            </span>
            <h2 id="audiences-heading" className="audience-switcher-title">
              CHOISIS COMMENT<br/>TU VIENS AU CAMP
            </h2>
            <p className="audience-switcher-sub">
              MKR organise tout. Tu rejoins notre session, tu pars sur tes dates, ou tu viens avec ton club.
            </p>
          </div>
        )}

        <div className="audience-grid">
          {REGISTRATION_TYPES.map((type, i) => (
            <article
              key={type.id}
              className={`audience-card audience-card--photo reveal${type.recommended ? ' audience-card--recommended' : ''}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="audience-card-photo" aria-hidden="true">
                <Image
                  src={type.image}
                  alt={type.imageAlt}
                  fill
                  sizes="(max-width: 980px) 100vw, 33vw"
                  className="audience-card-photo-img"
                />
                <div className="audience-card-photo-overlay" />
                <div className="audience-card-icon-overlay">
                  {ICONS[type.id]}
                </div>
              </div>
              {type.recommended && (
                <span className="audience-card-flag">RECOMMANDÉ</span>
              )}
              <span className="audience-card-badge">{type.badge}</span>
              <h3 className="audience-card-title">{type.label}</h3>
              <p className="audience-card-desc">{type.description}</p>

              <ul className="audience-card-meta">
                <li>
                  <span className="audience-card-meta-label">Dates</span>
                  <span className="audience-card-meta-value">{type.dates}</span>
                </li>
                <li>
                  <span className="audience-card-meta-label">Durée</span>
                  <span className="audience-card-meta-value">{type.duration}</span>
                </li>
                <li>
                  <span className="audience-card-meta-label">À partir de</span>
                  <span className="audience-card-meta-value">
                    {type.minPersons === 1 ? '1 personne' : `${type.minPersons} personnes`}
                  </span>
                </li>
              </ul>

              <Link href={type.href} className="audience-card-cta">
                {type.cta}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14" aria-hidden="true">
                  <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
                  <polyline points="9,4 13,8 9,12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
