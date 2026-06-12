'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import Icon from './Icon'
import {
  calculatePrice,
  pricePerAdult,
  isOnQuote,
  formatEUR,
  FAMILY_PRICING,
  type Duration,
} from '@/data/pricing'

export interface EstimatorLabels {
  label: string
  title: string
  sub: string
  adultsLabel: string
  childrenLabel: string
  durationLabel: string
  adultsHint: string
  childrenHint: string
  week: Record<'1' | '2' | '3' | 'plus', string>
  customValue: string
  customHint: string
  resultEyebrow: string
  totalLabel: string
  perAdultLabel: string
  familyBaseLabel: string
  familyExtraLabel: string
  quoteValue: string
  quoteHint: string
  includedNote: string
  disclaimer: string
  ctaApply: string
  ctaQuote: string
}

const MIN_ADULTS = 1
const MAX_ADULTS = 11
const MAX_CHILDREN = 4
const WEEK_OPTIONS: (Duration | 'plus')[] = [1, 2, 3, 'plus']

interface StepperProps {
  label: string
  hint: string
  value: number
  min: number
  max: number
  maxSuffix?: string
  onChange: (next: number) => void
}

function Stepper({ label, hint, value, min, max, maxSuffix, onChange }: StepperProps) {
  const atMax = value >= max
  const display = atMax && maxSuffix ? `${max}${maxSuffix}` : `${value}`
  return (
    <div className="estimator-control">
      <span className="estimator-control-label">{label}</span>
      <div className="estimator-stepper" role="group" aria-label={label}>
        <button
          type="button"
          className="estimator-step-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="-1"
        >
          <Icon name="minus" size={18} />
        </button>
        <span className="estimator-step-value" aria-live="polite">{display}</span>
        <button
          type="button"
          className="estimator-step-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={atMax}
          aria-label="+1"
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
      <span className="estimator-control-hint">{hint}</span>
    </div>
  )
}

export default function PriceEstimator({ labels }: { labels: EstimatorLabels }) {
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [weeks, setWeeks] = useState<Duration | 'plus'>(1)

  const customWeeks = weeks === 'plus'
  const wd: Duration = customWeeks ? 1 : weeks
  const tooManyAdults = isOnQuote(adults)
  const quote = tooManyAdults || customWeeks
  const total = quote ? 0 : calculatePrice({ adults, children, weeks: wd })
  const perAdult = pricePerAdult(adults, wd)
  const isFamily = children > 0

  // Breakdown lines (localised via passed labels, no FR-only helper text).
  // Modèle famille (2026-06-12) : forfait 1 parent + 1 enfant + 790 € forfaitaire par
  // personne supplémentaire (2e parent OU enfant en plus).
  const breakdown: { label: string; value: string }[] = []
  if (!quote && isFamily) {
    const additional = Math.max(0, adults + children - 2)
    breakdown.push({ label: labels.familyBaseLabel, value: formatEUR(FAMILY_PRICING.base[wd]) })
    if (additional > 0) {
      breakdown.push({
        label: `${additional} × ${labels.familyExtraLabel}`,
        value: formatEUR(additional * FAMILY_PRICING.additionalPerson),
      })
    }
  }

  const applyType: 'famille' | 'groupe' | 'session' = isFamily ? 'famille' : adults >= 6 ? 'groupe' : 'session'

  return (
    <section
      className="estimator-section fx-grid fx-glow fx-mask-c fx-stack-2"
      aria-labelledby="estimator-heading"
    >
      <div className="fx-glow-orb fx-glow-orb--right fx-glow-breathe" aria-hidden="true" />
      <div className="inner">
        <div className="estimator-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            {labels.label}
          </span>
          <h2 id="estimator-heading" className="estimator-title">{labels.title}</h2>
          <p className="estimator-sub">{labels.sub}</p>
        </div>

        <div className="estimator-grid reveal" style={{ transitionDelay: '0.1s' }}>
          {/* Controls */}
          <div className="estimator-controls">
            <Stepper
              label={labels.adultsLabel}
              hint={labels.adultsHint}
              value={adults}
              min={MIN_ADULTS}
              max={MAX_ADULTS}
              maxSuffix="+"
              onChange={setAdults}
            />
            <Stepper
              label={labels.childrenLabel}
              hint={labels.childrenHint}
              value={children}
              min={0}
              max={MAX_CHILDREN}
              onChange={setChildren}
            />
            <div className="estimator-control">
              <span className="estimator-control-label">{labels.durationLabel}</span>
              <div className="estimator-weeks" role="group" aria-label={labels.durationLabel}>
                {WEEK_OPTIONS.map(w => (
                  <button
                    key={String(w)}
                    type="button"
                    className={`estimator-week-btn${weeks === w ? ' is-active' : ''}`}
                    aria-pressed={weeks === w}
                    onClick={() => setWeeks(w)}
                  >
                    {labels.week[String(w) as '1' | '2' | '3' | 'plus']}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="estimator-result">
            <span className="estimator-result-eyebrow">{labels.resultEyebrow}</span>

            {quote ? (
              <>
                <span className="estimator-total estimator-total--quote">
                  {tooManyAdults ? labels.quoteValue : labels.customValue}
                </span>
                <p className="estimator-quote-hint">
                  {tooManyAdults ? labels.quoteHint : labels.customHint}
                </p>
              </>
            ) : (
              <>
                <span className="estimator-total-label">{labels.totalLabel}</span>
                <span className="estimator-total">{formatEUR(total)}</span>
                {!isFamily && (
                  <span className="estimator-per-adult">{formatEUR(perAdult)} {labels.perAdultLabel}</span>
                )}
                {breakdown.length > 0 && (
                  <ul className="estimator-breakdown">
                    {breakdown.map((b, i) => (
                      <li key={i}>
                        <span>{b.label}</span>
                        <span>{b.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            <p className="estimator-included">
              <Icon name="check-circle-fill" size={15} className="estimator-included-icon" />
              {labels.includedNote}
            </p>

            <div className="estimator-cta">
              {quote ? (
                tooManyAdults ? (
                  <Link href="/contact" className="btn-primary">{labels.ctaQuote}</Link>
                ) : (
                  <Link href={{ pathname: '/inscription', query: { type: 'custom' } }} className="btn-primary">
                    {labels.ctaQuote}
                  </Link>
                )
              ) : (
                <Link href={{ pathname: '/inscription', query: { type: applyType } }} className="btn-primary">
                  {labels.ctaApply}
                </Link>
              )}
            </div>

            <p className="estimator-disclaimer">{labels.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
