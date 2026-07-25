import { getTranslations, setRequestLocale } from 'next-intl/server'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import { Suspense } from 'react'
import PageHero from '@/components/PageHero'
import GuideForm from '@/components/GuideForm'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import SceneBand from '@/components/SceneBand'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'guide-caucase' })
  return localizedMetadata('/guide-caucase', locale as Locale, t('meta.title'), t('meta.description'))
}

const CONTENT_KEYS = ['visa', 'vols', 'inclus', 'prep', 'equipement', 'culture'] as const
const PERSONA_KEYS = ['solo', 'famille', 'club'] as const
const PEEK_KEYS = ['carte', 'visa', 'budget'] as const
const PEEK_SRCS: Record<(typeof PEEK_KEYS)[number], string> = {
  carte: '/images/guide-caucase/guide-page-carte-caucase.webp',
  visa: '/images/guide-caucase/guide-page-visa.webp',
  budget: '/images/guide-caucase/guide-page-budget.webp',
}
const TESTI_KEYS = ['karim', 'sophie'] as const
const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4'] as const

export default async function GuideCaucasePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('guide-caucase')

  const digitalDocumentJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    name: t('jsonld.name'),
    description: t('jsonld.description'),
    about: t('jsonld.about'),
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: 'MKR Caucasian Camp', url: 'https://mkrcamp.com' },
  }

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/guide-caucase' },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(digitalDocumentJsonLd) }} />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        compact
      />

      <section className="guide-section fx-grid fx-glow fx-stack-1">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="guide-layout reveal">
            <div>
              <figure className="photo-card" style={{ marginBottom: '1.5rem' }}>
                <img
                  src="/images/guide-caucase/guide-caucase-mockup-openbook.webp"
                  alt={t('section_main.img_openbook_alt')}
                  width={800}
                  height={600}
                  loading="eager"
                  fetchPriority="high"
                  className="section-photo-img"
                  style={{ width: '100%', maxWidth: '520px', display: 'block', margin: '0 auto' }}
                />
              </figure>
              <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                {t('section_main.title')}
              </h2>
              <div className="grid-3x2">
                {CONTENT_KEYS.map((key) => (
                  <div key={key} className="content-card fx-grain fx-corner-glow">
                    <h3 className="card-title" style={{ fontSize: '0.9rem' }}>{t(`section_main.contents.${key}.title`)}</h3>
                    <p className="card-body" style={{ fontSize: '0.82rem' }}>{t(`section_main.contents.${key}.desc`)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="guide-form-wrap">
              <figure className="photo-card" style={{ marginBottom: '1.5rem' }}>
                <img
                  src="/images/guide-caucase/guide-caucase-cover.webp"
                  alt={t('section_main.img_cover_alt')}
                  width={400}
                  height={600}
                  loading="eager"
                  className="section-photo-img"
                  style={{ maxWidth: '280px', margin: '0 auto', display: 'block' }}
                />
              </figure>
              <Suspense fallback={<div className="guide-form-card"><p>{t('section_main.loading')}</p></div>}>
                <GuideForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <SceneBand
        image="/images/environment/dagestan-panorama.webp"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      <section className="guide-section fx-grid fx-stack-1">
        <div className="inner">
          <h2 className="section-heading reveal">{t('personas.title')}</h2>
          <div className="grid-3" style={{ marginTop: '2rem' }}>
            {PERSONA_KEYS.map((key) => (
              <div key={key} className="content-card fx-grain reveal">
                <span className="label-tag" style={{ color: 'var(--primary)' }}>{t(`personas.items.${key}.tag`)}</span>
                <h3 className="card-title" style={{ marginTop: '0.5rem' }}>{t(`personas.items.${key}.title`)}</h3>
                <p className="card-body">{t(`personas.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section fx-grid fx-stack-1">
        <div className="inner">
          <h2 className="section-heading reveal">{t('sneak_peek.title')}</h2>
          <div className="grid-3" style={{ marginTop: '2rem' }}>
            {PEEK_KEYS.map((key) => (
              <figure key={key} className="photo-card reveal" style={{ aspectRatio: '2/3' }}>
                <img src={PEEK_SRCS[key]} alt={t(`sneak_peek.items.${key}.alt`)} loading="lazy" className="section-photo-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section fx-grid fx-stack-1">
        <div className="inner">
          <h2 className="section-heading reveal">{t('testimonials.title')}</h2>
          <div className="grid-2" style={{ marginTop: '2rem' }}>
            {TESTI_KEYS.map((key) => (
              <blockquote key={key} className="content-card reveal" style={{ fontStyle: 'italic' }}>
                <p style={{ fontSize: '1rem', lineHeight: 1.5 }}>« {t(`testimonials.items.${key}.quote`)} »</p>
                <footer style={{ marginTop: '1rem', fontStyle: 'normal' }} className="label-tag">{t(`testimonials.items.${key}.who`)}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section fx-grid fx-stack-1">
        <div className="inner">
          <h2 className="section-heading reveal">{t('faq.title')}</h2>
          <div className="grid-2" style={{ marginTop: '2rem' }}>
            {FAQ_KEYS.map((key) => (
              <div key={key} className="content-card reveal">
                <h3 className="card-title">{t(`faq.items.${key}.q`)}</h3>
                <p className="card-body">{t(`faq.items.${key}.a`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section fx-grid fx-glow fx-stack-1">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner" style={{ maxWidth: '480px' }}>
          <h2 className="section-heading reveal" style={{ textAlign: 'center' }}>{t('final_cta.title')}</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }} className="reveal">
            {t('final_cta.subtitle')}
          </p>
          <Suspense fallback={<div className="guide-form-card"><p>{t('section_main.loading')}</p></div>}>
            <GuideForm />
          </Suspense>
        </div>
      </section>
    </>
  )
}
