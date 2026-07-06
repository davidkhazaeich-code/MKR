import Icon from './Icon'

interface AudienceFitProps {
  label: string
  title: string
  forTitle: string
  forItems: string[]
  notTitle: string
  notItems: string[]
  note?: string
}

/**
 * Bloc de qualification self-select : "C'est pour toi si / Passe ton tour si".
 * Assume l'entree selective MKR (regle 1 an de pratique + base au sol,
 * MMA niveau Avance) comme un argument premium, pas un repoussoir.
 */
export default function AudienceFit({ label, title, forTitle, forItems, notTitle, notItems, note }: AudienceFitProps) {
  return (
    <section className="afit fx-grid fx-glow">
      <div className="fx-glow-orb fx-glow-orb--left" />
      <div className="inner">
        <div className="logi-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{label}</span>
          <h2>{title}</h2>
        </div>
        <div className="afit-grid">
          <div className="afit-col afit-col--for reveal">
            <h3 className="afit-col-title">
              <Icon name="check-circle-fill" size={20} />
              <span>{forTitle}</span>
            </h3>
            <ul className="afit-list">
              {forItems.map((item, i) => (
                <li key={i} className="afit-item">{item}</li>
              ))}
            </ul>
          </div>
          <div className="afit-col afit-col--not reveal" style={{ transitionDelay: '0.1s' }}>
            <h3 className="afit-col-title">
              <Icon name="alert-warn" size={20} />
              <span>{notTitle}</span>
            </h3>
            <ul className="afit-list">
              {notItems.map((item, i) => (
                <li key={i} className="afit-item">{item}</li>
              ))}
            </ul>
          </div>
        </div>
        {note && <p className="afit-note reveal">{note}</p>}
      </div>
    </section>
  )
}
