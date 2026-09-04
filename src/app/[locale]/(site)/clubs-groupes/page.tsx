import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import SceneBand from '@/components/SceneBand'
import PricingTable from '@/components/PricingTable'
import FacilitatorBand from '@/components/FacilitatorBand'
import { PRICING_TIERS, formatEUR } from '@/data/pricing'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'clubs-groupes' })
  return localizedMetadata('/clubs-groupes', locale as Locale, t('meta.title'), t('meta.description'))
}

const ADVANTAGE_KEYS = ['hebergement', 'transferts', 'programme', 'coach', 'tarif', 'bilan'] as const
const CROSS_SELL_KEYS = ['sur_mesure', 'sessions', 'famille'] as const
const CROSS_SELL_HREFS = {
  sur_mesure: '/sur-mesure',
  sessions: '/sessions',
  famille: '/familles',
} as const satisfies Record<(typeof CROSS_SELL_KEYS)[number], Parameters<typeof Link>[0]['href']>

export default async function ClubsGroupesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('clubs-groupes')

  const processSteps = t.raw('process.steps') as { num: string; title: string; desc: string }[]
  const trioPrice = formatEUR(PRICING_TIERS.trio.perAdult[1])
  const clubPrice = formatEUR(PRICING_TIERS.club.perAdult[1])

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/clubs-groupes' },
      ]} />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        image="/images/ruslan/action/mma-adultes-cercle.webp"
        imageAlt={t('hero.image_alt')}
      />

      {/* Stats clés */}
      <section className="parents-stats-band reveal">
        <div className="parents-stats-grid">
          <div>
            <span className="parents-stat-num">5-20</span>
            <span className="parents-stat-label">{t('stats.people')}</span>
          </div>
          <div>
            <span className="parents-stat-num">90j</span>
            <span className="parents-stat-label">{t('stats.delay')}</span>
          </div>
          <div>
            <span className="parents-stat-num">1/2/3</span>
            <span className="parents-stat-label">{t('stats.weeks')}</span>
          </div>
          <div>
            <span className="parents-stat-num">{t('stats.quote_label')}</span>
            <span className="parents-stat-label">{t('stats.quote_sub')}</span>
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <SceneBand
        image="/images/ruslan/heritage/priere-collective-mkr.webp"
        /* focus 40% : meme photo que /a-propos */
        focusY="40%"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      {/* Avantages */}
      <section className="logi-section fx-grid fx-stack-2 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('advantages.label')}
            </span>
            <h2>{t('advantages.title')}</h2>
          </div>
          <div className="grid-3x2">
            {ADVANTAGE_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{t(`advantages.items.${key}.title`)}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>
                  {key === 'tarif'
                    ? t('advantages.items.tarif.desc', { trioPrice, clubPrice })
                    : t(`advantages.items.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MKR organise tout */}
      <FacilitatorBand withHeader={true} />

      {/* Pricing */}
      <PricingTable withHeader={true} />

      {/* Processus devis */}
      <section className="logi-section fx-texture-basalt fx-mask-c fx-stack-7">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('process.label')}
            </span>
            <h2>{t('process.title')}</h2>
          </div>
          <div className="logi-visa-steps reveal">
            {processSteps.map((step) => (
              <div key={step.num} className="logi-step">
                <span className="logi-step-num">{step.num}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-sell autres tunnels */}
      <section className="logi-section fx-grid fx-stack-6">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('cross_sell.label')}
            </span>
            <h2>{t('cross_sell.title')}</h2>
          </div>
          <div className="grid-3 reveal" style={{ gap: '1.5rem' }}>
            {CROSS_SELL_KEYS.map((key) => (
              <Link key={key} href={CROSS_SELL_HREFS[key]} className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
                <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>{t(`cross_sell.cards.${key}.label`)}</span>
                <h3 className="card-title">{t(`cross_sell.cards.${key}.title`)}</h3>
                <p className="card-body">{t(`cross_sell.cards.${key}.desc`)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=groupe"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/contact"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
