export interface ProcessStep {
  title: string
  desc: string
}

interface ProcessStripProps {
  label: string
  title: string
  steps: ProcessStep[]
  note?: string
  /**
   * `cards` (defaut) : grille de cartes, le rendu historique des pages
   * destination et programme. Ne pas y toucher, 3 pages en dependent.
   * `line` : les memes etapes reliees par un fil conducteur, avec le numero
   * en pastille. Ajoute pour /contact le 2026-08-21, ou la section doit se
   * lire comme un parcours et non comme quatre encarts independants.
   */
  variant?: 'cards' | 'line'
  /**
   * Promesse mise en avant SOUS les etapes (variante `line`). Sert a porter
   * une levee d'objection forte, la ou `note` reste un complement discret.
   */
  pledge?: { title: string; body: string }
}

/**
 * Bande de process compacte (candidature gratuite, visio, MKR gere, depart).
 * Version condensee du parcours /comment-ca-marche pour les pages destination.
 */
export default function ProcessStrip({ label, title, steps, note, variant = 'cards', pledge }: ProcessStripProps) {
  return (
    <section className={`pstrip fx-texture-concrete${variant === 'line' ? ' pstrip--line' : ''}`}>
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
        {pledge && (
          <div className="pstrip-pledge reveal">
            <p className="pstrip-pledge-title">{pledge.title}</p>
            <p className="pstrip-pledge-body">{pledge.body}</p>
          </div>
        )}
        {note && <p className="pstrip-note reveal">{note}</p>}
      </div>
    </section>
  )
}
