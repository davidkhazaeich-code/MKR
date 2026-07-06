export interface ProcessStep {
  title: string
  desc: string
}

interface ProcessStripProps {
  label: string
  title: string
  steps: ProcessStep[]
  note?: string
}

/**
 * Bande de process compacte (candidature gratuite, visio, MKR gere, depart).
 * Version condensee du parcours /comment-ca-marche pour les pages destination.
 */
export default function ProcessStrip({ label, title, steps, note }: ProcessStripProps) {
  return (
    <section className="pstrip fx-texture-concrete">
      <div className="inner">
        <div className="logi-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{label}</span>
          <h2>{title}</h2>
        </div>
        <ol className="pstrip-list">
          {steps.map((step, i) => (
            <li key={i} className="pstrip-step reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
              <span className="pstrip-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="pstrip-title">{step.title}</h3>
              <p className="pstrip-desc">{step.desc}</p>
            </li>
          ))}
        </ol>
        {note && <p className="pstrip-note reveal">{note}</p>}
      </div>
    </section>
  )
}
