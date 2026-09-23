import AdminShell from '@/components/admin/shell/AdminShell'

// Squelette de la fiche pendant le chargement serveur (force-dynamic) :
// en-tete (avatar, nom), prochaine etape, puis les panneaux (deux colonnes
// en desktop).
export default function LoadingCandidature() {
  return (
    <AdminShell active="candidatures" title="Dossier">
      <div className="adm-container adm-container--wide" aria-busy="true">
        <p className="adm-sr-only" role="status">
          Chargement du dossier
        </p>
        <div className="adm-skeleton-head">
          <div className="adm-skeleton adm-skeleton-avatar" />
          <div className="adm-skeleton-lines">
            <div className="adm-skeleton adm-skeleton--title" />
            <div className="adm-skeleton adm-skeleton--text" style={{ width: '60%' }} />
          </div>
        </div>
        <div className="adm-skeleton" style={{ height: 132, marginBottom: 20 }} />
        <div className="adm-skeleton-cols">
          <div className="adm-skeleton-stack">
            <div className="adm-skeleton" style={{ height: 220 }} />
            <div className="adm-skeleton" style={{ height: 180 }} />
          </div>
          <div className="adm-skeleton-stack">
            <div className="adm-skeleton" style={{ height: 160 }} />
            <div className="adm-skeleton" style={{ height: 260 }} />
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
