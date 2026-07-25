import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
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

export default async function PricingTable({ withHeader = true, compact = false }: PricingTableProps) {
  const t = await getTranslations('pricing_table')
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
              {t('eyebrow')}
            </span>
            <h2 id="pricing-heading" className="pricing-table-title">
              {t('title')}
            </h2>
            <p className="pricing-table-sub">
              {t('sub')}
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
                <span className="pricing-card-tag">{t(`tiers.${tierKey}.range`)}</span>
                <h3 className="pricing-card-title">{t(`tiers.${tierKey}.label`)}</h3>
                <p className="pricing-card-sub">{t(`tiers.${tierKey}.pitch`)}</p>
                <ul className="pricing-card-list">
                  {DURATIONS.map(w => (
                    <li key={w}>
                      <span className="pricing-list-label">
                        {w === 1 ? t('week_singular') : t('week_plural', { count: w })}
                      </span>
                      <span className="pricing-list-value">{formatEUR(tier.perAdult[w])} <small style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 400 }}>{t('per_person')}</small></span>
                    </li>
                  ))}
                </ul>
                {i === 0 && (
                  <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {t('solo_note')}
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
              {t('tiers.private.range').toUpperCase()}
            </span>
            <h3 style={{ fontFamily: 'var(--font-teko), sans-serif', fontSize: '1.4rem', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
              {t('tiers.private.label')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
              {t('tiers.private.pitch')}
            </p>
          </div>
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {t('quote_value')}
            </span>
            <Link href="/contact" className="btn-ghost" style={{ fontSize: '0.78rem', padding: '0.6rem 1.1rem' }}>
              {t('quote_cta')}
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
              {t('family.eyebrow')}
            </span>
            <h3 className="pricing-family-title" style={{ marginBottom: '0.5rem', fontSize: '1.15rem' }}>
              {t('family.title')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto 1.6rem', lineHeight: 1.5 }}>
              {t.rich('family.intro', {
                b: (chunks) => <strong>{chunks}</strong>,
                duoPrice: formatEUR(PRICING_TIERS.duo.perAdult[1]),
                extraChild: formatEUR(FAMILY_PRICING.extraChildPerWeek[1]),
              })}
            </p>

            <div
              className="pricing-grid"
              style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '760px', marginBottom: 0, gap: '1.25rem' }}
            >
              {/* Forfait base */}
              <div className="pricing-card content-card fx-grain" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="pricing-card-tag">{t('family.base_tag')}</span>
                <h4 className="pricing-card-title" style={{ fontSize: '1.15rem' }}>{t('family.base_title')}</h4>
                <p className="pricing-card-sub">{t('family.base_sub')}</p>
                <ul className="pricing-card-list">
                  {DURATIONS.map(w => (
                    <li key={w}>
                      <span className="pricing-list-label">{w === 1 ? t('week_singular') : t('week_plural', { count: w })}</span>
                      <span className="pricing-list-value">{formatEUR(FAMILY_PRICING.base[w])}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Enfant supplémentaire */}
              <div className="pricing-card content-card fx-grain" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="pricing-card-tag">{t('family.extra_tag')}</span>
                <h4 className="pricing-card-title" style={{ fontSize: '1.15rem' }}>{t('family.extra_title')}</h4>
                <p className="pricing-card-sub">{t('family.extra_sub')}</p>
                <ul className="pricing-card-list">
                  {DURATIONS.map(w => (
                    <li key={w}>
                      <span className="pricing-list-label">{w === 1 ? t('week_singular') : t('week_plural', { count: w })}</span>
                      <span className="pricing-list-value">+{formatEUR(FAMILY_PRICING.extraChildPerWeek[w])}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              {t.rich('family.example', {
                b: (chunks) => <strong style={{ color: 'var(--text-secondary)' }}>{chunks}</strong>,
                ex1base: formatEUR(FAMILY_PRICING.base[1]),
                ex1child: formatEUR(FAMILY_PRICING.extraChildPerWeek[1]),
                ex1total: formatEUR(FAMILY_PRICING.base[1] + FAMILY_PRICING.extraChildPerWeek[1]),
                ex2adult: formatEUR(PRICING_TIERS.duo.perAdult[2]),
                ex2child: formatEUR(FAMILY_PRICING.extraChildPerWeek[2]),
                ex2total: formatEUR(2 * PRICING_TIERS.duo.perAdult[2] + FAMILY_PRICING.extraChildPerWeek[2]),
              })}
            </p>
          </div>
        )}

        <div className="pricing-included reveal" style={{ transitionDelay: '0.3s' }}>
          <h3 className="pricing-included-title">{t('included_title')}</h3>
          <ul className="pricing-included-list">
            <li>{t('included.accommodation')}</li>
            <li>{t('included.visa')}</li>
            <li>{t('included.flight')}</li>
            <li>{t('included.transfers')}</li>
            <li>{t('included.meals')}</li>
            <li>{t('included.sessions')}</li>
            <li>{t('included.coaching')}</li>
            <li>{t('included.prep')}</li>
          </ul>
          <p className="pricing-not-included">
            {t.rich('not_included', { b: (chunks) => <strong>{chunks}</strong> })}
          </p>
        </div>

        <div className="pricing-cta reveal" style={{ transitionDelay: '0.4s' }}>
          <Link href="/inscription" className="btn-primary">
            {t('cta_primary')}
          </Link>
          <Link href="/contact" className="btn-ghost">
            {t('cta_secondary')}
          </Link>
        </div>
      </div>
    </section>
  )
}
