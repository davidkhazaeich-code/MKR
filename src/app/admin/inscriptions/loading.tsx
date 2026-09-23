import AdminShell from '@/components/admin/shell/AdminShell'

// Squelette de la liste pendant le chargement serveur (force-dynamic) :
// affiche tout de suite a la navigation, dans le chrome.
const ROWS = [0, 1, 2, 3, 4, 5, 6, 7]

export default function LoadingInscriptions() {
  return (
    <AdminShell active="candidatures" title="Candidatures">
      <div className="adm-container" aria-busy="true">
        <p className="adm-sr-only" role="status">
          Chargement des candidatures
        </p>
        <div className="adm-page-head">
          <div>
            <h1 className="adm-h1">Candidatures</h1>
            <div className="adm-skeleton adm-skeleton--text" style={{ width: 220, marginTop: 10 }} />
          </div>
        </div>
        <div className="adm-skeleton" style={{ height: 44, marginBottom: 12 }} />
        <div className="adm-skeleton" style={{ height: 44, marginBottom: 20 }} />
        <div className="adm-skeleton-stack">
          {ROWS.map((i) => (
            <div key={i} className="adm-skeleton" style={{ height: 64 }} />
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
