'use client'

import { useTranslations } from 'next-intl'
import { WorldMap } from '@/components/WorldMap'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import Icon from './Icon'

export default function VoyageReveal() {
  const t = useTranslations('home.voyage_reveal')
  const { containerRef } = useScrollReveal({ imgScale: { from: 1.8, to: 1.35 } })

  const ROUTES = [
    { start: { lat: 46.2044, lng: 6.1432,   label: 'Genève'   }, end: { lat: 41.0082, lng: 28.9784, label: 'Istanbul' } },
    { start: { lat: 45.5017, lng: -73.5673, label: 'Montréal' }, end: { lat: 41.0082, lng: 28.9784, label: 'Istanbul' } },
    { start: { lat: 41.0082, lng: 28.9784,  label: 'Istanbul' }, end: { lat: 42.9849, lng: 47.5047, label: 'Dagestan' }, color: '#2ECC71', routeLabel: t('trajet_label') },
  ]

  return (
    <div
      ref={containerRef}
      className="voyage-reveal-outer"
      style={{ height: 'calc(1400px + 100vh)' }}
    >
      <div className="voyage-reveal-sticky">
        <div className="voyage-reveal-map" style={{ transformOrigin: '58% 26%' }}>
          <WorldMap dots={ROUTES} lineColor="#C84B31" loop animationDuration={2.2} />
        </div>

        <div className="voyage-reveal-overlay" aria-hidden="true" />

        <div className="voyage-reveal-container">
          <div className="voyage-reveal-content">
            <span className="label-tag">{t('label')}</span>
            <h2>
              {t('title_line1')}<br />
              {t('title_line2_prefix')}<span className="highlight">{t('title_line2_highlight')}</span>
            </h2>

            <div className="voyage-reveal-steps">
              <div className="voyage-reveal-step">
                <span className="voyage-reveal-num">01</span>
                <span>{t('steps.01')}</span>
              </div>
              <div className="voyage-reveal-step">
                <span className="voyage-reveal-num">02</span>
                <span>{t('steps.02')}</span>
              </div>
              <div className="voyage-reveal-step">
                <span className="voyage-reveal-num">03</span>
                <span>{t('steps.03')}</span>
              </div>
            </div>

            <div className="voyage-reveal-badges">
              <span className="voyage-badge">{t('badges.visa')}</span>
              <span className="voyage-badge">{t('badges.flight')}</span>
              <span className="voyage-badge">{t('badges.transfers')}</span>
              <span className="voyage-badge voyage-badge--green">
                <Icon name="shield-check" size={12} />
                {t('badges.secure')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
