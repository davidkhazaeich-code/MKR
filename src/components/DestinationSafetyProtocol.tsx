/**
 * Section sécurité partagée entre /destinations/dagestan et /destinations/tchetchenie.
 * Le protocole MKR (5 items) est identique entre les 2 régions et hardcodé ici.
 * Le contenu narratif (paragraphes + témoignage) est passé via props.
 */
import type { ReactNode } from 'react'

interface DestinationSafetyProtocolProps {
  /** Contenu spécifique à la destination (2-3 paragraphes courts) */
  narrative: ReactNode
  /** Témoignage : citation + auteur (nom · discipline · ville) */
  testimonial?: {
    quote: string
    author: string
  }
}

export default function DestinationSafetyProtocol({ narrative, testimonial }: DestinationSafetyProtocolProps) {
  return (
    <section className="dag-security fx-texture-concrete fx-glow fx-glow-breathe fx-mask-b fx-stack-2">
      <div className="fx-glow-orb" />
      <div className="inner">
        <div className="reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>SÉCURITÉ</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
            LA QUESTION QUE TOUT LE MONDE POSE
          </h2>
        </div>
        <div className="layout-split reveal" style={{ marginTop: '2rem' }}>
          <div>
            {narrative}
            {testimonial && (
              <>
                <p className="pull-quote">
                  &laquo; {testimonial.quote} &raquo;
                </p>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{testimonial.author}</span>
              </>
            )}
          </div>
          <div>
            <div className="content-card">
              <h3 className="card-title">PROTOCOLE MKR</h3>
              <ul className="logi-check-list">
                <li>Contact d&apos;urgence 24/7 sur place</li>
                <li>Équipe francophone permanente</li>
                <li>Assurance rapatriement obligatoire</li>
                <li>Briefing sécurité avant départ</li>
                <li>Suivi Quai d&apos;Orsay en continu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
