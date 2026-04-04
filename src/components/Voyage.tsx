'use client'

import { WorldMap } from '@/components/WorldMap'

const ROUTES = [
  // France → Istanbul (étape 1)
  {
    start: { lat: 48.8566, lng: 2.3522, label: 'Paris' },
    end:   { lat: 41.0082, lng: 28.9784, label: 'Istanbul' },
  },
  // Canada → Istanbul (étape 1)
  {
    start: { lat: 45.5017, lng: -73.5673, label: 'Montréal' },
    end:   { lat: 41.0082, lng: 28.9784, label: 'Istanbul' },
  },
  // Istanbul → Dagestan (étape finale)
  {
    start: { lat: 41.0082, lng: 28.9784, label: 'Istanbul' },
    end:   { lat: 42.9849, lng: 47.5047, label: 'Dagestan' },
  },
]

export default function Voyage() {
  return (
    <section id="voyage" aria-labelledby="voyage-heading">
      <div className="voyage-inner">

        {/* Header */}
        <div className="voyage-header reveal">
          <span className="label-tag">COMMENT Y ALLER</span>
          <h2 id="voyage-heading">
            LE CHEMIN<br />
            VERS LE <span className="highlight">CAUCASE</span>
          </h2>
          <p className="voyage-subtitle">
            Deux portes d&apos;entrée vers le camp — Paris ou Montréal. Une connexion via Istanbul, puis l&apos;envol final vers le cœur du Dagestan.
          </p>
        </div>

        {/* Carte interactive */}
        <div className="voyage-map-wrap reveal">
          <WorldMap dots={ROUTES} lineColor="#C84B31" />
        </div>

        {/* Étapes */}
        <div className="voyage-steps reveal">
          <div className="voyage-step">
            <div className="voyage-step-num">01</div>
            <div className="voyage-step-content">
              <strong>Paris ou Montréal</strong>
              <span>Vol direct vers Istanbul (3h30 / 10h)</span>
            </div>
          </div>
          <div className="voyage-step-arrow" aria-hidden="true">→</div>
          <div className="voyage-step">
            <div className="voyage-step-num">02</div>
            <div className="voyage-step-content">
              <strong>Istanbul</strong>
              <span>Correspondance vers Makhachkala (2h30)</span>
            </div>
          </div>
          <div className="voyage-step-arrow" aria-hidden="true">→</div>
          <div className="voyage-step">
            <div className="voyage-step-num">03</div>
            <div className="voyage-step-content">
              <strong>Dagestan</strong>
              <span>Transfert au camp — le voyage commence</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
