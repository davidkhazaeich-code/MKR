import AdminShell from '@/components/admin/shell/AdminShell'

// Squelette de la page Leads guide, dans la meme grille que la page :
// en-tete, pastilles de source et export, liste. Styles en ligne limites
// aux dimensions (aucune couleur).
const CHIPS = [72, 64, 118]
const ROWS = [0, 1, 2, 3, 4, 5]

export default function LoadingGuideLeads() {
  return (
    <AdminShell active="leads" title="Leads guide">
      <div className="adm-container adm-leads" aria-busy="true">
        <p className="adm-sr-only" role="status">
          Chargement des leads
        </p>
        <header className="adm-page-head adm-leads-head">
          <div>
            <h1 className="adm-h1">Leads guide</h1>
            <div className="adm-skeleton adm-skeleton--text" style={{ width: 240, marginTop: 10 }} />
          </div>
        </header>
        <div className="adm-leads-toolbar">
          <div className="adm-chips">
            {CHIPS.map((w) => (
              <div key={w} className="adm-skeleton adm-leads-skeleton-chip" style={{ width: w }} />
            ))}
          </div>
          <div className="adm-skeleton adm-leads-skeleton-chip" style={{ width: 150 }} />
        </div>
        <div className="adm-skeleton-stack">
          {ROWS.map((i) => (
            <div key={i} className="adm-skeleton adm-leads-skeleton-row" />
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
