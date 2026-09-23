// Barre laterale (>= 1024 px ; masquee en CSS en dessous) : logo vers
// l'accueil, sections, puis en pied l'apparence et la deconnexion.
// Chrome sombre dans les deux themes : data-theme="dark" donne les jetons
// sombres aux primitives reutilisees (controle segmente). Composant serveur.

import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/admin/ui/Icon'
import ThemeSwitch from './ThemeSwitch'
import { BAR_ITEMS, MORE_ITEMS, type AdminSection } from './NavLinks'

function NavList({ items, active }: { items: typeof BAR_ITEMS; active?: AdminSection }) {
  return (
    <ul className="adm-sidebar-list">
      {items.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            className="adm-sidebar-link"
            aria-current={item.key === active ? 'page' : undefined}
          >
            <Icon name={item.icon} size={18} />
            <span className="adm-truncate">{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Sidebar({ active }: { active?: AdminSection }) {
  return (
    <aside className="adm-sidebar" data-theme="dark">
      <Link href="/admin" className="adm-sidebar-brand" aria-label="MKR Admin, accueil">
        <Image src="/logo-white.webp" alt="" width={53} height={32} className="adm-sidebar-logo" />
      </Link>

      <nav className="adm-sidebar-nav" aria-label="Navigation principale">
        {/* Travail courant, puis sections secondaires (celles du panneau Plus en mobile) */}
        <NavList items={BAR_ITEMS} active={active} />
        <NavList items={MORE_ITEMS} active={active} />
      </nav>

      <div className="adm-sidebar-foot">
        <ThemeSwitch compact />
        <form method="POST" action="/api/admin/logout">
          <button type="submit" className="adm-sidebar-link">
            <Icon name="log-out" size={18} />
            <span>Déconnexion</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
