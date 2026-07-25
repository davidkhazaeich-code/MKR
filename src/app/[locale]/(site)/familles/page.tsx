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
import { FAMILY_EXTRA_CHILD_1WEEK_LABEL } from '@/lib/pricing-copy'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'familles' })
  return localizedMetadata('/familles', locale as Locale, t('meta.title'), t('meta.description'))
}

const PILLAR_KEYS = ['parent_obligatoire', 'programme_adapte', 'coach_jeunesse', 'hebergement_famille'] as const
const TESTIMONIAL_KEYS = ['karim', 'marc'] as const
const CROSS_SELL_KEYS = ['session', 'sur_mesure', 'clubs'] as const
const CROSS_SELL_HREFS = {
  session: '/mkr-camp-2026',
  sur_mesure: '/sur-mesure',
  clubs: '/clubs-groupes',
} as const satisfies Record<(typeof CROSS_SELL_KEYS)[number], Parameters<typeof Link>[0]['href']>

export default async function FamillesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('familles')

  const checks = t.raw('securite.checks') as { strong: string; suffix: string }[]

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/familles' },
      ]} />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
      />

      {/* Cinematic reveal — parent-enfant tapis */}
      <SceneBand
        image="/images/ruslan/kids/parent-enfant-tapis-mkr.webp"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      {/* Description split */}
      <section className="logi-section fx-grid fx-stack-1 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
                {t('principe.label')}
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
                {t('principe.title')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                {t('principe.p1')}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('principe.p2')}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                <strong>{t('principe.p3_strong')}</strong>{t('principe.p3_suffix')}
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/ruslan/kids/kids-alignes-tapis-vertical.webp"
                  alt={t('principe.img_alt')}
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

      {/* Piliers */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('pillars.label')}
            </span>
            <h2>{t('pillars.title')}</h2>
          </div>
          <div className="grid-2">
            {PILLAR_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{t(`pillars.items.${key}.title`)}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>{t(`pillars.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MKR organise tout */}
      <FacilitatorBand withHeader={true} />

      {/* Section dynamique kids */}
      <section className="dag-security fx-texture-concrete fx-glow fx-mask-d fx-stack-4">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <div>
              <figure className="photo-card">
                <img
                  src="/images/ruslan/kids/kids-sparring-encadre-mkr.webp"
                  alt={t('securite.img_alt')}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
            </div>
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
                {t('securite.label')}
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
                {t('securite.title')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                {t('securite.intro')}
              </p>
              <ul className="logi-check-list" style={{ marginTop: '1.5rem' }}>
                {checks.map((c, i) => (
                  <li key={i}><strong>{c.strong}</strong>{c.suffix}</li>
                ))}
              </ul>
              <p className="pull-quote" style={{ marginTop: '1.5rem' }}>
                {t('securite.quote')}
              </p>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('securite.quote_attribution')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages parents */}
      <section className="logi-section fx-grid fx-mask-a fx-stack-6 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('testimonials.label')}
            </span>
            <h2>{t('testimonials.title')}</h2>
          </div>
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {TESTIMONIAL_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.55', fontSize: '0.92rem', fontStyle: 'italic' }}>
                  &laquo; {t(`testimonials.items.${key}.quote`)} &raquo;
                </p>
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', fontSize: '0.7rem' }}>
                    {t(`testimonials.items.${key}.name`)}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '0.2rem' }}>
                    {t(`testimonials.items.${key}.role`)}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>
                    {t(`testimonials.items.${key}.discipline`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs famille */}
      <PricingTable withHeader={true} />

      {/* Process inscription famille */}
      <section className="logi-section fx-texture-concrete fx-mask-b fx-stack-7">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('process.label')}
            </span>
            <h2>{t('process.title')}</h2>
          </div>
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            <div className="content-card fx-grain fx-corner-glow reveal">
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem', fontSize: '0.6rem' }}>{t('process.steps.step1.num')}</span>
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{t('process.steps.step1.title')}</h3>
              <p className="card-body" style={{ fontSize: '0.85rem' }}>
                {t('process.steps.step1.desc')}
              </p>
            </div>
            <div className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: '0.08s' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem', fontSize: '0.6rem' }}>{t('process.steps.step2.num')}</span>
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{t('process.steps.step2.title')}</h3>
              <p className="card-body" style={{ fontSize: '0.85rem' }}>
                {t('process.steps.step2.desc', { familyExtraChild1week: FAMILY_EXTRA_CHILD_1WEEK_LABEL })}
              </p>
            </div>
            <div className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: '0.16s' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem', fontSize: '0.6rem' }}>{t('process.steps.step3.num')}</span>
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{t('process.steps.step3.title')}</h3>
              <p className="card-body" style={{ fontSize: '0.85rem' }}>
                {t('process.steps.step3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-sell autres formats */}
      <section className="logi-section fx-texture-basalt fx-mask-c fx-stack-8">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('cross_sell.label')}
            </span>
            <h2>{t('cross_sell.title')}</h2>
          </div>
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {CROSS_SELL_KEYS.map((key, i) => (
              <Link key={key} href={CROSS_SELL_HREFS[key]} className="content-card fx-grain fx-corner-glow reveal" style={{ textDecoration: 'none', transitionDelay: `${i * 0.08}s` }}>
                <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem', fontSize: '0.65rem' }}>{t(`cross_sell.cards.${key}.label`)}</span>
                <h3 className="card-title" style={{ fontSize: '1rem' }}>{t(`cross_sell.cards.${key}.title`)}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>
                  {t(`cross_sell.cards.${key}.desc`)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=famille"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/contact"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
