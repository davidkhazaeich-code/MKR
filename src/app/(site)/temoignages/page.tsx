import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import VideoTestimonialsGrid from '@/components/VideoTestimonialsGrid'
import { TESTIMONIALS } from '@/data/testimonials'

export const metadata: Metadata = {
  title: 'Témoignages athlètes | Camp MKR au Caucase',
  description: "Ils sont venus, ils racontent. Témoignages vidéo et écrits d'athlètes qui ont vécu l'expérience MKR au Caucase (Lutte au Daghestan, MMA en Tchétchénie).",
  alternates: { canonical: 'https://mkrcamp.com/temoignages' },
}

const VIDEO_ITEMS = TESTIMONIALS
  .filter(t => t.video && t.videoPoster)
  .map(t => ({
    name: t.name,
    discipline: t.discipline,
    label: t.videoLabel ?? 'Témoignage vidéo',
    poster: t.videoPoster!,
    video: t.video!,
  }))

const TEXT_TESTIMONIALS = TESTIMONIALS.filter(t => !t.video)

function Stars() {
  return (
    <div className="testi-stars" role="img" aria-label="5 étoiles sur 5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <polygon points="7,1 9,5 13,5.5 10,8.5 10.5,13 7,11 3.5,13 4,8.5 1,5.5 5,5" />
        </svg>
      ))}
    </div>
  )
}

export default function TemoignagesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Témoignages', url: 'https://mkrcamp.com/temoignages' },
      ]} />

      <PageHero
        label="TÉMOIGNAGES"
        title="ILS SONT VENUS.<br/>ILS RACONTENT."
        subtitle="Des athlètes de toute l'Europe. Un seul verdict."
      />

      {/* Videos */}
      <section className="logi-section fx-grid fx-stack-1">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>VIDÉOS</span>
            <h2>TÉMOIGNAGES VIDÉO</h2>
          </div>
          <VideoTestimonialsGrid items={VIDEO_ITEMS} />
        </div>
      </section>

      {/* Grid temoignages texte */}
      <section className="logi-section logi-alt fx-texture-concrete fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>ÉCRITS</span>
            <h2>TÉMOIGNAGES</h2>
          </div>
          <div className="grid-3">
            {TEXT_TESTIMONIALS.map((t, i) => (
              <div key={i} className="testi-page-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <div className="testi-page-header">
                  <img
                    src={t.img}
                    alt={t.alt}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="testi-avatar"
                  />
                  <div>
                    <span className="testi-name">{t.name}</span>
                    <span className="testi-discipline">{t.discipline}</span>
                  </div>
                </div>
                <Stars />
                <p className="testi-quote">&laquo; {t.quote} &raquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-band fx-glow fx-glow-breathe fx-stack-4">
        <div className="fx-glow-orb" />
        <div className="stat-item">
          <span className="stat-num">4</span>
          <span className="stat-label">Sessions par an</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">2</span>
          <span className="stat-label">Destinations Caucase</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">2018</span>
          <span className="stat-label">Année de fondation</span>
        </div>
      </div>

      <SectionCTA
        primaryHref="/inscription"
        primaryLabel="À TON TOUR"
        ghostHref="/sessions"
        ghostLabel="VOIR LES SESSIONS"
      />
    </>
  )
}
