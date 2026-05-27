import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import { FAMILY_BASE_PROSE, FAMILY_EXTRA_CHILD_1WEEK_LABEL } from '@/lib/pricing-copy'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'programme.root' })
  return localizedMetadata('/programme', locale as Locale, t('meta.title'), t('meta.description'))
}

const LEVEL_KEYS = ['pro', 'inter', 'amateur'] as const

export default async function ProgrammePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('programme.root')

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/programme' },
      ]} />
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
      />

      {/* Stats band */}
      <div className="stats-band fx-grid fx-stack-1">
        <div className="stat-item">
          <span className="stat-num">2</span>
          <span className="stat-label">{t('stats_band.sessions_per_day')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">6</span>
          <span className="stat-label">{t('stats_band.days_per_week')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">3</span>
          <span className="stat-label">{t('stats_band.disciplines')}</span>
        </div>
      </div>

      {/* MMA card */}
      <section className="logi-section fx-grid fx-stack-2">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <Link href="/programme/mma" className="prog-discipline-card reveal">
            <img
              src="/images/action/sparring-mma-wall.webp"
              alt={t('cards.mma.alt')}
              width={800}
              height={600}
              loading="lazy"
              className="prog-disc-bg"
            />
            <div className="prog-disc-content">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>{t('cards.mma.label')}</span>
              <h2>{t('cards.mma.title')}</h2>
              <p>{t('cards.mma.desc')}</p>
              <span className="btn-ghost" style={{ marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                {t('cards.mma.cta')}
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Lutte adultes card */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="inner">
          <Link href="/programme/lutte" className="prog-discipline-card reveal">
            <img
              src="/images/action/takedown-wrestling.webp"
              alt={t('cards.lutte.alt')}
              width={800}
              height={600}
              loading="lazy"
              className="prog-disc-bg"
            />
            <div className="prog-disc-content">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>{t('cards.lutte.label')}</span>
              <h2>{t('cards.lutte.title')}</h2>
              <p>{t('cards.lutte.desc')}</p>
              <span className="btn-ghost" style={{ marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                {t('cards.lutte.cta')}
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Lutte enfants card */}
      <section className="logi-section fx-grid fx-stack-3b">
        <div className="inner">
          <Link href="/programme/lutte-enfants" className="prog-discipline-card reveal">
            <img
              src="/images/action/ground-control.webp"
              alt={t('cards.lutte_enfants.alt')}
              width={800}
              height={600}
              loading="lazy"
              className="prog-disc-bg"
            />
            <div className="prog-disc-content">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>{t('cards.lutte_enfants.label')}</span>
              <h2>{t('cards.lutte_enfants.title')}</h2>
              <p>{t('cards.lutte_enfants.desc', {
                familyBaseProse: FAMILY_BASE_PROSE,
                familyExtraChild1week: FAMILY_EXTRA_CHILD_1WEEK_LABEL,
              })}</p>
              <span className="btn-ghost" style={{ marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                {t('cards.lutte_enfants.cta')}
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Niveaux */}
      <section className="logi-section fx-texture-concrete fx-mask-c fx-stack-5 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('pour_qui.label')}</span>
            <h2>{t('pour_qui.title')}</h2>
          </div>
          <div className="grid-3">
            {LEVEL_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <h3 className="card-title">{t(`pour_qui.levels.${key}.title`)}</h3>
                <p className="card-body">{t(`pour_qui.levels.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/destinations"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
