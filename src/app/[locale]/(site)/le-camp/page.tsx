import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import PageHero from '@/components/PageHero'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import SceneBand from '@/components/SceneBand'
import TldrBox from '@/components/TldrBox'
import UpdatedAt from '@/components/UpdatedAt'
import KeyFactsBand from '@/components/KeyFactsBand'
import AudienceFit from '@/components/AudienceFit'
import ProcessStrip, { type ProcessStep } from '@/components/ProcessStrip'
import PageFaq from '@/components/PageFaq'
import PriceAnchor from '@/components/PriceAnchor'
import Icon, { type IconName } from '@/components/Icon'
import type { FAQItem } from '@/components/FAQAccordion'

const UPDATED = '2026-07-06'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'le-camp' })
  return localizedMetadata('/le-camp', locale as Locale, t('meta.title'), t('meta.description'))
}

const KEY_FACT_KEYS: { key: string; icon: IconName }[] = [
  { key: 'visa', icon: 'passport' },
  { key: 'flight', icon: 'plane' },
  { key: 'housing', icon: 'hotel' },
  { key: 'training', icon: 'fire' },
  { key: 'selection', icon: 'shield-check' },
]

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
  const fitFor = t.raw('fit.for_items') as string[]
  const fitNot = t.raw('fit.not_items') as string[]
  const processSteps = t.raw('process.steps') as ProcessStep[]
  const faqItems = t.raw('faq.items') as FAQItem[]

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
        image="/images/galerie-real/mma-cercle-session.webp"
        imageAlt={t('hero.image_alt')}
      />

      {/* Message match avec les composants d'annonces (visa, vol, places, selection) */}
      <KeyFactsBand
        facts={KEY_FACT_KEYS.map(({ key, icon }) => ({
          icon,
          label: t(`key_facts.${key}.label`),
          sub: t(`key_facts.${key}.sub`),
        }))}
      />

      <div className="inner">
        <TldrBox
          title={t('tldr.title')}
          facts={facts}
        />
        <UpdatedAt date={UPDATED} />
      </div>

      {/* Cinematic reveal */}
      <SceneBand
        /* Vraie photo (salle pleine) au lieu du visuel IA de salle vide. */
        image="/images/ruslan/action/mma-adultes-cercle.webp"
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

      {/* Prix transparent + prochaine session + places live */}
      <PriceAnchor href="/inscription?type=session" />

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

      {/* Les salles et la vie au camp */}
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
                src="/images/galerie-real/mma-cercle-session.webp"
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
                src="/images/galerie-real/coachs-salle.webp"
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

      {/* Qualification self-select (regle d'entree 2026-06-20) */}
      <AudienceFit
        label={t('fit.label')}
        title={t('fit.title')}
        forTitle={t('fit.for_title')}
        forItems={fitFor}
        notTitle={t('fit.not_title')}
        notItems={fitNot}
        note={t('fit.note')}
      />

      {/* Parcours candidature -> depart */}
      <ProcessStrip
        label={t('process.label')}
        title={t('process.title')}
        steps={processSteps}
        note={t('process.note')}
      />

      {/* Objections locales + JSON-LD FAQPage */}
      <PageFaq
        label={t('faq.label')}
        title={t('faq.title')}
        items={faqItems}
        id="faq-le-camp"
      />

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/sessions"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
