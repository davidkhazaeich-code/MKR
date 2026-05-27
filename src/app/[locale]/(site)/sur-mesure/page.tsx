import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import PricingTable from '@/components/PricingTable'
import FacilitatorBand from '@/components/FacilitatorBand'
import { PRICING_TIERS } from '@/data/pricing'

const TRIO_PRICE_1WEEK_NUM = PRICING_TIERS.trio.perAdult[1].toLocaleString('fr-FR').replace(/ /g, ' ')

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'sur-mesure' })
  return buildMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/sur-mesure',
  })
}

const PROFILE_KEYS = ['pro', 'planning', 'duo'] as const
const CROSS_SELL_KEYS = ['sessions', 'famille', 'clubs'] as const
const CROSS_SELL_HREFS = {
  sessions: '/sessions',
  famille: '/familles',
  clubs: '/clubs-groupes',
} as const satisfies Record<(typeof CROSS_SELL_KEYS)[number], Parameters<typeof Link>[0]['href']>

export default async function SurMesurePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('sur-mesure')

  const processSteps = t.raw('process.steps') as { num: string; title: string; desc: string }[]

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/sur-mesure' },
      ]} />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        image="/images/ruslan/coaches/Antoine-portrait-makhachkala-mkr.webp"
        imageAlt={t('hero.image_alt')}
      />

      {/* Stats clés */}
      <section className="parents-stats-band reveal">
        <div className="parents-stats-grid">
          <div>
            <span className="parents-stat-num">1-4</span>
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
            <span className="parents-stat-num">{TRIO_PRICE_1WEEK_NUM}</span>
            <span className="parents-stat-label">{t('stats.price_label')}</span>
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/ruslan/action/mma-cercle-session-demo-mkr.webp"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      {/* Combo Daghestan + Tchétchénie */}
      <section className="logi-section fx-texture-concrete fx-glow fx-mask-a fx-stack-1b">
        <div className="fx-glow-orb fx-glow-orb--top" />
        <div className="inner">
          <div className="reveal" style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('combo.label')}
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
              {t('combo.title')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginTop: '1.2rem' }}>
              {t('combo.intro_prefix')}<strong>{t('combo.intro_strong_1')}</strong>{t('combo.intro_middle')}<strong>{t('combo.intro_strong_2')}</strong>{t('combo.intro_suffix')}
            </p>
          </div>
        </div>
      </section>

      {/* Profils */}
      <section className="logi-section fx-grid fx-stack-2 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('profiles.label')}
            </span>
            <h2>{t('profiles.title')}</h2>
          </div>
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {PROFILE_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <h3 className="card-title">{t(`profiles.items.${key}.title`)}</h3>
                <p className="card-body">{t(`profiles.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MKR organise tout (réutilisé) */}
      <FacilitatorBand withHeader={true} />

      {/* Pricing */}
      <PricingTable withHeader={true} />

      {/* Processus */}
      <section className="logi-section fx-texture-basalt fx-mask-c fx-stack-5">
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
        primaryHref="/inscription?type=custom"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/contact"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
