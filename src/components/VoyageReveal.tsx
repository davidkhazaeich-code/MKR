'use client'

import { useRef } from 'react'
import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion'
import { WorldMap } from '@/components/WorldMap'

const ROUTES = [
  { start: { lat: 46.2044, lng: 6.1432,   label: 'Genève'   }, end: { lat: 41.0082, lng: 28.9784, label: 'Istanbul' } },
  { start: { lat: 45.5017, lng: -73.5673, label: 'Montréal' }, end: { lat: 41.0082, lng: 28.9784, label: 'Istanbul' } },
  { start: { lat: 41.0082, lng: 28.9784,  label: 'Istanbul' }, end: { lat: 42.9849, lng: 47.5047, label: 'Dagestan' }, color: '#2ECC71' },
]

const SCROLL_HEIGHT = 1400

export default function VoyageReveal() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  })

  // Clip-path : part d'un carré centré (30%→70%) vers plein écran (0%→100%)
  const clipP = useTransform(scrollYProgress, [0, 1], [30, 0])
  const clipQ = useTransform(scrollYProgress, [0, 1], [70, 100])
  const clipPath = useMotionTemplate`polygon(${clipP}% ${clipP}%, ${clipQ}% ${clipP}%, ${clipQ}% ${clipQ}%, ${clipP}% ${clipQ}%)`

  // Dézoom carte du 125% au 100% pendant le reveal
  const mapScale = useTransform(scrollYProgress, [0, 1], [1.25, 1])

  // Texte : apparaît quand le reveal est à 50%+
  const textOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 1])
  const textY       = useTransform(scrollYProgress, [0.5, 1], [30, 0])

  return (
    <div
      ref={containerRef}
      className="voyage-reveal-outer"
      style={{ height: `calc(${SCROLL_HEIGHT}px + 100vh)` }}
    >
      <motion.div
        className="voyage-reveal-sticky"
        style={{ clipPath }}
      >
        {/* Carte en background zoomée */}
        <motion.div
          className="voyage-reveal-map"
          style={{ scale: mapScale, transformOrigin: '50% 26%' }}
        >
          <WorldMap dots={ROUTES} lineColor="#C84B31" loop animationDuration={2.2} />
        </motion.div>

        {/* Overlay gradient sombre pour lisibilité */}
        <div className="voyage-reveal-overlay" aria-hidden="true" />

        {/* Texte -coin bas gauche, dans le container max-width du site */}
        <div className="voyage-reveal-container">
          <motion.div
            className="voyage-reveal-content"
            style={{ opacity: textOpacity, y: textY }}
          >
            <span className="label-tag">COMMENT Y ALLER</span>
            <h2>
              LE CHEMIN<br />
              VERS LE <span className="highlight">CAUCASE</span>
            </h2>

            <div className="voyage-reveal-steps">
              <div className="voyage-reveal-step">
                <span className="voyage-reveal-num">01</span>
                <span>Genève ou Montréal → Istanbul</span>
              </div>
              <div className="voyage-reveal-step">
                <span className="voyage-reveal-num">02</span>
                <span>Istanbul → Makhachkala (2h30)</span>
              </div>
              <div className="voyage-reveal-step">
                <span className="voyage-reveal-num">03</span>
                <span>Transfert au camp</span>
              </div>
            </div>

            {/* Étiquettes de réassurance */}
            <div className="voyage-reveal-badges">
              <span className="voyage-badge">VISA ASSISTÉ</span>
              <span className="voyage-badge">GROUPE ENCADRÉ</span>
              <span className="voyage-badge">TRANSFERTS INCLUS</span>
              <span className="voyage-badge voyage-badge--green">DESTINATION SÉCURISÉE</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
