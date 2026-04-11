'use client'

import { motion, useTransform } from 'framer-motion'
import { WorldMap } from '@/components/WorldMap'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const ROUTES = [
  { start: { lat: 46.2044, lng: 6.1432,   label: 'Genève'   }, end: { lat: 41.0082, lng: 28.9784, label: 'Istanbul' } },
  { start: { lat: 45.5017, lng: -73.5673, label: 'Montréal' }, end: { lat: 41.0082, lng: 28.9784, label: 'Istanbul' } },
  { start: { lat: 41.0082, lng: 28.9784,  label: 'Istanbul' }, end: { lat: 42.9849, lng: 47.5047, label: 'Dagestan' }, color: '#2ECC71', routeLabel: 'TRAJET SÉCURISÉ' },
]

export default function VoyageReveal() {
  const { containerRef, scrollYProgress, clipPath, textOpacity, textY } = useScrollReveal()

  const mapScale = useTransform(scrollYProgress, [0, 1], [1.8, 1.35])

  return (
    <div
      ref={containerRef}
      className="voyage-reveal-outer"
      style={{ height: 'calc(1400px + 100vh)' }}
    >
      <motion.div
        className="voyage-reveal-sticky"
        style={{ clipPath }}
      >
        <motion.div
          className="voyage-reveal-map"
          style={{ scale: mapScale, transformOrigin: '58% 26%' }}
        >
          <WorldMap dots={ROUTES} lineColor="#C84B31" loop animationDuration={2.2} />
        </motion.div>

        <div className="voyage-reveal-overlay" aria-hidden="true" />

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

            <div className="voyage-reveal-badges">
              <span className="voyage-badge">VISA ASSISTÉ</span>
              <span className="voyage-badge">GROUPE ENCADRÉ</span>
              <span className="voyage-badge">TRANSFERTS INCLUS</span>
              <span className="voyage-badge voyage-badge--green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" aria-hidden="true">
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" fill="currentColor" fillOpacity="0.2"/>
                  <polyline points="9 12 11 14 15 10" stroke="currentColor" strokeWidth="2.5"/>
                </svg>
                DESTINATION SÉCURISÉE
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
