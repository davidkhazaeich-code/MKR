import AdminShell from '@/components/admin/shell/AdminShell'

// Squelette de la page des leads du guide : filtres de source, tableau.
export default function LoadingGuideLeads() {
  return (
    <AdminShell active="leads" title="Leads guide">
      <div className="adm-container" aria-busy="true">
        <p className="adm-sr-only" role="status">
          Chargement des leads
        </p>
        <div className="adm-page-head">
          <div>
            <h1 className="adm-h1">Leads guide</h1>
            <div className="adm-skeleton adm-skeleton--text" style={{ width: 220, marginTop: 10 }} />
          </div>
        </div>
        <div className="adm-skeleton" style={{ height: 44, marginBottom: 20 }} />
        <div className="adm-skeleton" style={{ height: 420 }} />
      </div>
    </AdminShell>
  )
}
