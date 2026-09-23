import AdminShell from '@/components/admin/shell/AdminShell'

// Squelette de la liste pendant le chargement serveur, dans la meme grille
// que la page (en-tete, onglets, barre de recherche et filtres, lignes) :
// aucun saut de mise en page a l'arrivee des donnees. Styles en ligne
// limites aux dimensions (aucune couleur).
const TABS = [72, 84, 92, 84, 96, 92, 96, 100, 80]
const FIELDS = [0, 1, 2, 3, 4, 5, 6, 7]
const ROWS = [0, 1, 2, 3, 4, 5, 6, 7]

export default function LoadingInscriptions() {
  return (
    <AdminShell active="candidatures" title="Candidatures">
      <div className="adm-container adm-cand" aria-busy="true">
        <p className="adm-sr-only" role="status">
          Chargement des candidatures
        </p>
        <header className="adm-page-head adm-cand-head">
          <div>
            <h1 className="adm-h1">Candidatures</h1>
            <div className="adm-skeleton adm-skeleton--text" style={{ width: 240, marginTop: 10 }} />
          </div>
        </header>
        <div className="adm-tabs adm-cand-tabs adm-cand-tabs--skeleton" aria-hidden="true">
          {TABS.map((width, i) => (
            <div key={i} className="adm-skeleton adm-skeleton--text" style={{ width, flexShrink: 0 }} />
          ))}
        </div>
        <div className="adm-cand-controls" aria-hidden="true">
          <div className="adm-cand-toolbar">
            <div className="adm-cand-search">
              <div className="adm-skeleton" style={{ height: 44 }} />
            </div>
            <div className="adm-skeleton adm-only-mobile" style={{ width: 92, height: 44 }} />
            {FIELDS.map((i) => (
              <div key={i} className={i === 0 ? 'adm-cand-filter adm-cand-filter--session adm-only-desktop' : 'adm-cand-filter adm-only-desktop'}>
                <div className="adm-skeleton adm-skeleton--text" style={{ width: 64, height: 12 }} />
                <div className="adm-skeleton" style={{ height: 44 }} />
              </div>
            ))}
          </div>
        </div>
        <div className="adm-skeleton-stack">
          {ROWS.map((i) => (
            <div key={i} className="adm-skeleton adm-cand-skeleton-row" />
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
