import Link from 'next/link'
import Topbar from '@/components/admin/ui/Topbar'
import Icon from '@/components/admin/ui/Icon'

// 404 admin (dossier inconnu, URL erronee). Sans ce fichier, notFound()
// tombe sur la 404 publique, hors design system admin.
export default function AdminNotFound() {
  return (
    <>
      <Topbar />
      <main className="adm-container">
        <div className="adm-list-empty" style={{ marginTop: '2.5rem', padding: '4rem 2rem' }}>
          <div className="adm-list-empty-icon" aria-hidden="true" style={{ color: 'var(--adm-text-muted)', fontSize: 'inherit' }}>
            <Icon name="search" size={40} strokeWidth={1.6} />
          </div>
          <p className="adm-list-empty-title">Dossier introuvable</p>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem' }}>
            Ce dossier n&apos;existe pas ou a été supprimé.
          </p>
          <Link href="/admin/inscriptions" className="adm-btn adm-btn--primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
            <Icon name="arrow-left" size={14} strokeWidth={2.4} />
            Retour aux candidatures
          </Link>
        </div>
      </main>
    </>
  )
}
