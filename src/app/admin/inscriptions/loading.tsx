import Topbar from '@/components/admin/ui/Topbar'

// Skeleton de la liste pendant le fetch Supabase server-side (force-dynamic).
// Rendu instantane a la navigation : la page ne « gele » plus sans feedback.
export default function LoadingInscriptions() {
  return (
    <>
      <Topbar nav="inscriptions" />
      <main className="adm-container" aria-busy="true" aria-label="Chargement des candidatures">
        <h1 className="adm-h1">Candidatures</h1>
        <div className="adm-skeleton--text adm-skeleton" style={{ width: 260, marginTop: 4 }} />

        <div className="adm-stats-band" style={{ marginTop: '1.5rem' }}>
          <div className="adm-skeleton" style={{ height: 172 }} />
          <div className="adm-stats-secondary">
            <div className="adm-skeleton" style={{ height: 96 }} />
            <div className="adm-skeleton" style={{ height: 96 }} />
            <div className="adm-skeleton" style={{ height: 96 }} />
          </div>
        </div>

        <div className="adm-skeleton" style={{ height: 36, marginBottom: '1.5rem' }} />

        <div className="adm-skeleton-stack">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="adm-skeleton" style={{ height: 118 }} />
          ))}
        </div>
      </main>
    </>
  )
}
