import type { ReactNode } from 'react'

interface SessionStep {
  time: string
  activity: string
  desc: string
}

interface DisciplineSessionFlowProps {
  steps: SessionStep[]
  label?: string
  title?: string
  hoursNote?: ReactNode
}

export default function DisciplineSessionFlow({
  steps,
  label = 'SESSION TYPE',
  title = "DÉROULEMENT D'UNE SESSION",
  hoursNote,
}: DisciplineSessionFlowProps) {
  return (
    <section className="logi-section fx-grid fx-mask-c fx-stack-4 fx-glow">
      <div className="fx-glow-orb fx-glow-orb--left" />
      <div className="inner">
        <div className="logi-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{label}</span>
          <h2>{title}</h2>
        </div>
        <div className="daily-timeline">
          {steps.map((step, i) => (
            <div key={i} className="daily-step reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
              <span className="daily-time">{step.time}</span>
              <div className="daily-step-content">
                <h3>{step.activity}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        {hoursNote && (
          <p className="logi-updated" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            {hoursNote}
          </p>
        )}
      </div>
    </section>
  )
}
