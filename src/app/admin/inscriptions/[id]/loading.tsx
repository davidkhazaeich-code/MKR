import Topbar from '@/components/admin/ui/Topbar'

// Skeleton du dossier pendant le fetch Supabase (force-dynamic).
export default function LoadingCandidature() {
  return (
    <>
      <Topbar crumbs={[{ label: 'Candidatures', href: '/admin/inscriptions' }, { label: 'Dossier' }]} />
      <main className="adm-container" aria-busy="true" aria-label="Chargement du dossier">
        <div className="adm-skeleton--text adm-skeleton" style={{ width: 140, marginBottom: '1.25rem' }} />
        <div className="adm-skeleton" style={{ height: 150, marginBottom: '1.25rem' }} />
        <div className="adm-skeleton" style={{ height: 74, marginBottom: '1rem' }} />
        <div className="adm-card-grid adm-card-grid--detail">
          <div className="adm-skeleton-stack">
            <div className="adm-skeleton" style={{ height: 220 }} />
            <div className="adm-skeleton" style={{ height: 180 }} />
            <div className="adm-skeleton" style={{ height: 260 }} />
          </div>
          <div className="adm-skeleton-stack">
            <div className="adm-skeleton" style={{ height: 160 }} />
            <div className="adm-skeleton" style={{ height: 320 }} />
          </div>
        </div>
      </main>
    </>
  )
}
