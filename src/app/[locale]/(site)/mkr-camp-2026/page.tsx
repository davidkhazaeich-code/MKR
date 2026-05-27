import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import PricingTable from '@/components/PricingTable'
import FacilitatorBand from '@/components/FacilitatorBand'
import { SOLO_PRICE_1WEEK_LABEL, SOLO_PRICE_1WEEK_EUR } from '@/lib/pricing-copy'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'mkr-camp-2026' })
  return buildMetadata({
    title: t('meta.title'),
    description: t('meta.description', { soloPrice: SOLO_PRICE_1WEEK_LABEL }),
    path: '/mkr-camp-2026',
  })
}

const REASON_KEYS = ['esprit', 'dates', 'historique'] as const
const CROSS_SELL_KEYS = ['sur_mesure', 'famille', 'clubs'] as const
const CROSS_SELL_HREFS = {
  sur_mesure: '/sur-mesure',
  famille: '/familles',
  clubs: '/clubs-groupes',
} as const satisfies Record<(typeof CROSS_SELL_KEYS)[number], Parameters<typeof Link>[0]['href']>

export default async function MkrCamp2026Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('mkr-camp-2026')

  const timelineSlots = t.raw('timeline.slots') as { time: string; label: string; desc: string }[]
  const soloPriceNum = SOLO_PRICE_1WEEK_EUR.toLocaleString('fr-FR').replace(/ /g, ' ')

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/mkr-camp-2026' },
      ]} />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        image="/images/ruslan/action/mma-cercle-session-demo-mkr.webp"
        imageAlt={t('hero.image_alt')}
      />

      {/* Stats clés */}
      <section className="parents-stats-band reveal">
        <div className="parents-stats-grid">
          <div>
            <span className="parents-stat-num">1-3</span>
            <span className="parents-stat-label">{t('stats.weeks_label')}</span>
          </div>
          <div>
            <span className="parents-stat-num">15</span>
            <span className="parents-stat-label">{t('stats.places_label')}</span>
          </div>
          <div>
            <span className="parents-stat-num">9</span>
            <span className="parents-stat-label">{t('stats.coaches_label')}</span>
          </div>
          <div>
            <span className="parents-stat-num">{soloPriceNum}</span>
            <span className="parents-stat-label">{t('stats.price_label')}</span>
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/ruslan/action/mma-adultes-cercle.webp"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      {/* Pourquoi rejoindre */}
      <section className="logi-section fx-grid fx-stack-2 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('reasons.label')}
            </span>
            <h2>{t('reasons.title')}</h2>
          </div>
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {REASON_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <h3 className="card-title">{t(`reasons.items.${key}.title`)}</h3>
                <p className="card-body">{t(`reasons.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MKR organise tout */}
      <FacilitatorBand withHeader={true} />

      {/* Pricing */}
      <PricingTable withHeader={true} />

      {/* Timeline réservation */}
      <section className="logi-section fx-texture-concrete fx-mask-b fx-stack-5">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('timeline.label')}
            </span>
            <h2>{t('timeline.title')}</h2>
          </div>
          <div className="daily-timeline">
            {timelineSlots.map((slot, i) => (
              <div key={i} className="daily-step reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="daily-time">{slot.time}</span>
                <div className="daily-step-content">
                  <h3>{slot.label}</h3>
                  <p>{slot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Cross-sell autres tunnels */}
      <section className="logi-section fx-grid fx-stack-7">
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
        primaryHref="/inscription?type=session&session=aout-2026"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/contact"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
