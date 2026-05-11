// Topbar partagée admin : logo MKR + breadcrumb + déconnexion.
// Sticky avec backdrop blur. Server component.

import Link from 'next/link'
import Image from 'next/image'
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
          <Image
            src="/logo-white.webp"
            alt="MKR Caucasian Camp"
            width={320}
            height={193}
            className="adm-brand-logo"
            priority
          />
          <span className="adm-brand-mark-tagline" aria-hidden="true">Admin</span>
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
              <span className="adm-hide-desktop">
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
