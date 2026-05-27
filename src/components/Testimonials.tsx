'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { TESTIMONIALS, type Testimonial } from '@/data/testimonials'
import VideoModal from './VideoModal'
import Icon from './Icon'

function Stars({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div className="testi-stars" role="img" aria-label={ariaLabel}>
      {[...Array(5)].map((_, i) => (
        <Icon key={i} name="star-fill" size={14} />
      ))}
    </div>
  )
}

export default function Testimonials() {
  const t = useTranslations('home.testimonials')
  const carouselRef = useRef<HTMLDivElement>(null)
  const [activeVideo, setActiveVideo] = useState<Testimonial | null>(null)

  function scrollBy(direction: 'prev' | 'next') {
    const el = carouselRef.current
    if (!el) return
    const card = el.querySelector('.testi-card') as HTMLElement | null
    const gap = 20
    const w = (card?.offsetWidth ?? 280) + gap
    el.scrollBy({ left: direction === 'next' ? w : -w, behavior: 'smooth' })
  }

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading">
      <div className="testimonials-glow" aria-hidden="true" />

      <div className="testi-layout">

        {/* Colonne gauche -titre + navigation */}
        <div className="testi-left reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            {t('label')}
          </span>
          <h2 id="testimonials-heading" className="testimonials-title">
            {t('title_line1')}<br />{t('title_line2')}<br />{t('title_line3')}<br />{t('title_line4')}
          </h2>
          <p className="testi-left-sub">
            {t('subtitle')}
          </p>
          <div className="testi-nav" aria-label={t('nav_aria')}>
            <button className="testi-nav-btn" onClick={() => scrollBy('prev')} aria-label={t('prev_aria')}>
              <Icon name="chevron-left" size={24} />
            </button>
            <button className="testi-nav-btn" onClick={() => scrollBy('next')} aria-label={t('next_aria')}>
              <Icon name="chevron-right" size={24} />
            </button>
          </div>
        </div>

        {/* Colonne droite -slider qui déborde */}
        <div className="testi-right">
          <div className="testi-carousel" ref={carouselRef}>
            {TESTIMONIALS.map((c, i) => (
              <div
                key={i}
                className="testi-card"
              >
                {/* Image portrait */}
                <div className="testi-img-wrap">
                  <Image src={c.img} alt={c.alt} className="testi-photo" width={280} height={380} />
                  {c.video && (
                    <button
                      type="button"
                      className="testi-play--btn"
                      onClick={() => setActiveVideo(c)}
                      aria-label={t('video_play_aria', { name: c.name })}
                    >
                      <Icon name="play" size={20} />
                    </button>
                  )}
                </div>

                {/* Infos sous l'image */}
                <div className="testi-info">
                  <Stars ariaLabel={t('stars_aria')} />
                  <p className="testi-quote">{c.quote}</p>
                  <span className="testi-name">{c.name}</span>
                  <span className="testi-discipline">{c.discipline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <VideoModal
        src={activeVideo?.video ?? null}
        poster={activeVideo?.videoPoster}
        title={activeVideo?.name}
        subtitle={activeVideo?.discipline}
        onClose={() => setActiveVideo(null)}
      />
    </section>
  )
}
