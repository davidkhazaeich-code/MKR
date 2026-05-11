// Topbar partagée admin : logo MKR (montagne) + breadcrumb + déconnexion.
// Sticky avec backdrop blur. Server component.

import Link from 'next/link'
import Icon from './Icon'

interface TopbarProps {
  subtitle?: string
  /** Breadcrumb crumbs : ex [{ label: 'Candidatures', href: '/admin/inscriptions' }, { label: 'Karim D.' }]. Le dernier est non-cliquable. */
  crumbs?: Array<{ label: string; href?: string }>
}

export default function Topbar({ subtitle, crumbs }: TopbarProps) {
  return (
    <header className="adm-topbar">
      <div className="adm-topbar-inner">
        <Link href="/admin/inscriptions" className="adm-brand-mark" aria-label="Tableau de bord MKR Caucasian Camp">
          <span className="adm-brand-mark-logo" aria-hidden="true">
            {/* Pic montagneux inspiré du logo MKR (M = sommets) */}
            <svg viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M2 22 L8 8 L13 16 L16 4 L19 16 L24 8 L30 22 Z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M14 8 L16 4 L18 8 Z"
                fill="var(--adm-brand)"
              />
            </svg>
          </span>
          <span className="adm-brand-mark-text">
            <span className="adm-brand-mark-title">MKR</span>
            <span className="adm-brand-mark-tagline">Admin</span>
          </span>
          {subtitle && !crumbs && <span className="adm-brand-mark-sub">· {subtitle}</span>}
        </Link>

        {crumbs && crumbs.length > 0 && (
          <nav className="adm-breadcrumb" aria-label="Fil d'Ariane">
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1
              return (
                <span key={i} className="adm-breadcrumb-item">
                  {i > 0 && (
                    <span className="adm-breadcrumb-sep" aria-hidden="true">
                      /
                    </span>
                  )}
                  {c.href && !isLast ? (
                    <Link href={c.href} className="adm-breadcrumb-link">
                      {c.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'adm-breadcrumb-current' : 'adm-breadcrumb-text'}>
                      {c.label}
                    </span>
                  )}
                </span>
              )
            })}
          </nav>
        )}

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
      {/* Ligne montagne accent en bas du topbar (signature brand) */}
      <div className="adm-topbar-mountain" aria-hidden="true" />
    </header>
  )
}
