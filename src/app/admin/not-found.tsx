import AdminShell from '@/components/admin/shell/AdminShell'
import { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'

// 404 admin (dossier inconnu, URL erronee), dans le chrome sans section
// active. Sans ce fichier, notFound() tombe sur la 404 publique, hors design
// system admin.
export default function AdminNotFound() {
  return (
    <AdminShell title="Introuvable">
      <div className="adm-container">
        <section className="adm-empty" aria-labelledby="adm-not-found-title">
          <span className="adm-empty-icon" aria-hidden="true">
            <Icon name="search" size={28} />
          </span>
          <h1 id="adm-not-found-title" className="adm-empty-title">
            Dossier introuvable
          </h1>
          <p className="adm-empty-text">Ce dossier n’existe pas ou a été supprimé.</p>
          <div className="adm-empty-actions">
            <ButtonLink href="/admin/inscriptions" variant="primary" icon="arrow-left">
              Retour aux candidatures
            </ButtonLink>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
