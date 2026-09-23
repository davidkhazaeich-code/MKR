import AdminShell from '@/components/admin/shell/AdminShell'

// Squelette de l'accueil "A faire" pendant le chargement serveur, dans la
// meme grille que la page (pas de saut de mise en page a l'arrivee des
// donnees). Styles en ligne limites aux dimensions (aucune couleur).
// Repli aussi des routes /admin sans squelette propre.
const AGENDA = [0, 1]
const ROWS = [0, 1, 2, 3, 4]

export default function LoadingTodo() {
  return (
    <AdminShell active="queue" title="À faire">
      <div className="adm-container adm-todo" aria-busy="true">
        <p className="adm-sr-only" role="status">
          Chargement des dossiers à traiter
        </p>
        <header className="adm-todo-head">
          <div className="adm-todo-titles">
            <h1 className="adm-h1">À faire</h1>
            <div className="adm-skeleton adm-skeleton--text" style={{ width: 170, marginTop: 10 }} />
            <div className="adm-skeleton adm-skeleton--text" style={{ width: 240, marginTop: 10 }} />
          </div>
        </header>
        <div className="adm-todo-side">
          <div className="adm-skeleton" style={{ height: 64 }} />
          <div className="adm-skeleton" style={{ height: 64 }} />
          <div className="adm-skeleton-stack">
            {AGENDA.map((i) => (
              <div key={i} className="adm-skeleton" style={{ height: 72 }} />
            ))}
          </div>
        </div>
        <div className="adm-todo-main">
          <div className="adm-skeleton adm-skeleton--text" style={{ width: 140, marginBottom: 16 }} />
          <div className="adm-skeleton-stack">
            {ROWS.map((i) => (
              <div key={i} className="adm-skeleton" style={{ height: 72 }} />
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
