'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { TESTIMONIALS } from '@/data/testimonials'

function Stars() {
  return (
    <div className="testi-stars" aria-label="5 étoiles sur 5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <polygon points="7,1 9,5 13,5.5 10,8.5 10.5,13 7,11 3.5,13 4,8.5 1,5.5 5,5" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const carouselRef = useRef<HTMLDivElement>(null)

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
            TÉMOIGNAGES
          </span>
          <h2 id="testimonials-heading" className="testimonials-title">
            ILS EN<br />SONT<br />REVENUS<br />CHANGÉS
          </h2>
          <p className="testi-left-sub">
            Des athlètes de toute l&apos;Europe. Tous transformés.
          </p>
          <div className="testi-nav" aria-label="Navigation du carousel">
            <button className="testi-nav-btn" onClick={() => scrollBy('prev')} aria-label="Témoignage précédent">
              <svg viewBox="0 0 24 24" fill="none">
                <polyline points="15,6 9,12 15,18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="testi-nav-btn" onClick={() => scrollBy('next')} aria-label="Témoignage suivant">
              <svg viewBox="0 0 24 24" fill="none">
                <polyline points="9,6 15,12 9,18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
                  <div className="testi-play" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none">
                      <polygon points="5,3 17,10 5,17" fill="#F8F8F8" />
                    </svg>
                  </div>
                </div>

                {/* Infos sous l'image */}
                <div className="testi-info">
                  <Stars />
                  <p className="testi-quote">{c.quote}</p>
                  <span className="testi-name">{c.name}</span>
                  <span className="testi-discipline">{c.discipline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
