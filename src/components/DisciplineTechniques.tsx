interface Technique {
  title: string
  desc: string
}

interface DisciplineTechniquesProps {
  items: Technique[]
  label?: string
  title?: string
}

export default function DisciplineTechniques({
  items,
  label = 'TECHNIQUES',
  title = 'CE QUE TU VAS TRAVAILLER',
}: DisciplineTechniquesProps) {
  return (
    <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
      <div className="inner">
        <div className="logi-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{label}</span>
          <h2>{title}</h2>
        </div>
        <div className="grid-3x2">
          {items.map((t, i) => (
            <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{t.title}</h3>
              <p className="card-body" style={{ fontSize: '0.85rem' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
