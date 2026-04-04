'use client'

import { useRef } from 'react'

const CARDS = [
  {
    img: '/images/testimonials/mehdi-r.webp',
    alt: 'Mehdi R. — Lutte Libre, Paris',
    name: 'Mehdi R.',
    discipline: 'Lutte Libre · Paris',
    quote: '« Trois semaines qui ont changé ma façon de me battre. La dureté des entraînements m\'a obligé à aller chercher ce que je n\'avais jamais touché. »',
  },
  {
    img: '/images/testimonials/karim-d.webp',
    alt: 'Karim D. — MMA, Genève',
    name: 'Karim D.',
    discipline: 'MMA · Genève',
    quote: '« Le niveau des coachs est inégalable. Zurab t\'apprend des prises que tu ne verras nulle part en Europe. J\'y retourne l\'année prochaine. »',
  },
  {
    img: '/images/testimonials/thomas-b.webp',
    alt: 'Thomas B. — Boxe, Lyon',
    name: 'Thomas B.',
    discipline: 'Boxe · Lyon',
    quote: '« Deux semaines après le retour, j\'ai remporté mon premier titre régional. Ce que j\'ai construit là-bas, aucun gym en France ne pouvait me donner. »',
  },
  {
    img: '/images/testimonials/yassine-k.webp',
    alt: 'Yassine K. — Grappling, Bruxelles',
    name: 'Yassine K.',
    discipline: 'Grappling · Bruxelles',
    quote: '« Un mois de camp qui vaut deux ans de salle. Les Dagestanais t\'apprennent à souffrir avec le sourire. Je suis revenu transformé. »',
  },
  {
    img: '/images/testimonials/romain-v.webp',
    alt: 'Romain V. — Sambo, Toulouse',
    name: 'Romain V.',
    discipline: 'Sambo · Toulouse',
    quote: '« Je suis parti seul, sans parler russe. L\'accueil est incroyable. Sur le tapis, le niveau est brutal — exactement ce que je cherchais. »',
  },
  {
    img: '/images/testimonials/adam-s.webp',
    alt: 'Adam S. — Lutte, Montréal',
    name: 'Adam S.',
    discipline: 'Lutte · Montréal',
    quote: '« Le Caucase, c\'est une autre planète. Les entraînements du matin à 6h t\'apprennent ce que c\'est que la discipline. Je repars l\'été prochain. »',
  },
  {
    img: '/images/testimonials/lucas-m.webp',
    alt: 'Lucas M. — MMA, Zurich',
    name: 'Lucas M.',
    discipline: 'MMA · Zurich',
    quote: '« Trois semaines, six kilos de transpiration et une vision du combat totalement différente. Ce camp m\'a redonné faim de compétition. »',
  },
  {
    img: '/images/testimonials/amine-b.webp',
    alt: 'Amine B. — Jiu-Jitsu, Lyon',
    name: 'Amine B.',
    discipline: 'Jiu-Jitsu · Lyon',
    quote: '« Les coachs du camp connaissent des techniques que tu ne trouveras dans aucun livre. Une expérience sportive et humaine que je conseille à tout compétiteur. »',
  },
  {
    img: '/images/testimonials/pierre-l.webp',
    alt: 'Pierre L. — Kickboxing, Nantes',
    name: 'Pierre L.',
    discipline: 'Kickboxing · Nantes',
    quote: '« Le groupe, l\'ambiance, les montagnes en fond de tapis… On touche quelque chose de rare. Revenu avec une médaille et des souvenirs pour la vie. »',
  },
]

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

        {/* Colonne gauche — titre + navigation */}
        <div className="testi-left reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            TÉMOIGNAGES
          </span>
          <h2 id="testimonials-heading" className="testimonials-title">
            ILS ONT<br />GRAVI LE<br />SOMMET
          </h2>
          <p className="testi-left-sub">
            Des athlètes de toute l&apos;Europe. Un seul verdict.
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

        {/* Colonne droite — slider qui déborde */}
        <div className="testi-right">
          <div className="testi-carousel" ref={carouselRef}>
            {CARDS.map((c, i) => (
              <div
                key={i}
                className="testi-card"
              >
                {/* Image portrait */}
                <div className="testi-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img} alt={c.alt} className="testi-photo" />
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
