import AdminShell from '@/components/admin/shell/AdminShell'

// Squelette de l'ecran Sessions pendant le chargement serveur, dans la meme
// grille que la page (en-tete, titre de section, cartes). Styles en ligne
// limites aux dimensions (aucune couleur).
const CARDS = [0, 1, 2]

export default function LoadingSessions() {
  return (
    <AdminShell active="sessions" title="Sessions">
      <div className="adm-container adm-sess" aria-busy="true">
        <p className="adm-sr-only" role="status">
          Chargement des sessions
        </p>
        <header className="adm-page-head adm-sess-head">
          <div>
            <h1 className="adm-h1">Sessions</h1>
            <div className="adm-skeleton adm-skeleton--text" style={{ width: 200, marginTop: 10 }} />
          </div>
        </header>
        <div className="adm-section">
          <div className="adm-skeleton adm-skeleton--text" style={{ width: 150, marginBottom: 12 }} />
          <div className="adm-sess-grid">
            {CARDS.map((i) => (
              <div key={i} className="adm-skeleton adm-sess-skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
