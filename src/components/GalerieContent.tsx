'use client'

import { useState } from 'react'
import Icon from './Icon'

const FILTERS = ['Tout', 'Entraînement', 'Montagnes', 'Coachs', 'Culture']

const PHOTOS = [
  // Vraies photos terrain (Ruslan + Antoine au camp)
  { category: 'Entraînement', alt: "Cercle d'entraînement, démonstration grappling au tapis rouge", img: '/images/galerie-real/mma-cercle-session.webp' },
  { category: 'Entraînement', alt: 'Contrôle au sol, side mount', img: '/images/galerie-real/mma-side-mount.webp' },
  { category: 'Entraînement', alt: 'Soumission, rear naked choke', img: '/images/galerie-real/mma-choke.webp' },
  { category: 'Coachs', alt: 'Coachs caucasiens dans la salle', img: '/images/galerie-real/coachs-salle.webp' },
  { category: 'Culture', alt: 'Combattants réunis sur le tapis avant la session', img: '/images/galerie-real/mma-team-cluster.webp' },
  { category: 'Culture', alt: 'Prière collective sur le tapis, aube au camp', img: '/images/galerie-real/priere-collective.webp' },
  { category: 'Culture', alt: 'Antoine Petit-Jean au camp, combattant MMA invité', img: '/images/galerie-real/antoine-petit-jean.webp' },
  { category: 'Montagnes', alt: 'Coucher de soleil sur les montagnes du Caucase, quad au sommet', img: '/images/galerie-real/quad-golden-hour.webp' },
  { category: 'Montagnes', alt: 'Canyon de Sulak depuis la terrasse, pont suspendu', img: '/images/galerie-real/canyon-sulak-overlook.webp' },
  // Images d'ambiance (generees)
  { category: 'Entraînement', alt: 'Sparring MMA contre le mur', img: '/images/action/sparring-mma-wall.webp' },
  { category: 'Montagnes', alt: 'Vue panoramique du Daghestan', img: '/images/environment/dagestan-panorama.webp' },
  { category: 'Culture', alt: 'Photo de groupe, fin de camp', img: '/images/galerie/group-photo.webp' },
  { category: 'Entraînement', alt: 'Takedown de lutte', img: '/images/action/takedown-wrestling.webp' },
  { category: 'Montagnes', alt: 'Village de Gamsutl', img: '/images/environment/gamsutl-village.webp' },
  { category: 'Entraînement', alt: 'Sparring en salle', img: '/images/galerie/gym-sparring.webp' },
  { category: 'Entraînement', alt: 'Travail de frappe sur mitaines', img: '/images/action/boxing-pads.webp' },
  { category: 'Montagnes', alt: 'Route de montagne vers le camp', img: '/images/galerie/road-to-camp.webp' },
  { category: 'Coachs', alt: 'Coach Magomed Magomedov', img: '/images/coaches/magomed-magomedov.webp' },
  { category: 'Culture', alt: 'Repas communautaire au camp', img: '/images/galerie/communal-dinner.webp' },
  { category: 'Entraînement', alt: 'Conditioning à la corde', img: '/images/action/conditioning-rope.webp' },
  { category: 'Montagnes', alt: 'Canyon de Sulak', img: '/images/environment/canyon-sulak.webp' },
  { category: 'Entraînement', alt: 'Lutte au tapis', img: '/images/galerie/wrestling-action.webp' },
  { category: 'Culture', alt: 'Mosquée Akhmad Kadyrov, Grozny, Tchétchénie', img: '/images/environment/mosque-grozny.webp' },
  { category: 'Entraînement', alt: 'Kick au sac de frappe', img: '/images/galerie/kick-heavybag.webp' },
  { category: 'Coachs', alt: 'Coach Khasan Akhmedov', img: '/images/coaches/khasan-akhmedov.webp' },
  { category: 'Montagnes', alt: 'Lac de montagne, Caucase', img: '/images/galerie/mountain-lake.webp' },
  { category: 'Entraînement', alt: 'Course en montagne', img: '/images/galerie/mountain-run.webp' },
  { category: 'Montagnes', alt: 'Lever de soleil sur les tours Vainakh', img: '/images/galerie/sunrise-towers.webp' },
  { category: 'Entraînement', alt: 'Contrôle au sol', img: '/images/action/ground-control.webp' },
  { category: 'Coachs', alt: 'Coach Akhmed Bashaev', img: '/images/coaches/akhmed-bashaev.webp' },
  { category: 'Montagnes', alt: 'Panorama du Caucase', img: '/images/galerie/caucasus-panorama.webp' },
  { category: 'Entraînement', alt: 'Préparation, bandage des mains', img: '/images/galerie/hand-wraps.webp' },
  { category: 'Montagnes', alt: 'Lac Kezenoy-Am', img: '/images/environment/lake-kezenoy.webp' },
  { category: 'Culture', alt: 'Repas communautaire', img: '/images/environment/communal-meal.webp' },
  { category: 'Entraînement', alt: 'Projection de Sambo', img: '/images/action/sambo-throw.webp' },
  { category: 'Culture', alt: 'Tours Vainakh', img: '/images/environment/vainakh-towers.webp' },
  { category: 'Entraînement', alt: 'Shadowboxing de groupe', img: '/images/action/shadowboxing-group.webp' },
  { category: 'Coachs', alt: 'Coach Shamil Khalilov dans la salle', img: '/images/galerie/coach-shamil-gym.webp' },
  { category: 'Entraînement', alt: 'Échauffement de groupe au tapis', img: '/images/galerie/group-stretching.webp' },
  { category: 'Culture', alt: 'Cérémonie du thé après entraînement', img: '/images/galerie/tea-ceremony.webp' },
  { category: 'Montagnes', alt: 'Sentier de montagne dans la brume, Caucase', img: '/images/galerie/mountain-mist-trail.webp' },
  { category: 'Entraînement', alt: 'Clinch debout, drilling MMA', img: '/images/galerie/clinch-drilling.webp' },
  { category: 'Entraînement', alt: 'Grimpe à la corde', img: '/images/galerie/rope-climb.webp' },
  { category: 'Entraînement', alt: 'Takedown de lutte, high crotch', img: '/images/galerie/wrestling-takedown.webp' },
  { category: 'Entraînement', alt: 'Coude rotatif sur paos', img: '/images/galerie/elbow-pads.webp' },
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
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>VIDÉOS</span>
            <h2>EN MOUVEMENT</h2>
          </div>
          <div className="grid-2">
            {[1, 2].map(i => (
              <div key={i} className="content-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div style={{ aspectRatio: '16/9', background: 'var(--surface-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ opacity: 0.3 }}>
                    <Icon name="play" size={40} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
