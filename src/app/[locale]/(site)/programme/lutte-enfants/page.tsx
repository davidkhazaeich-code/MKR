import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import DisciplineTechniques from '@/components/DisciplineTechniques'
import DisciplineSessionFlow from '@/components/DisciplineSessionFlow'
import { FAMILY_BASE_1WEEK_LABEL } from '@/lib/pricing-copy'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'programme.lutte_enfants' })
  return localizedMetadata(
    '/programme/lutte-enfants',
    locale as Locale,
    t('meta.title'),
    t('meta.description'),
  )
}

const PILLAR_KEYS = [
  'pedagogie',
  'encadrement',
  'heritage',
  'esprit',
  'groupes',
  'cadre',
] as const

const SESSION_FLOW_KEYS = [
  'echauffement',
  'technique',
  'drills',
  'situations',
  'retour',
] as const

export default async function ProgrammeLutteEnfantsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('programme.lutte_enfants')

  const pillars = PILLAR_KEYS.map((key) => ({
    title: t(`pillars.items.${key}.title`),
    desc: t(`pillars.items.${key}.desc`),
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
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/programme/lutte-enfants' },
      ]} />
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        breadcrumb={[
          { href: '/programme', label: t('breadcrumb.programme') },
          { href: '/programme/lutte-enfants', label: t('breadcrumb.current') },
        ]}
        image="/images/ruslan/lutte/kids-briefing.webp"
        imageAlt={t('hero.image_alt')}
      />

      {/* Stats parents — bande de réassurance */}
      <section className="parents-stats-band reveal">
        <div className="parents-stats-grid">
          <div>
            <span className="parents-stat-num">{t('stats_band.ages.num')}</span>
            <span className="parents-stat-label">{t('stats_band.ages.label')}</span>
          </div>
          <div>
            <span className="parents-stat-num">{t('stats_band.ratio.num')}</span>
            <span className="parents-stat-label">{t('stats_band.ratio.label')}</span>
          </div>
          <div>
            <span className="parents-stat-num">{t('stats_band.sessions.num')}</span>
            <span className="parents-stat-label">{t('stats_band.sessions.label')}</span>
          </div>
          <div>
            <span className="parents-stat-num">{FAMILY_BASE_1WEEK_LABEL.replace(/\s*€/, '')}</span>
            <span className="parents-stat-label">{t('stats_band.family_label')}</span>
          </div>
        </div>
      </section>

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
                  src="/images/ruslan/kids/kids-alignes-tapis-vertical.webp"
                  alt={t('description.img1_alt')}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/ruslan/kids/kid-stretching-debout.webp"
                  alt={t('description.img2_alt')}
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

      {/* Cinematic reveal : jeune lutteur en posture */}
      <CinematicReveal
        image="/images/ruslan/kids/kid-lutteur-rouge-rossiya.webp"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      <DisciplineTechniques items={pillars} label={t('pillars.label')} title={t('pillars.title')} />

      <DisciplineSessionFlow
        steps={sessionFlow}
        hoursNote={
          <>
            {t('session_flow.hours_note_prefix')}<strong>{t('session_flow.hours_note_morning')}</strong>{t('session_flow.hours_note_and')}<strong>{t('session_flow.hours_note_afternoon')}</strong>{t('session_flow.hours_note_suffix')}
          </>
        }
      />

      {/* Pour les parents : version compacte, le détail vit sur /familles */}
      <section className="logi-section fx-texture-concrete fx-mask-d fx-stack-5">
        <div className="inner">
          <div className="group-card reveal" style={{ textAlign: 'center' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.6rem' }}>{t('for_parents.label')}</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)' }}>{t('for_parents.title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem', maxWidth: '680px', margin: '0.8rem auto 0', lineHeight: '1.6' }}>
              {t('for_parents.body', { familyBase1week: FAMILY_BASE_1WEEK_LABEL })}
            </p>
            <div style={{ marginTop: '1.4rem' }}>
              <Link href="/familles" className="btn-ghost" style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem' }}>
                {t('for_parents.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=famille"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/familles"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
