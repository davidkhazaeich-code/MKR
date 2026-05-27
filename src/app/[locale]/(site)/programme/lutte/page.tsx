import { getTranslations, setRequestLocale } from 'next-intl/server'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import DisciplineTechniques from '@/components/DisciplineTechniques'
import DisciplineSessionFlow from '@/components/DisciplineSessionFlow'
import TldrBox from '@/components/TldrBox'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'programme.lutte' })
  return localizedMetadata('/programme/lutte', locale as Locale, t('meta.title'), t('meta.description'))
}

const TECHNIQUE_KEYS = [
  'lutte_libre',
  'leg_rides',
  'chain_wrestling',
  'funk_rolls',
  'mat_returns',
  'defense',
] as const

const SESSION_FLOW_KEYS = [
  'echauffement',
  'technique',
  'situations',
  'sparring',
  'conditioning',
] as const

export default async function ProgrammeLuttePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('programme.lutte')

  const facts = t.raw('tldr.facts') as string[]
  const techniques = TECHNIQUE_KEYS.map((key) => ({
    title: t(`techniques.items.${key}.title`),
    desc: t(`techniques.items.${key}.desc`),
  }))
  const sessionFlow = SESSION_FLOW_KEYS.map((key) => ({
    time: t(`session_flow.steps.${key}.time`),
    activity: t(`session_flow.steps.${key}.activity`),
    desc: t(`session_flow.steps.${key}.desc`),
  }))

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.programme'), url: 'https://mkrcamp.com/programme' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/programme/lutte' },
      ]} />
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        breadcrumb={[
          { href: '/programme', label: t('breadcrumb.programme') },
          { href: '/programme/lutte', label: t('breadcrumb.current') },
        ]}
      />

      <div className="inner">
        <TldrBox
          title={t('tldr.title')}
          facts={facts}
        />
      </div>

      {/* Description */}
      <section className="logi-section fx-grid fx-stack-1 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('description.label')}</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>{t('description.title')}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('description.p1')}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('description.p2')}
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/action/lutte-coach-gereev.webp"
                  alt={t('description.img1_alt')}
                  width={1600}
                  height={1066}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/action/lutte-pont-daghestan.webp"
                  alt={t('description.img2_alt')}
                  width={1600}
                  height={1066}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/action/lutte-banner-makhachkala.webp"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      <DisciplineTechniques items={techniques} />

      <DisciplineSessionFlow
        steps={sessionFlow}
        hoursNote={
          <>
            {t('session_flow.hours_note_prefix')}<strong>{t('session_flow.hours_note_morning')}</strong>{t('session_flow.hours_note_and')}<strong>{t('session_flow.hours_note_afternoon')}</strong>{t('session_flow.hours_note_suffix')}
          </>
        }
      />

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/destinations/dagestan"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
