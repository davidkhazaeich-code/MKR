'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Icon from './Icon'

const FILTERS = ['Tout', 'Lutte', 'MMA', 'Coachs', 'Culture', 'Montagnes'] as const
type FilterValue = typeof FILTERS[number]

type Photo = {
  key: string
  category: Exclude<FilterValue, 'Tout'>
  img: string
}

const PHOTOS: Photo[] = [
  { key: 'lutte_singleleg_cercle', category: 'Lutte', img: '/images/ruslan/lutte/singleleg-cercle.webp' },
  { key: 'lutte_singleleg_rus', category: 'Lutte', img: '/images/ruslan/lutte/singleleg-rus.webp' },
  { key: 'lutte_suplex_cercle', category: 'Lutte', img: '/images/ruslan/lutte/suplex-cercle.webp' },
  { key: 'lutte_dagestan_drill', category: 'Lutte', img: '/images/ruslan/lutte/dagestan-drill.webp' },
  { key: 'lutte_clinch_ados', category: 'Lutte', img: '/images/ruslan/lutte/clinch-ados.webp' },
  { key: 'lutte_clinch_tete', category: 'Lutte', img: '/images/ruslan/lutte/clinch-tete.webp' },
  { key: 'lutte_drill_standup', category: 'Lutte', img: '/images/ruslan/lutte/drill-standup.webp' },
  { key: 'lutte_projection_kid', category: 'Lutte', img: '/images/ruslan/lutte/projection-kid.webp' },
  { key: 'lutte_cardio_sprawl', category: 'Lutte', img: '/images/ruslan/lutte/cardio-sprawl.webp' },
  { key: 'lutte_cardio_course', category: 'Lutte', img: '/images/ruslan/lutte/cardio-course.webp' },
  { key: 'lutte_coach_echauffement', category: 'Lutte', img: '/images/ruslan/lutte/coach-echauffement.webp' },
  { key: 'lutte_flexion_debout', category: 'Lutte', img: '/images/ruslan/lutte/flexion-debout.webp' },
  { key: 'lutte_stretch_sol', category: 'Lutte', img: '/images/ruslan/lutte/stretch-sol.webp' },
  { key: 'lutte_recup_collective', category: 'Lutte', img: '/images/ruslan/lutte/recup-collective.webp' },
  { key: 'lutte_kids_briefing', category: 'Lutte', img: '/images/ruslan/lutte/kids-briefing.webp' },
  { key: 'lutte_salle_banniere', category: 'Lutte', img: '/images/ruslan/lutte/salle-banniere.webp' },

  { key: 'mma_chimaev_ceinture', category: 'MMA', img: '/images/mma-tchechenie/chimaev-ceinture-ufc.webp' },
  { key: 'mma_portrait_cage_rouge', category: 'MMA', img: '/images/mma-tchechenie/portrait-cage-rouge.webp' },
  { key: 'mma_portrait_cage_gants_verts', category: 'MMA', img: '/images/mma-tchechenie/portrait-cage-gants-verts.webp' },
  { key: 'mma_sparring_face_a_face', category: 'MMA', img: '/images/mma-tchechenie/sparring-face-a-face.webp' },
  { key: 'mma_portrait_smilodox', category: 'MMA', img: '/images/mma-tchechenie/portrait-smilodox.webp' },
  { key: 'mma_crochet_rca_coach', category: 'MMA', img: '/images/mma-tchechenie/crochet-rca-coach.webp' },
  { key: 'mma_duo_akhmat_power', category: 'MMA', img: '/images/mma-tchechenie/duo-akhmat-power.webp' },
  { key: 'mma_bandage_mains', category: 'MMA', img: '/images/mma-tchechenie/bandage-mains-sourire.webp' },
  { key: 'mma_briefing_coach', category: 'MMA', img: '/images/mma-tchechenie/briefing-coach-4-combattants.webp' },
  { key: 'mma_kick_haut_kadyrov', category: 'MMA', img: '/images/mma-tchechenie/kick-haut-kadyrov.webp' },
  { key: 'mma_pads_direct_kadyrov', category: 'MMA', img: '/images/mma-tchechenie/pads-direct-kadyrov.webp' },
  { key: 'mma_pads_jab_kadyrov', category: 'MMA', img: '/images/mma-tchechenie/pads-jab-kadyrov.webp' },
  { key: 'mma_pads_akhmat_sila', category: 'MMA', img: '/images/mma-tchechenie/pads-akhmat-sila.webp' },
  { key: 'mma_sparring_cage_turquoise', category: 'MMA', img: '/images/mma-tchechenie/sparring-cage-turquoise.webp' },
  { key: 'mma_sparring_cage_coach_noir', category: 'MMA', img: '/images/mma-tchechenie/sparring-cage-coach-noir.webp' },
  { key: 'mma_team_5_cage', category: 'MMA', img: '/images/mma-tchechenie/team-5-cage.webp' },
  { key: 'mma_coach_cage_portrait', category: 'MMA', img: '/images/mma-tchechenie/coach-cage-portrait.webp' },
  { key: 'mma_low_kick_cage', category: 'MMA', img: '/images/mma-tchechenie/low-kick-cage.webp' },
  { key: 'mma_duo_post_sparring', category: 'MMA', img: '/images/mma-tchechenie/duo-post-sparring.webp' },
  { key: 'mma_coach_care_blesse', category: 'MMA', img: '/images/mma-tchechenie/coach-care-blesse.webp' },

  { key: 'coachs_ruslan_chemise_noire', category: 'Coachs', img: '/images/ruslan/ruslan-portrait-chemise-noire.webp' },
  { key: 'coachs_ruslan_takedown', category: 'Coachs', img: '/images/ruslan/ruslan-championnat-france-takedown.webp' },
  { key: 'coachs_ruslan_ffl', category: 'Coachs', img: '/images/ruslan/ruslan-championnat-france-ffl.webp' },
  { key: 'coachs_ruslan_clinch_nb', category: 'Coachs', img: '/images/ruslan/ruslan-lutte-clinch-nb.webp' },
  { key: 'coachs_salle_espalier', category: 'Coachs', img: '/images/ruslan/coaches/coachs-salle-espalier-mkr.webp' },

  { key: 'culture_priere_collective', category: 'Culture', img: '/images/ruslan/heritage/priere-collective-mkr.webp' },
  { key: 'culture_mma_team_cluster', category: 'Culture', img: '/images/galerie-real/mma-team-cluster.webp' },
  { key: 'culture_antoine_petit_jean', category: 'Culture', img: '/images/galerie-real/antoine-petit-jean.webp' },
  { key: 'culture_mma_adultes_cercle', category: 'Culture', img: '/images/ruslan/action/mma-adultes-cercle.webp' },

  { key: 'montagnes_quad_golden_hour', category: 'Montagnes', img: '/images/galerie-real/quad-golden-hour.webp' },
  { key: 'montagnes_canyon_sulak', category: 'Montagnes', img: '/images/galerie-real/canyon-sulak-overlook.webp' },
  { key: 'montagnes_dagestan_panorama', category: 'Montagnes', img: '/images/environment/dagestan-panorama.webp' },
  { key: 'montagnes_gamsutl_village', category: 'Montagnes', img: '/images/environment/gamsutl-village.webp' },
  { key: 'montagnes_mountain_lake', category: 'Montagnes', img: '/images/galerie/mountain-lake.webp' },
  { key: 'montagnes_lake_kezenoy', category: 'Montagnes', img: '/images/environment/lake-kezenoy.webp' },
  { key: 'montagnes_vainakh_towers', category: 'Montagnes', img: '/images/environment/vainakh-towers.webp' },
  { key: 'montagnes_sunrise_towers', category: 'Montagnes', img: '/images/galerie/sunrise-towers.webp' },
  { key: 'montagnes_caucasus_panorama', category: 'Montagnes', img: '/images/galerie/caucasus-panorama.webp' },
  { key: 'montagnes_mountain_mist_trail', category: 'Montagnes', img: '/images/galerie/mountain-mist-trail.webp' },
]

