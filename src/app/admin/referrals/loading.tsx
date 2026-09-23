import AdminShell from '@/components/admin/shell/AdminShell'

// Squelette de la page Partenaires, dans la meme grille que la page :
// en-tete, chiffres cles, liens d'affiliation, compteurs par partenaire.
// Styles en ligne limites aux dimensions (aucune couleur).
const KPIS = [0, 1, 2, 3]
const CARDS = [0, 1, 2]

export default function LoadingReferrals() {
  return (
    <AdminShell active="partenaires" title="Partenaires">
      <div className="adm-container adm-partners" aria-busy="true">
        <p className="adm-sr-only" role="status">
          Chargement des partenaires
        </p>
        <header className="adm-page-head adm-partners-head">
          <div>
            <h1 className="adm-h1">Partenaires</h1>
            <div className="adm-skeleton adm-skeleton--text" style={{ width: 260, marginTop: 10 }} />
          </div>
        </header>
        <div className="adm-partners-kpis">
          {KPIS.map((i) => (
            <div key={i} className="adm-skeleton adm-partners-skeleton-kpi" />
          ))}
        </div>
        <div className="adm-skeleton adm-partners-skeleton-links" />
        <div className="adm-section">
          <div className="adm-skeleton adm-skeleton--text" style={{ width: 170, marginBottom: 12 }} />
          <div className="adm-partners-skeleton-list">
            {CARDS.map((i) => (
              <div key={i} className="adm-skeleton adm-partners-skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
