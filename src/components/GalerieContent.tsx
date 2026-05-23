'use client'

import { useState } from 'react'
import Icon from './Icon'

const FILTERS = ['Tout', 'Lutte', 'MMA', 'Coachs', 'Culture', 'Montagnes'] as const
type FilterValue = typeof FILTERS[number]

type Photo = {
  category: Exclude<FilterValue, 'Tout'>
  alt: string
  img: string
  /** true = paysage ou moment culturel : garde la couleur, pas de filtre N&B */
  color?: boolean
}

const PHOTOS: Photo[] = [
  // ─── LUTTE · Daghestan (16 vraies photos terrain) ───────────────────────
  { category: 'Lutte', alt: "Single leg en cercle, lutteurs daghestanais au tapis", img: '/images/ruslan/lutte/singleleg-cercle.webp' },
  { category: 'Lutte', alt: 'Single leg avec coach russe, prise au sol', img: '/images/ruslan/lutte/singleleg-rus.webp' },
  { category: 'Lutte', alt: 'Suplex en cercle, démonstration au tapis', img: '/images/ruslan/lutte/suplex-cercle.webp' },
  { category: 'Lutte', alt: 'Drill de lutte au Daghestan, contrôle au sol', img: '/images/ruslan/lutte/dagestan-drill.webp' },
  { category: 'Lutte', alt: 'Clinch debout, lutteurs ados', img: '/images/ruslan/lutte/clinch-ados.webp' },
  { category: 'Lutte', alt: 'Contrôle de tête en clinch debout', img: '/images/ruslan/lutte/clinch-tete.webp' },
  { category: 'Lutte', alt: 'Drill stand-up, position de garde', img: '/images/ruslan/lutte/drill-standup.webp' },
  { category: 'Lutte', alt: 'Projection avec un jeune lutteur', img: '/images/ruslan/lutte/projection-kid.webp' },
  { category: 'Lutte', alt: 'Cardio sprawl, conditionnement au tapis', img: '/images/ruslan/lutte/cardio-sprawl.webp' },
  { category: 'Lutte', alt: 'Course de cardio, échauffement collectif', img: '/images/ruslan/lutte/cardio-course.webp' },
  { category: 'Lutte', alt: "Coach mène l'échauffement, alignement de lutteurs", img: '/images/ruslan/lutte/coach-echauffement.webp' },
  { category: 'Lutte', alt: 'Flexion debout, mobilité hanches', img: '/images/ruslan/lutte/flexion-debout.webp' },
  { category: 'Lutte', alt: 'Étirements au sol, fin de session', img: '/images/ruslan/lutte/stretch-sol.webp' },
  { category: 'Lutte', alt: 'Récupération collective au tapis', img: '/images/ruslan/lutte/recup-collective.webp' },
  { category: 'Lutte', alt: 'Briefing jeunes lutteurs avant la session', img: '/images/ruslan/lutte/kids-briefing.webp' },
  { category: 'Lutte', alt: 'Salle de lutte daghestanaise, bannière au mur', img: '/images/ruslan/lutte/salle-banniere.webp' },

  // ─── MMA · Tchétchénie (20 vraies photos sélection éditoriale) ──────────
  { category: 'MMA', alt: 'Khamzat Chimaev avec ceinture UFC, club Akhmat Grozny', img: '/images/mma-tchechenie/chimaev-ceinture-ufc.webp' },
  { category: 'MMA', alt: 'Combattant en cage rouge, gants verts et dorés', img: '/images/mma-tchechenie/portrait-cage-rouge.webp' },
  { category: 'MMA', alt: 'Portrait dans la cage, gants verts dorés, sweat post-séance', img: '/images/mma-tchechenie/portrait-cage-gants-verts.webp' },
  { category: 'MMA', alt: 'Sparring face à face, garde en position MMA', img: '/images/mma-tchechenie/sparring-face-a-face.webp' },
  { category: 'MMA', alt: 'Portrait combattant débardeur Smilodox devant sacs de frappe', img: '/images/mma-tchechenie/portrait-smilodox.webp' },
  { category: 'MMA', alt: 'Crochet sur pads, combattant veste RCA + coach senior', img: '/images/mma-tchechenie/crochet-rca-coach.webp' },
  { category: 'MMA', alt: 'Esprit du camp, deux combattants Venum et Akhmat Power', img: '/images/mma-tchechenie/duo-akhmat-power.webp' },
  { category: 'MMA', alt: 'Bandage des mains avant la session, ambiance vestiaire', img: '/images/mma-tchechenie/bandage-mains-sourire.webp' },
  { category: 'MMA', alt: "Briefing coach Akhmat Power avec quatre combattants", img: '/images/mma-tchechenie/briefing-coach-4-combattants.webp' },
  { category: 'MMA', alt: 'Kick haut sur pad, coach barbe blanche', img: '/images/mma-tchechenie/kick-haut-kadyrov.webp' },
  { category: 'MMA', alt: 'Direct pads avec coach senior', img: '/images/mma-tchechenie/pads-direct-kadyrov.webp' },
  { category: 'MMA', alt: 'Jab sur pads, ambiance club Akhmat', img: '/images/mma-tchechenie/pads-jab-kadyrov.webp' },
  { category: 'MMA', alt: 'Pads dans la cage, décor AKHMAT SILA', img: '/images/mma-tchechenie/pads-akhmat-sila.webp' },
  { category: 'MMA', alt: 'Sparring en cage, combattant turquoise vs coach noir', img: '/images/mma-tchechenie/sparring-cage-turquoise.webp' },
  { category: 'MMA', alt: 'Sparring en cage, coach noir Akhmat Fight Club', img: '/images/mma-tchechenie/sparring-cage-coach-noir.webp' },
  { category: 'MMA', alt: 'Groupe de cinq combattants assis dans la cage', img: '/images/mma-tchechenie/team-5-cage.webp' },
  { category: 'MMA', alt: 'Portrait du coach lunettes en cage', img: '/images/mma-tchechenie/coach-cage-portrait.webp' },
  { category: 'MMA', alt: 'Low kick en cage rouge', img: '/images/mma-tchechenie/low-kick-cage.webp' },
  { category: 'MMA', alt: 'Duo post-sparring, ambiance fraternité', img: '/images/mma-tchechenie/duo-post-sparring.webp' },
  { category: 'MMA', alt: 'Coach Akhmat Power prend soin d\'un combattant blessé à la cheville', img: '/images/mma-tchechenie/coach-care-blesse.webp' },

  // ─── COACHS · portraits Ruslan + coachs locaux (5) ──────────────────────
  { category: 'Coachs', alt: 'Ruslan Mukhtarov, fondateur MKR, portrait chemise noire', img: '/images/ruslan/ruslan-portrait-chemise-noire.webp' },
  { category: 'Coachs', alt: 'Ruslan en équipe de France de lutte, takedown au championnat', img: '/images/ruslan/ruslan-championnat-france-takedown.webp' },
  { category: 'Coachs', alt: 'Ruslan Mukhtarov face à son adversaire, scoreboard Fédération française', img: '/images/ruslan/ruslan-championnat-france-ffl.webp' },
  { category: 'Coachs', alt: 'Ruslan en clinch de lutte, portrait noir et blanc', img: '/images/ruslan/ruslan-lutte-clinch-nb.webp' },
  { category: 'Coachs', alt: 'Deux coachs daghestanais en salle, espalier en bois', img: '/images/ruslan/coaches/coachs-salle-espalier-mkr.webp' },

  // ─── CULTURE · moments forts à garder en couleur (4) ────────────────────
  { category: 'Culture', alt: 'Prière collective musulmane sur tapis de lutte, lutteurs alignés', img: '/images/ruslan/heritage/priere-collective-mkr.webp', color: true },
  { category: 'Culture', alt: 'Combattants réunis sur le tapis avant la session', img: '/images/galerie-real/mma-team-cluster.webp', color: true },
  { category: 'Culture', alt: 'Antoine Petit-Jean au camp, combattant MMA invité', img: '/images/galerie-real/antoine-petit-jean.webp', color: true },
  { category: 'Culture', alt: 'Combattants adultes assis sur tapis rouge, équipements ACA, MANTO et Reebok', img: '/images/ruslan/action/mma-adultes-cercle.webp', color: true },

  // ─── MONTAGNES · paysages du Caucase, couleur conservée (10) ────────────
  { category: 'Montagnes', alt: 'Coucher de soleil sur les montagnes du Caucase, quad au sommet', img: '/images/galerie-real/quad-golden-hour.webp', color: true },
  { category: 'Montagnes', alt: 'Canyon de Sulak, passerelle sur les falaises', img: '/images/galerie-real/canyon-sulak-overlook.webp', color: true },
  { category: 'Montagnes', alt: 'Panorama du Daghestan, chaînes du Caucase', img: '/images/environment/dagestan-panorama.webp', color: true },
  { category: 'Montagnes', alt: 'Village suspendu de Gamsutl, Daghestan', img: '/images/environment/gamsutl-village.webp', color: true },
  { category: 'Montagnes', alt: 'Lac de montagne dans le Caucase', img: '/images/galerie/mountain-lake.webp', color: true },
  { category: 'Montagnes', alt: 'Lac Kezenoy-Am, frontière Daghestan Tchétchénie', img: '/images/environment/lake-kezenoy.webp', color: true },
  { category: 'Montagnes', alt: 'Tours Vaïnakh, architecture traditionnelle tchétchène', img: '/images/environment/vainakh-towers.webp', color: true },
  { category: 'Montagnes', alt: 'Lever de soleil sur les tours Vaïnakh', img: '/images/galerie/sunrise-towers.webp', color: true },
  { category: 'Montagnes', alt: 'Panorama du Caucase, chaîne enneigée', img: '/images/galerie/caucasus-panorama.webp', color: true },
  { category: 'Montagnes', alt: 'Sentier de montagne dans la brume, Caucase', img: '/images/galerie/mountain-mist-trail.webp', color: true },
]

export default function GalerieContent() {
  const [filter, setFilter] = useState<FilterValue>('Tout')
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
              <figure key={`${photo.img}-${i}`} className="photo-card reveal" style={{ transitionDelay: `${(i % 6) * 0.05}s` }}>
                <img
                  src={photo.img}
                  alt={photo.alt}
                  loading="lazy"
                  className={`galerie-photo-img${photo.color ? ' galerie-photo-img--color' : ''}`}
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
