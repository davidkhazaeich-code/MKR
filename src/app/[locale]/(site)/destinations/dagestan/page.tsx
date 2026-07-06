import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import DestinationReveal from '@/components/DestinationReveal'
import CinematicReveal from '@/components/CinematicReveal'
import DestinationSafetyProtocol from '@/components/DestinationSafetyProtocol'
import TldrBox from '@/components/TldrBox'
import UpdatedAt from '@/components/UpdatedAt'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import PageFaq from '@/components/PageFaq'
import PriceAnchor from '@/components/PriceAnchor'
import type { FAQItem } from '@/components/FAQAccordion'

const UPDATED = '2026-07-06'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'destinations.dagestan' })
  return localizedMetadata(
    '/destinations/dagestan',
    locale as Locale,
    t('meta.title'),
    t('meta.description'),
  )
}

const EXCURSION_KEYS = ['sulak', 'sarykum', 'gamsutl'] as const

const EXCURSION_IMAGES: Record<typeof EXCURSION_KEYS[number], string> = {
  sulak: '/images/environment/canyon-sulak.webp',
  sarykum: '/images/environment/sarykum-dune.webp',
  gamsutl: '/images/environment/gamsutl-village.webp',
}

export default async function DagestanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('destinations.dagestan')

  const faqItems = t.raw('faq.items') as FAQItem[]

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.destinations'), url: 'https://mkrcamp.com/destinations' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/destinations/dagestan' },
      ]} />
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        breadcrumb={[
          { href: '/destinations', label: t('breadcrumb.destinations') },
          { href: '/destinations/dagestan', label: t('breadcrumb.current') },
        ]}
      />

      <div className="inner">
        <TldrBox
          title={t('tldr.title')}
          facts={t.raw('tldr.facts') as string[]}
        />
        <UpdatedAt date={UPDATED} />
      </div>

      <DestinationReveal
        image="/images/environment/dagestan-horses.webp"
        alt={t('reveal.image_alt')}
        label={t('reveal.label')}
        title={t('reveal.title')}
        facts={[
          { label: t('reveal.facts.capitale'), value: t('reveal.facts.capitale_value') },
          { label: t('reveal.facts.altitude'), value: t('reveal.facts.altitude_value') },
          { label: t('reveal.facts.olympiques'), value: t('reveal.facts.olympiques_value') },
          { label: t('reveal.facts.khasavyurt'), value: t('reveal.facts.khasavyurt_value') },
          { label: t('reveal.facts.salles'), value: t('reveal.facts.salles_value') },
          { label: t('reveal.facts.population'), value: t('reveal.facts.population_value') },
        ]}
        badges={t.raw('reveal.badges') as string[]}
      />

      {/* Presentation */}
      <section className="logi-section fx-grid fx-stack-1">
        <div className="inner">
          <div className="reveal" style={{ maxWidth: '780px', margin: '0 auto' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('presentation.label')}</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)', textTransform: 'uppercase' }}>{t('presentation.title')}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              {t('presentation.p1')}
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              {t('presentation.p2')}
            </p>
          </div>
        </div>
      </section>

      <DestinationSafetyProtocol
        narrative={
          <>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {t('safety.p1')}
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              {t('safety.p2')}
            </p>
          </>
        }
        testimonial={{
          quote: t('safety.testimonial_quote'),
          author: t('safety.testimonial_author'),
        }}
      />

      {/* Lieux d'entraînement */}
      <section className="logi-section fx-grid fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('salles.label')}</span>
            <h2>{t('salles.title')}</h2>
          </div>
          <div className="grid-2">
            <figure className="photo-card reveal">
              <img
                src="/images/action/lutte-banner-makhachkala.webp"
                alt={t('salles.photo1_alt')}
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>{t('salles.photo1_caption')}</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: '0.1s' }}>
              <img
                src="/images/action/lutte-coach-gereev.webp"
                alt={t('salles.photo2_alt')}
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>{t('salles.photo2_caption')}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Culture & excursions */}
      <section className="logi-section fx-texture-basalt fx-mask-c fx-stack-4 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('excursions.label')}</span>
            <h2>{t('excursions.title')}</h2>
          </div>
          <div className="grid-3">
            {EXCURSION_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <img
                  src={EXCURSION_IMAGES[key]}
                  alt={t(`excursions.items.${key}.title`)}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
                <h3 className="card-title">{t(`excursions.items.${key}.title`)}</h3>
                <p className="card-body">{t(`excursions.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/environment/mountain-road.webp"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      {/* Prix transparent + prochaine session + places live */}
      <PriceAnchor discipline="lutte" href="/inscription?type=session" />

      {/* Objections zone + JSON-LD FAQPage */}
      <PageFaq
        label={t('faq.label')}
        title={t('faq.title')}
        items={faqItems}
        id="faq-dagestan"
      />

      {/* Logistique resume */}
      <section className="logi-section fx-grid fx-stack-5">
        <div className="inner">
          <div className="group-card reveal">
            <h2>{t('logistique.title')}</h2>
            <p>{t('logistique.body')}</p>
            <Link href="/logistique" className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
              {t('logistique.cta')}
            </Link>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/programme/lutte"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
