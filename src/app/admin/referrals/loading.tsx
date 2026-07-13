import Topbar from '@/components/admin/ui/Topbar'

export default function LoadingReferrals() {
  return (
    <>
      <Topbar nav="referrals" />
      <main className="adm-container" aria-busy="true" aria-label="Chargement des partenaires">
        <h1 className="adm-h1">Partenaires referral</h1>
        <div className="adm-skeleton--text adm-skeleton" style={{ width: 260, marginTop: 4 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', margin: '1.5rem 0 2rem' }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="adm-skeleton" style={{ height: 96 }} />
          ))}
        </div>
        <div className="adm-skeleton" style={{ height: 300, marginBottom: '1.5rem' }} />
        <div className="adm-skeleton" style={{ height: 360 }} />
      </main>
    </>
  )
}
