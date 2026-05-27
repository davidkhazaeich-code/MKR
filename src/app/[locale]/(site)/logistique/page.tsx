import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import {
  PACKAGE_PER_ADULT_RANGE_LABEL,
  FAMILY_BASE_RANGE_LABEL,
} from '@/lib/pricing-copy'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'logistique' })
  return buildMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/logistique',
  })
}

const VISA_STEP_KEYS = ['step1', 'step2', 'step3', 'step4'] as const
const FLIGHT_KEYS = ['paris', 'geneve', 'bruxelles'] as const
const INFO_KEYS = ['decalage', 'monnaie', 'internet', 'climat', 'langue', 'alimentation'] as const

export default async function LogistiquePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('logistique')

  const includedItems = t.raw('budget.included_card.items') as string[]
  const assuranceItems = t.raw('assurance.items') as string[]
  const infosItems = t.raw('transferts.infos_card.items') as string[]

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/logistique' },
      ]} />
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
      />

      {/* Budget total */}
      <section className="logi-section fx-grid fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('budget.label')}</span>
            <h2>{t('budget.title')}</h2>
          </div>
          <div className="layout-split reveal" style={{ transitionDelay: '0.1s' }}>
            <div>
              <table className="table-tonal">
                <thead><tr><th>{t('budget.table_head_post')}</th><th>{t('budget.table_head_estimate')}</th></tr></thead>
                <tbody>
                  <tr><td>{t('budget.rows.package_adult')}</td><td>{PACKAGE_PER_ADULT_RANGE_LABEL}</td></tr>
                  <tr><td>{t('budget.rows.family_pack')}</td><td>{FAMILY_BASE_RANGE_LABEL}</td></tr>
                  <tr><td>{t('budget.rows.flight_intl')}</td><td>{t('budget.rows.flight_intl_value')}</td></tr>
                  <tr><td>{t('budget.rows.insurance')}</td><td>{t('budget.rows.insurance_value')}</td></tr>
                  <tr><td>{t('budget.rows.equipment')}</td><td>{t('budget.rows.equipment_value')}</td></tr>
                  <tr><td>{t('budget.rows.personal')}</td><td>{t('budget.rows.personal_value')}</td></tr>
                  <tr><td>{t('budget.rows.express')}</td><td>{t('budget.rows.express_value')}</td></tr>
                </tbody>
              </table>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
                {t('budget.footnote')}
              </p>
            </div>
            <div className="content-card fx-grain fx-corner-glow">
              <h3 className="card-title">{t('budget.included_card.title')}</h3>
              <ul className="logi-check-list">
                {includedItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Visa */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('visa.label')}</span>
            <h2>{t('visa.title')}</h2>
          </div>
          <div className="logi-visa-steps reveal">
            {VISA_STEP_KEYS.map((key) => (
              <div key={key} className="logi-step">
                <span className="logi-step-num">{t(`visa.steps.${key}.num`)}</span>
                <div>
                  <h3>{t(`visa.steps.${key}.title`)}</h3>
                  <p>{t(`visa.steps.${key}.desc`)}</p>
                </div>
              </div>
            ))}
            <p className="logi-updated">{t('visa.updated')}</p>
          </div>
        </div>
      </section>

      {/* Vols */}
      <section className="logi-section fx-grid fx-mask-c fx-stack-5">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('vols.label')}</span>
            <h2>{t('vols.title')}</h2>
          </div>
          <p className="reveal" style={{ color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '780px', marginBottom: '1.5rem' }}>
            {t('vols.intro_prefix')}<strong>{t('vols.intro_strong')}</strong>{t('vols.intro_suffix')}
          </p>
          <div className="grid-3">
            {FLIGHT_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <h3 className="card-title">{t(`vols.cards.${key}.city`)}</h3>
                <div className="logi-flight-detail">
                  <span className="logi-flight-label">{t('vols.label_connections')}</span>
                  <p>{t(`vols.cards.${key}.connections`)}</p>
                </div>
                <div className="logi-flight-detail">
                  <span className="logi-flight-label">{t('vols.label_price')}</span>
                  <p style={{ color: 'var(--primary)' }}>{t(`vols.cards.${key}.price`)}</p>
                </div>
                <div className="logi-flight-detail">
                  <span className="logi-flight-label">{t('vols.label_duration')}</span>
                  <p>{t(`vols.cards.${key}.duration`)}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="reveal" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem', maxWidth: '780px' }}>
            {t('vols.footnote_prefix')}<strong>{t('vols.footnote_strong')}</strong>{t('vols.footnote_suffix')}
          </p>
        </div>
      </section>

      {/* Assurance */}
      <section className="logi-section fx-texture-concrete fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left fx-glow-breathe" />
        <div className="inner">
          <div className="group-card fx-grain fx-corner-glow reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('assurance.label')}</span>
            <h2>{t('assurance.title')}</h2>
            <p>{t('assurance.intro')}</p>
            <ul className="logi-check-list" style={{ marginTop: '1rem' }}>
              {assuranceItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p style={{ marginTop: '1rem' }}>{t('assurance.providers')}</p>
          </div>
        </div>
      </section>

      {/* Transferts */}
      <section className="logi-section fx-grid fx-mask-a fx-stack-2">
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('transferts.label')}</span>
              <h2>{t('transferts.title')}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('transferts.body')}
              </p>
              <figure className="photo-card" style={{ marginTop: '1.5rem' }}>
                <img
                  src="/images/environment/mountain-road.webp"
                  alt={t('transferts.photo_alt')}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
                <figcaption>{t('transferts.photo_caption')}</figcaption>
              </figure>
            </div>
            <div className="content-card fx-grain fx-corner-glow">
              <h3 className="card-title">{t('transferts.infos_card.title')}</h3>
              {infosItems.map((item, i) => (
                <p key={i} className="card-body">{item}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Infos pratiques mini-cards */}
      <section className="logi-section fx-texture-basalt fx-glow fx-mask-d fx-stack-6">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('infos_pratiques.label')}</span>
            <h2>{t('infos_pratiques.title')}</h2>
          </div>
          <div className="grid-3x2">
            {INFO_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{t(`infos_pratiques.items.${key}.title`)}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>{t(`infos_pratiques.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/faq"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/guide-caucase"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
