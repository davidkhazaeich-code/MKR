import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { hydrateRegistrationTypes } from '@/data/registration-types'
import { PRICING_TIERS, formatEUR } from '@/data/pricing'
import { FAMILY_BASE_1WEEK_LABEL, FAMILY_EXTRA_CHILD_1WEEK_LABEL } from '@/lib/pricing-copy'
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
  const t = useTranslations('home.audience_switcher')
  const tData = useTranslations('data.registration-types')

  const types = hydrateRegistrationTypes(tData as never, {
    familyBase1weekLabel: FAMILY_BASE_1WEEK_LABEL,
    familyExtraChild1weekLabel: FAMILY_EXTRA_CHILD_1WEEK_LABEL,
    duoPerAdult1week: formatEUR(PRICING_TIERS.duo.perAdult[1]),
    trioPerAdult1week: formatEUR(PRICING_TIERS.trio.perAdult[1]),
    clubPerAdult1week: formatEUR(PRICING_TIERS.club.perAdult[1]),
  })

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
              {t('label')}
            </span>
            <h2 id="audiences-heading" className="audience-switcher-title">
              {t('title_line1')}<br/>{t('title_line2')}
            </h2>
            <p className="audience-switcher-sub">
              {t('subtitle')}
            </p>
          </div>
        )}

        <div className="audience-grid">
          {types.map((type, i) => (
            <article
              key={type.id}
              className={`audience-card audience-card--photo reveal${type.recommended ? ' audience-card--recommended' : ''}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="audience-card-photo" aria-hidden="true">
                <Image
                  src={type.image}
                  alt={type.image_alt}
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
                <span className="audience-card-flag">{t('card.recommended_flag')}</span>
              )}
              <span className="audience-card-badge">{type.badge}</span>
              <h3 className="audience-card-title">{type.label}</h3>
              <p className="audience-card-desc">{type.description}</p>

              <ul className="audience-card-meta">
                <li>
                  <span className="audience-card-meta-label">{t('card.meta_dates')}</span>
                  <span className="audience-card-meta-value">{type.dates}</span>
                </li>
                <li>
                  <span className="audience-card-meta-label">{t('card.meta_duration')}</span>
                  <span className="audience-card-meta-value">{type.duration}</span>
                </li>
                <li>
                  <span className="audience-card-meta-label">{t('card.meta_min_persons')}</span>
                  <span className="audience-card-meta-value">
                    {type.minPersons === 1 ? t('card.person_singular') : t('card.person_plural', { n: type.minPersons })}
                  </span>
                </li>
              </ul>

              <Link href={type.href as Parameters<typeof Link>[0]['href']} className="audience-card-cta">
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
