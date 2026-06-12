import { getTranslations, setRequestLocale } from 'next-intl/server'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import Icon from '@/components/Icon'
import PricingTable from '@/components/PricingTable'
import PriceEstimator from '@/components/PriceEstimator'
import { PRICING_TIERS, FAMILY_PRICING } from '@/data/pricing'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tarifs' })
  return localizedMetadata('/tarifs', locale as Locale, t('meta.title'), t('meta.description'))
}

const TOUTCOMPRIS_ITEMS = [
  { key: 'visa', icon: 'passport' },
  { key: 'vol', icon: 'plane' },
  { key: 'hebergement', icon: 'bed' },
  { key: 'repas', icon: 'food' },
  { key: 'encadrement', icon: 'shield-check' },
  { key: 'transferts', icon: 'car' },
] as const

const TRANSPARENCE_KEYS = ['degressif', 'pas_de_frais_caches', 'paiement_post_visio'] as const
const FAQ_KEYS = ['quand_payer', 'frais_caches', 'vol_international', 'degressif', 'famille', 'remboursement'] as const

const LOW_PRICE = PRICING_TIERS.club.perAdult[1]
const HIGH_PRICE = FAMILY_PRICING.base[3]

export default async function TarifsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('tarifs')

  const canonicalUrl = locale === 'fr' ? 'https://mkrcamp.com/tarifs' : 'https://mkrcamp.com/en/pricing'

  const estimatorLabels = {
    label: t('estimator.label'),
    title: t('estimator.title'),
    sub: t('estimator.sub'),
    adultsLabel: t('estimator.adults_label'),
    childrenLabel: t('estimator.children_label'),
    durationLabel: t('estimator.duration_label'),
    adultsHint: t('estimator.adults_hint'),
    childrenHint: t('estimator.children_hint'),
    week: {
      '1': t('estimator.week.1'),
      '2': t('estimator.week.2'),
      '3': t('estimator.week.3'),
      'plus': t('estimator.week.plus'),
    },
    customValue: t('estimator.custom_value'),
    customHint: t('estimator.custom_hint'),
    resultEyebrow: t('estimator.result_eyebrow'),
    totalLabel: t('estimator.total_label'),
    perAdultLabel: t('estimator.per_adult_label'),
    familyBaseLabel: t('estimator.family_base_label'),
    familyExtraLabel: t('estimator.family_extra_label'),
    quoteValue: t('estimator.quote_value'),
    quoteHint: t('estimator.quote_hint'),
    includedNote: t('estimator.included_note'),
    disclaimer: t('estimator.disclaimer'),
    ctaApply: t('estimator.cta_apply'),
    ctaQuote: t('estimator.cta_quote'),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_KEYS.map(key => ({
      '@type': 'Question',
      name: t(`faq.items.${key}.question`),
      acceptedAnswer: { '@type': 'Answer', text: t(`faq.items.${key}.answer`) },
    })),
  }

  const offerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'MKR Caucasian Camp',
    description: t('meta.description'),
    brand: { '@type': 'Brand', name: 'MKR Caucasian Camp' },
    url: canonicalUrl,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: LOW_PRICE,
      highPrice: HIGH_PRICE,
      offerCount: 6,
      availability: 'https://schema.org/InStock',
      url: canonicalUrl,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd) }} />
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: canonicalUrl },
      ]} />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
      />

      {/* Tout compris */}
      <section className="logi-section fx-grid fx-stack-1 fx-glow" aria-labelledby="toutcompris-heading">
        <div className="fx-glow-orb fx-glow-orb--left fx-glow-breathe" aria-hidden="true" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('toutcompris.label')}
            </span>
            <h2 id="toutcompris-heading">{t('toutcompris.title')}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem', maxWidth: '720px' }}>
              {t('toutcompris.intro')}
            </p>
          </div>
          <div className="grid-3x2" style={{ gap: '1.25rem' }}>
            {TOUTCOMPRIS_ITEMS.map((item, i) => (
              <div key={item.key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="tc-icon" aria-hidden="true">
                  <Icon name={item.icon} size={24} />
                </span>
                <h3 className="card-title" style={{ fontSize: '0.95rem', marginTop: '0.9rem' }}>
                  {t(`toutcompris.items.${item.key}.title`)}
                </h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>
                  {t(`toutcompris.items.${item.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
          <p className="tc-footnote reveal">{t('toutcompris.footnote')}</p>
        </div>
      </section>

      {/* Estimateur live */}
      <PriceEstimator labels={estimatorLabels} />

      {/* Grille tarifaire complète (composant réutilisable) */}
      <PricingTable withHeader={true} />

      {/* Transparence */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-5" aria-labelledby="transparence-heading">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('transparence.label')}
            </span>
            <h2 id="transparence-heading">{t('transparence.title')}</h2>
          </div>
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {TRANSPARENCE_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <h3 className="card-title" style={{ fontSize: '1rem' }}>{t(`transparence.items.${key}.title`)}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>{t(`transparence.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ tarifs */}
      <section className="logi-section fx-grid fx-mask-a fx-stack-6 fx-glow" aria-labelledby="faq-tarifs-heading">
        <div className="fx-glow-orb fx-glow-orb--right fx-glow-breathe" aria-hidden="true" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('faq.label')}
            </span>
            <h2 id="faq-tarifs-heading">{t('faq.title')}</h2>
          </div>
          <div className="grid-2" style={{ gap: '1.25rem' }}>
            {FAQ_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{t(`faq.items.${key}.question`)}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem', marginTop: '0.6rem' }}>
                  {t(`faq.items.${key}.answer`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/contact"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
