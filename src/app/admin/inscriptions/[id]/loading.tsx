import AdminShell from '@/components/admin/shell/AdminShell'

// Squelette de la fiche pendant le chargement serveur (force-dynamic, et
// passage d'un dossier au voisin par J/K) : meme grille que la page (en-tete,
// prochaine etape, onglets sous 1024 px, deux colonnes au-dessus), pas de
// barre d'onglets du bas. Styles en ligne limites aux dimensions.
export default function LoadingDossier() {
  return (
    <AdminShell active="candidatures" title="Dossier" hideBottomNav>
      <div className="adm-container adm-container--wide adm-dossier" aria-busy="true">
        <h1 className="adm-sr-only">Dossier</h1>
        <p className="adm-sr-only" role="status">
          Chargement du dossier
        </p>
        <div className="adm-skeleton-head">
          <div className="adm-skeleton adm-skeleton-avatar" />
          <div className="adm-skeleton-lines">
            <div className="adm-skeleton adm-skeleton--title" />
            <div className="adm-skeleton adm-skeleton--text" style={{ width: '70%' }} />
            <div className="adm-skeleton adm-skeleton--text" style={{ width: '55%' }} />
          </div>
        </div>
        <div className="adm-skeleton" style={{ height: 150 }} />
        <div className="adm-skeleton adm-only-mobile" style={{ height: 44 }} />
        <div className="adm-skeleton-cols">
          <div className="adm-skeleton-stack">
            <div className="adm-skeleton" style={{ height: 220 }} />
            <div className="adm-skeleton" style={{ height: 180 }} />
          </div>
          <div className="adm-skeleton-stack adm-only-desktop">
            <div className="adm-skeleton" style={{ height: 200 }} />
            <div className="adm-skeleton" style={{ height: 260 }} />
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
