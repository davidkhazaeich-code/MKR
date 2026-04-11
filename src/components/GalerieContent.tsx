'use client'

import { useState } from 'react'

const FILTERS = ['Tout', 'Entrainement', 'Montagnes', 'Coachs', 'Culture']

const PHOTOS = [
  { category: 'Entrainement', alt: 'Sparring MMA contre le mur', img: '/images/action/sparring-mma-wall.webp' },
  { category: 'Montagnes', alt: 'Vue panoramique du Dagestan', img: '/images/environment/dagestan-panorama.webp' },
  { category: 'Culture', alt: 'Photo de groupe - fin de camp', img: '/images/galerie/group-photo.webp' },
  { category: 'Entrainement', alt: 'Takedown de lutte', img: '/images/action/takedown-wrestling.webp' },
  { category: 'Montagnes', alt: 'Village de Gamsutl', img: '/images/environment/gamsutl-village.webp' },
  { category: 'Entrainement', alt: 'Sparring en salle', img: '/images/galerie/gym-sparring.webp' },
  { category: 'Entrainement', alt: 'Travail de frappe sur mitaines', img: '/images/action/boxing-pads.webp' },
  { category: 'Montagnes', alt: 'Route de montagne vers le camp', img: '/images/galerie/road-to-camp.webp' },
  { category: 'Coachs', alt: 'Coach Zurab Khabelov', img: '/images/coaches/zurab-khabelov.webp' },
  { category: 'Culture', alt: 'Repas communautaire au camp', img: '/images/galerie/communal-dinner.webp' },
  { category: 'Entrainement', alt: 'Conditioning a la corde', img: '/images/action/conditioning-rope.webp' },
  { category: 'Montagnes', alt: 'Canyon de Sulak', img: '/images/environment/canyon-sulak.webp' },
  { category: 'Entrainement', alt: 'Lutte au tapis', img: '/images/galerie/wrestling-action.webp' },
  { category: 'Culture', alt: 'Mosquee de Grozny', img: '/images/environment/mosque-grozny.webp' },
  { category: 'Entrainement', alt: 'Kick au sac de frappe', img: '/images/galerie/kick-heavybag.webp' },
  { category: 'Coachs', alt: 'Coach Giorgi Meladze', img: '/images/coaches/giorgi-meladze.webp' },
  { category: 'Montagnes', alt: 'Lac de montagne, Caucase', img: '/images/galerie/mountain-lake.webp' },
  { category: 'Entrainement', alt: 'Course en montagne', img: '/images/galerie/mountain-run.webp' },
  { category: 'Montagnes', alt: 'Lever de soleil sur les tours Vainakh', img: '/images/galerie/sunrise-towers.webp' },
  { category: 'Entrainement', alt: 'Controle au sol', img: '/images/action/ground-control.webp' },
  { category: 'Coachs', alt: 'Coach Tamaz Kvaratskhelia', img: '/images/coaches/tamaz-kvaratskhelia.webp' },
  { category: 'Montagnes', alt: 'Panorama du Caucase', img: '/images/galerie/caucasus-panorama.webp' },
  { category: 'Entrainement', alt: 'Preparation - bandage des mains', img: '/images/galerie/hand-wraps.webp' },
  { category: 'Montagnes', alt: 'Lac Kezenoy-Am', img: '/images/environment/lake-kezenoy.webp' },
  { category: 'Culture', alt: 'Repas communautaire', img: '/images/environment/communal-meal.webp' },
  { category: 'Entrainement', alt: 'Projection de Sambo', img: '/images/action/sambo-throw.webp' },
  { category: 'Culture', alt: 'Tours Vainakh', img: '/images/environment/vainakh-towers.webp' },
  { category: 'Entrainement', alt: 'Shadowboxing de groupe', img: '/images/action/shadowboxing-group.webp' },
  { category: 'Coachs', alt: 'Coach Levan Skhirtladze dans la salle', img: '/images/galerie/coach-levan-gym.webp' },
  { category: 'Entrainement', alt: 'Echauffement de groupe au tapis', img: '/images/galerie/group-stretching.webp' },
  { category: 'Culture', alt: 'Ceremonie du the apres entrainement', img: '/images/galerie/tea-ceremony.webp' },
  { category: 'Montagnes', alt: 'Sentier de montagne dans la brume, Caucase', img: '/images/galerie/mountain-mist-trail.webp' },
]

export default function GalerieContent() {
  const [filter, setFilter] = useState('Tout')
  const filtered = filter === 'Tout' ? PHOTOS : PHOTOS.filter(p => p.category === filter)

  return (
    <>
      <section className="galerie-section fx-grid fx-stack-1">
        <div className="inner">
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-tab${filter === f ? ' is-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="galerie-grid">
            {filtered.map((photo, i) => (
              <figure key={`${photo.alt}-${i}`} className="photo-card reveal" style={{ transitionDelay: `${(i % 6) * 0.05}s` }}>
                <img
                  src={photo.img}
                  alt={photo.alt}
                  loading="lazy"
                  className="galerie-photo-img"
                  style={{ aspectRatio: i % 3 === 0 ? '3/4' : '4/3' }}
                />
                <figcaption>{photo.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="logi-section logi-alt fx-texture-concrete fx-mask-a fx-stack-2">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>VIDEOS</span>
            <h2>EN MOUVEMENT</h2>
          </div>
          <div className="grid-2">
            {[1, 2].map(i => (
              <div key={i} className="content-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div style={{ aspectRatio: '16/9', background: 'var(--surface-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 40 40" width="40" height="40" fill="none" style={{ opacity: 0.3 }}>
                    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" />
                    <polygon points="16,12 30,20 16,28" fill="currentColor" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
