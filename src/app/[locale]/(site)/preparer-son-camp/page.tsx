import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'preparer-son-camp' })
  return buildMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/preparer-son-camp',
  })
}

const WEEK_KEYS = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6'] as const
const EQUIP_CATEGORY_KEYS = ['vetements', 'hygiene'] as const

export default async function PreparerSonCampPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('preparer-son-camp')

  const checklistItems = t.raw('niveau.checklist.items') as string[]

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/preparer-son-camp' },
      ]} />
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
      />

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/action/conditioning-rope.webp"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      {/* Niveau minimum */}
      <section className="logi-section fx-grid fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="layout-split layout-split--balanced">
            <div className="reveal">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('niveau.label')}</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>{t('niveau.title')}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('niveau.p1_prefix')}<strong>{t('niveau.p1_strong1')}</strong>{t('niveau.p1_middle')}<strong>{t('niveau.p1_strong2')}</strong>{t('niveau.p1_suffix')}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('niveau.p2')}
              </p>
            </div>
            <div className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: '0.1s' }}>
              <h3 className="card-title">{t('niveau.checklist.title')}</h3>
              <ul className="logi-check-list">
                {checklistItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Programme 6 semaines */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('programme.label')}</span>
            <h2>{t('programme.title')}</h2>
          </div>
          <div className="grid-3x2">
            {WEEK_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.3rem', fontSize: '0.6rem' }}>
                  {t(`programme.weeks.${key}.week`).toUpperCase()}
                </span>
                <h3 className="card-title" style={{ fontSize: '1rem' }}>{t(`programme.weeks.${key}.focus`)}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>{t(`programme.weeks.${key}.desc`)}</p>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ marginTop: '2rem' }}>
            <Link href="/guide-caucase" className="btn-ghost">{t('programme.guide_link')}</Link>
          </div>
        </div>
      </section>

      {/* Equipement */}
      <section className="logi-section fx-grid fx-mask-c fx-stack-5">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('equipement.label')}</span>
            <h2>{t('equipement.title')}</h2>
          </div>
          <div className="grid-2">
            {EQUIP_CATEGORY_KEYS.map((catKey, ci) => {
              const items = t.raw(`equipement.categories.${catKey}.items`) as string[]
              return (
                <div key={catKey} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${ci * 0.1}s` }}>
                  <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{t(`equipement.categories.${catKey}.title`)}</h3>
                  <ul className="equip-list">
                    {items.map((item, i) => (
                      <li key={i}>
                        <span className="equip-check" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Preparation mentale */}
      <section className="dag-security fx-texture-concrete fx-glow fx-mask-a fx-stack-7">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="layout-split layout-split--balanced reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('mental.label')}</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
                {t('mental.title')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                {t('mental.p1')}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('mental.p2')}
              </p>
              <p className="pull-quote">
                {t('mental.quote')}
              </p>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('mental.quote_attribution')}</span>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/action/recovery.webp"
                  alt={t('mental.img_recovery_alt')}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/environment/accommodation.webp"
                  alt={t('mental.img_accommodation_alt')}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/guide-caucase"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
