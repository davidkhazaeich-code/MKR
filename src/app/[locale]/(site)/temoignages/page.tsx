import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import VideoTestimonialsGrid from '@/components/VideoTestimonialsGrid'
import VerticalVideoSplit from '@/components/VerticalVideoSplit'
import Icon from '@/components/Icon'
import { TESTIMONIALS, hydrateTestimonials, type HydratedTestimonial } from '@/data/testimonials'
import { getAntoineParcoursProps } from '@/data/antoine-parcours'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'temoignages' })
  return buildMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/temoignages',
  })
}

function buildVideoItems(hydrated: HydratedTestimonial[]) {
  return TESTIMONIALS
    .filter(s => s.video && s.videoPoster)
    .map(s => {
      const h = hydrated.find(x => x.id === s.id)!
      return {
        name: h.name,
        discipline: h.discipline,
        label: h.videoLabel ?? 'Témoignage vidéo',
        poster: s.videoPoster!,
        video: s.video!,
      }
    })
}

function buildTextTestimonials(hydrated: HydratedTestimonial[]) {
  return TESTIMONIALS
    .filter(s => !s.video)
    .map(s => hydrated.find(x => x.id === s.id)!)
    .filter(Boolean)
}

function Stars({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div className="testi-stars" role="img" aria-label={ariaLabel}>
      {[...Array(5)].map((_, i) => (
        <Icon key={i} name="star-fill" size={14} />
      ))}
    </div>
  )
}

export default async function TemoignagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('temoignages')
  const tTesti = await getTranslations('data.testimonials')
  const tAntoine = await getTranslations('data.antoine-parcours')
  const hydrated = hydrateTestimonials(tTesti as never)
  const VIDEO_ITEMS = buildVideoItems(hydrated)
  const TEXT_TESTIMONIALS = buildTextTestimonials(hydrated)
  const antoineProps = getAntoineParcoursProps('temoignages', tAntoine as never)

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/temoignages' },
      ]} />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
      />

      {/* Featured : Antoine parcours (montage) */}
      <VerticalVideoSplit {...antoineProps} />

      {/* Videos */}
      <section className="logi-section fx-grid fx-stack-1">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('video_section.label')}</span>
            <h2>{t('video_section.title')}</h2>
          </div>
          <VideoTestimonialsGrid items={VIDEO_ITEMS} />
        </div>
      </section>

      {/* Grid temoignages texte */}
      <section className="logi-section logi-alt fx-texture-concrete fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('text_section.label')}</span>
            <h2>{t('text_section.title')}</h2>
          </div>
          <div className="grid-3">
            {TEXT_TESTIMONIALS.map((item, i) => (
              <div key={i} className="testi-page-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <div className="testi-page-header">
                  <img
                    src={item.img}
                    alt={item.alt}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="testi-avatar"
                  />
                  <div>
                    <span className="testi-name">{item.name}</span>
                    <span className="testi-discipline">{item.discipline}</span>
                  </div>
                </div>
                <Stars ariaLabel={t('stars_aria')} />
                <p className="testi-quote">&laquo; {item.quote} &raquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-band fx-glow fx-glow-breathe fx-stack-4">
        <div className="fx-glow-orb" />
        <div className="stat-item">
          <span className="stat-num">{t('stats_band.sessions.num')}</span>
          <span className="stat-label">{t('stats_band.sessions.label')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{t('stats_band.destinations.num')}</span>
          <span className="stat-label">{t('stats_band.destinations.label')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{t('stats_band.fondation.num')}</span>
          <span className="stat-label">{t('stats_band.fondation.label')}</span>
        </div>
      </div>

      <SectionCTA
        primaryHref="/inscription"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/sessions"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
