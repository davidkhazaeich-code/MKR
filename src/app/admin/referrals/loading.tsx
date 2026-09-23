import AdminShell from '@/components/admin/shell/AdminShell'

// Squelette de la page partenaires : chiffres cles, tableau, liens d'affiliation.
const KPIS = [0, 1, 2, 3]

export default function LoadingReferrals() {
  return (
    <AdminShell active="partenaires" title="Partenaires">
      <div className="adm-container" aria-busy="true">
        <p className="adm-sr-only" role="status">
          Chargement des partenaires
        </p>
        <div className="adm-page-head">
          <div>
            <h1 className="adm-h1">Partenaires</h1>
            <div className="adm-skeleton adm-skeleton--text" style={{ width: 260, marginTop: 10 }} />
          </div>
        </div>
        <div className="adm-skeleton-kpis">
          {KPIS.map((i) => (
            <div key={i} className="adm-skeleton" style={{ height: 96 }} />
          ))}
        </div>
        <div className="adm-skeleton" style={{ height: 300, marginTop: 24 }} />
        <div className="adm-skeleton" style={{ height: 200, marginTop: 16 }} />
      </div>
    </AdminShell>
  )
}
