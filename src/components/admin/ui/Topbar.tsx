// Topbar partagee admin : marque MKR + bouton deconnexion.
// Sticky avec backdrop blur. Server component.

import Link from 'next/link'
import Icon from './Icon'

export default function Topbar({ subtitle }: { subtitle?: string }) {
  return (
    <header className="adm-topbar">
      <div className="adm-topbar-inner">
        <Link href="/admin/inscriptions" className="adm-brand-mark" aria-label="Tableau de bord MKR">
          <span className="adm-brand-mark-dot" aria-hidden="true" />
          MKR Admin
          {subtitle && <span className="adm-brand-mark-sub">· {subtitle}</span>}
        </Link>
        <div className="adm-topbar-actions">
          <form method="POST" action="/api/admin/logout">
            <button type="submit" className="adm-logout-btn" aria-label="Déconnexion">
              <span className="adm-hide-mobile">Déconnexion</span>
              <span className="adm-hide-desktop" style={{ display: 'inline-flex' }}>
                <Icon name="log-out" size={16} />
              </span>
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
