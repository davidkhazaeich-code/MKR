import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import PageHero from '@/components/PageHero'
import { buildMetadata } from '@/lib/seo'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import TldrBox from '@/components/TldrBox'
import Icon, { type IconName } from '@/components/Icon'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'le-camp' })
  return buildMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/le-camp',
  })
}

const INCLUDE_KEYS: { key: string; icon: IconName }[] = [
  { key: 'visa', icon: 'passport' },
  { key: 'flight', icon: 'plane' },
  { key: 'transport', icon: 'taxi' },
  { key: 'accommodation', icon: 'hotel' },
  { key: 'sessions', icon: 'fire' },
  { key: 'coaches', icon: 'team' },
  { key: 'excursions', icon: 'mountain' },
  { key: 'meals', icon: 'food' },
]

export default async function LeCampPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('le-camp')

  const facts = t.raw('tldr.facts') as string[]
  const notIncluded = t.raw('not_included.items') as string[]
  const dailySchedule = t.raw('daily_schedule.slots') as { time: string; activity: string; desc: string }[]

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/le-camp' },
      ]} />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
      />

      <div className="inner">
        <TldrBox
          title={t('tldr.title')}
          facts={facts}
        />
      </div>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/action/sparring-mma-wall.webp"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      {/* Philosophie / Pourquoi le Caucase */}
      <section className="camp-section fx-grid fx-glow fx-mask-a fx-stack-2">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="layout-split layout-split--center">
            <div className="reveal">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('philosophie.label')}</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', textTransform: 'uppercase', lineHeight: '0.92' }}>
                {t('philosophie.title')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                {t('philosophie.p1')}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('philosophie.p2')}
              </p>
            </div>
            <div>
              <div className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: '0.1s' }}>
                <h3 className="card-title">{t('philosophie.card_immersion.title')}</h3>
                <p className="card-body">{t('philosophie.card_immersion.body')}</p>
              </div>
              <div className="content-card fx-grain fx-corner-glow reveal" style={{ marginTop: '1.25rem', transitionDelay: '0.18s' }}>
                <h3 className="card-title">{t('philosophie.card_heritage.title')}</h3>
                <p className="card-body">{t('philosophie.card_heritage.body')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ce qui est inclus */}
      <section className="camp-section fx-texture-basalt fx-glow fx-stack-3">
        <div className="fx-glow-orb fx-glow-orb--left fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('includes.label')}</span>
            <h2>{t('includes.title')}</h2>
          </div>
          <div className="include-grid">
            {INCLUDE_KEYS.map((item, i) => (
              <div key={item.key} className="include-card fx-grain reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <Icon name={item.icon} size={32} />
                <h3>{t(`includes.items.${item.key}.title`)}</h3>
                <p>{t(`includes.items.${item.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ce qui n'est PAS inclus */}
      <section className="exclude-section fx-grid">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('not_included.label')}</span>
            <h2>{t('not_included.title')}</h2>
          </div>
          <div className="reveal" style={{ maxWidth: '600px' }}>
            {notIncluded.map((item, i) => (
              <div key={i} className="exclude-item">{item}</div>
            ))}
            <Link href="/logistique" className="btn-ghost" style={{ marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
              {t('not_included.cta_logistique')}
            </Link>
          </div>
        </div>
      </section>

      {/* Journee type */}
      <section id="journee-type" className="camp-section fx-texture-concrete fx-mask-b fx-stack-4">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('daily_schedule.label')}</span>
            <h2>{t('daily_schedule.title')}</h2>
          </div>
          <div className="daily-timeline">
            {dailySchedule.map((slot, i) => (
              <div key={i} className="daily-step reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="daily-time">{slot.time}</span>
                <div className="daily-step-content">
                  <h3>{slot.activity}</h3>
                  <p>{slot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Les salles */}
      <section className="camp-section fx-grid fx-glow fx-stack-5">
        <div className="fx-glow-orb fx-glow-orb--right fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('venues.label')}</span>
            <h2>{t('venues.title')}</h2>
          </div>
          <div className="grid-2">
            <figure className="photo-card reveal">
              <img
                src="/images/environment/gym-interior.webp"
                alt={t('venues.main_alt')}
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>{t('venues.main_caption')}</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: '0.1s' }}>
              <img
                src="/images/action/boxing-pads.webp"
                alt={t('venues.secondary_alt')}
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>{t('venues.secondary_caption')}</figcaption>
            </figure>
          </div>

          {/* Hebergement et vie au camp */}
          <div className="grid-2" style={{ marginTop: '2rem' }}>
            <figure className="photo-card reveal">
              <img
                src="/images/environment/accommodation.webp"
                alt={t('venues.accommodation_alt')}
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>{t('venues.accommodation_caption')}</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: '0.1s' }}>
              <img
                src="/images/environment/communal-meal.webp"
                alt={t('venues.meal_alt')}
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>{t('venues.meal_caption')}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/programme"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