export default function GalerieContent() {
  const t = useTranslations('galerie')
  const [filter, setFilter] = useState<FilterValue>('Tout')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const filtered = filter === 'Tout' ? PHOTOS : PHOTOS.filter(p => p.category === filter)

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const navLightbox = useCallback((dir: 1 | -1) => {
    setLightboxIndex(prev => {
      if (prev === null) return prev
      const next = (prev + dir + filtered.length) % filtered.length
      return next
    })
  }, [filtered.length])

  // GSAP reveal animation on mount + filter change
  useEffect(() => {
    let ctx: ReturnType<typeof import('gsap')['gsap']['context']> | undefined

    async function init() {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia()

        mm.add(
          {
            isMotion: '(prefers-reduced-motion: no-preference)',
            isReduced: '(prefers-reduced-motion: reduce)',
          },
          (context) => {
            const conditions = context.conditions as { isMotion: boolean; isReduced: boolean }
            const cards = gsap.utils.toArray<HTMLElement>('.gal-card')

            if (conditions.isReduced) {
              gsap.set(cards, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' })
              return
            }

            if (!conditions.isMotion) return

            // Pre-state
            gsap.set(cards, { opacity: 0, y: 48, scale: 0.94, filter: 'blur(8px)' })

            // Stagger reveal as cards enter viewport (batch handles long lists)
            ScrollTrigger.batch('.gal-card', {
              start: 'top 90%',
              onEnter: batch => {
                gsap.to(batch, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                  duration: 0.9,
                  ease: 'expo.out',
                  stagger: {
                    each: 0.06,
                    from: 'start',
                  },
                  overwrite: true,
                })
              },
              onLeaveBack: batch => {
                gsap.to(batch, {
                  opacity: 0,
                  y: 32,
                  scale: 0.96,
                  filter: 'blur(6px)',
                  duration: 0.4,
                  ease: 'power2.in',
                  overwrite: true,
                })
              },
            })

            ScrollTrigger.refresh()
          },
        )

        // Sticky bar shadow on scroll
        const bar = barRef.current
        if (bar) {
          ScrollTrigger.create({
            start: 'top -8',
            end: 99999,
            onUpdate: self => {
              bar.dataset.stuck = self.scroll() > 8 ? 'true' : 'false'
            },
          })
        }
      }, gridRef)
    }

    init()
    return () => {
      ctx?.revert()
    }
  }, [filter])

  // Keyboard nav for lightbox + body scroll lock + adjacent preload
  useEffect(() => {
    if (lightboxIndex === null) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Preload neighbours for snappy slideshow
    const preload = (idx: number) => {
      const target = filtered[(idx + filtered.length) % filtered.length]
      if (!target) return
      const img = new Image()
      img.src = target.img
    }
    preload(lightboxIndex + 1)
    preload(lightboxIndex - 1)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowRight') navLightbox(1)
      else if (e.key === 'ArrowLeft') navLightbox(-1)
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [lightboxIndex, closeLightbox, navLightbox, filtered])

  const current = lightboxIndex !== null ? filtered[lightboxIndex] : null
  const currentAlt = current ? t(`photos.${current.key}`) : ''

  return (
    <>
      <section className="galerie-section fx-grid">
        <div ref={barRef} className="galerie-filters-bar" data-stuck="false">
          <div className="inner">
            <div className="filter-tabs galerie-filter-tabs" role="tablist" aria-label={t('filters.aria_label')}>
              {FILTERS.map(f => {
                const count = f === 'Tout' ? PHOTOS.length : PHOTOS.filter(p => p.category === f).length
                return (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={filter === f}
                    className={`filter-tab${filter === f ? ' is-active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    <span>{t(`filters.labels.${f}`)}</span>
                    <span className="filter-tab-count" aria-hidden="true">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="inner">
          <div ref={gridRef} className="galerie-grid">
            {filtered.map((photo, i) => {
              const portrait = i % 3 === 0
              const w = portrait ? 900 : 1200
              const h = portrait ? 1200 : 900
              const alt = t(`photos.${photo.key}`)
              return (
                <button
                  type="button"
                  key={`${photo.img}-${filter}-${i}`}
                  className="photo-card gal-card"
                  onClick={() => openLightbox(i)}
                  aria-label={t('lightbox.open_image', { alt })}
                  style={{ containIntrinsicSize: `${w}px ${h}px` }}
                >
                  <img
                    src={photo.img}
                    alt={alt}
                    loading={i < 6 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={i < 3 ? 'high' : 'low'}
                    width={w}
                    height={h}
                    className="galerie-photo-img"
                    style={{ aspectRatio: portrait ? '3/4' : '4/3' }}
                  />
                  <span className="gal-card-zoom" aria-hidden="true">
                    <Icon name="search" size={20} />
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {current && lightboxIndex !== null && (
        <div
          className="galerie-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={t('lightbox.aria_dialog')}
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="galerie-lb-btn galerie-lb-close"
            onClick={closeLightbox}
            aria-label={t('lightbox.close')}
          >
            <Icon name="x" size={22} />
          </button>

          <button
            type="button"
            className="galerie-lb-btn galerie-lb-prev"
            onClick={(e) => { e.stopPropagation(); navLightbox(-1) }}
            aria-label={t('lightbox.prev')}
          >
            <Icon name="arrow-left" size={22} />
          </button>

          <button
            type="button"
            className="galerie-lb-btn galerie-lb-next"
            onClick={(e) => { e.stopPropagation(); navLightbox(1) }}
            aria-label={t('lightbox.next')}
          >
            <Icon name="arrow-right" size={22} />
          </button>

          <figure
            className="galerie-lb-figure"
            onClick={(e) => e.stopPropagation()}
            key={current.img}
          >
            <img
              src={current.img}
              alt={currentAlt}
              className="galerie-lb-img"
            />
            <figcaption className="galerie-lb-caption">
              <span className="galerie-lb-counter">
                {lightboxIndex + 1} / {filtered.length}
              </span>
              <span className="galerie-lb-category">{t(`filters.labels.${current.category}`)}</span>
              <span className="galerie-lb-alt">{currentAlt}</span>
            </figcaption>
          </figure>
        </div>
      )}

      {/* Videos */}
      <section className="logi-section logi-alt fx-texture-concrete fx-mask-a fx-stack-2">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('videos.label')}</span>
            <h2>{t('videos.title')}</h2>
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
