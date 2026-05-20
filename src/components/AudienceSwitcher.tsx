import Image from 'next/image'
import Link from 'next/link'
import { REGISTRATION_TYPES } from '@/data/registration-types'
import Icon, { type IconName } from './Icon'

const ICONS: Record<string, IconName> = {
  session: 'team',
  custom: 'calendar-event',
  famille: 'parent',
  groupe: 'community',
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
              QUATRE FAÇONS DE VENIR
            </span>
            <h2 id="audiences-heading" className="audience-switcher-title">
              CHOISIS TON FORMAT<br/>D&apos;INSCRIPTION
            </h2>
            <p className="audience-switcher-sub">
              Tu pars seul, en duo, en famille ou avec ton club ? On a un format pour chaque profil. Lutte au Daghestan ou MMA en Tchétchénie : visa, vol intérieur depuis Istanbul, transferts, hébergement, repas et encadrement sont coordonnés sur place par MKR.
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
                  <Icon name={ICONS[type.id]} size={32} />
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
                <Icon name="arrow-right" size={14} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
