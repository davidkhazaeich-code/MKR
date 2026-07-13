import Topbar from '@/components/admin/ui/Topbar'

export default function LoadingGuideLeads() {
  return (
    <>
      <Topbar nav="guide-leads" />
      <main className="adm-container" aria-busy="true" aria-label="Chargement des leads">
        <h1 className="adm-h1">Leads Guide Caucase</h1>
        <div className="adm-skeleton--text adm-skeleton" style={{ width: 220, marginTop: 4 }} />
        <div className="adm-skeleton" style={{ height: 36, margin: '1.5rem 0 1rem' }} />
        <div className="adm-skeleton" style={{ height: 420 }} />
      </main>
    </>
  )
}
