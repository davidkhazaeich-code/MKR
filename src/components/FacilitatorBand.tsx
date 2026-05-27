import { useTranslations } from 'next-intl'
import Icon, { type IconName } from './Icon'

type FacilitatorItemKey = 'visa' | 'flight' | 'transfers' | 'accommodation' | 'meals' | 'coaching'

const FACILITATOR_ITEMS: Array<{ key: FacilitatorItemKey; icon: IconName }> = [
  { key: 'visa', icon: 'passport' },
  { key: 'flight', icon: 'plane' },
  { key: 'transfers', icon: 'taxi' },
  { key: 'accommodation', icon: 'hotel' },
  { key: 'meals', icon: 'food' },
  { key: 'coaching', icon: 'team' },
]

interface FacilitatorBandProps {
  /** Affiche le titre + eyebrow au-dessus */
  withHeader?: boolean
}

export default function FacilitatorBand({ withHeader = true }: FacilitatorBandProps) {
  const t = useTranslations('home.facilitator_band')
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
              {t('label')}
            </span>
            <h2 id="facilitator-heading" className="facilitator-title">
              {t('title_line1')}<br/>
              {t('title_line2')}
            </h2>
            <p className="facilitator-sub">
              {t('subtitle')}
            </p>
          </div>
        )}

        <div className="facilitator-grid">
          {FACILITATOR_ITEMS.map((item, i) => (
            <article
              key={item.key}
              className="facilitator-card reveal"
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div className="facilitator-card-icon" aria-hidden="true">
                <Icon name={item.icon} size={32} />
              </div>
              <h3 className="facilitator-card-title">{t(`items.${item.key}.title`)}</h3>
              <p className="facilitator-card-desc">{t(`items.${item.key}.desc`)}</p>
            </article>
          ))}
        </div>

        <div className="facilitator-force reveal" aria-labelledby="facilitator-force-heading">
          <div className="facilitator-force-col">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem' }}>{t('force_label')}</span>
            <h3 id="facilitator-force-heading" className="facilitator-force-title">{t('force_title')}</h3>
          </div>
          <div className="facilitator-force-col">
            <p className="facilitator-force-text">
              {t('force_text')}
            </p>
          </div>
        </div>

        <p className="facilitator-footnote reveal">
          {t('footnote')}
        </p>
      </div>
    </section>
  )
}
