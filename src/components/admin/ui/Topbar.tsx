// Topbar partagée admin : logo MKR + nav sections (ou breadcrumb) + déconnexion.
// Sticky avec backdrop blur. Server component.
//
// Deux modes exclusifs pour la zone centrale :
// - `nav` (pages de niveau 1) : onglets Candidatures / Referral / Leads guide,
//   etat actif souligne. C'est LA navigation entre les 3 ecrans admin.
// - `crumbs` (pages de detail) : fil d'Ariane, le retour liste est a un tap.

import Link from 'next/link'
import Image from 'next/image'
import Icon from './Icon'

export type AdminSection = 'inscriptions' | 'referrals' | 'guide-leads'

const NAV_ITEMS: Array<{ key: AdminSection; label: string; href: string }> = [
  { key: 'inscriptions', label: 'Candidatures', href: '/admin/inscriptions' },
  { key: 'referrals', label: 'Referral', href: '/admin/referrals' },
  { key: 'guide-leads', label: 'Leads guide', href: '/admin/guide-leads' },
]

interface TopbarProps {
  subtitle?: string
  /** Section active : affiche les onglets de navigation (pages de niveau 1). */
  nav?: AdminSection
  /** Breadcrumb crumbs : ex [{ label: 'Candidatures', href: '/admin/inscriptions' }, { label: 'Karim D.' }]. Le dernier est non-cliquable. */
  crumbs?: Array<{ label: string; href?: string }>
}

export default function Topbar({ subtitle, nav, crumbs }: TopbarProps) {
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

        {nav && !crumbs && (
          <nav className="adm-topbar-nav" aria-label="Sections admin">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={item.key === nav ? 'adm-topbar-nav-link adm-topbar-nav-link--active' : 'adm-topbar-nav-link'}
                aria-current={item.key === nav ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

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
