// Barre d'onglets du bas (< 1024 px ; masquee en CSS au-dessus) :
// A faire, Candidatures, Sessions, Plus. 60 px + zone sure basse, chrome
// sombre. Onglet actif : aria-current + couleur active + barre de 2 px en
// haut. Composant serveur ; seule l'entree Plus (panneau) est un client.

import Link from 'next/link'
import Icon from '@/components/admin/ui/Icon'
import MoreSheet from './MoreSheet'
import { BAR_ITEMS, type AdminSection } from './NavLinks'

export default function BottomNav({ active }: { active?: AdminSection }) {
  return (
    <nav className="adm-bottomnav" data-theme="dark" aria-label="Navigation principale">
      <ul className="adm-bottomnav-list">
        {BAR_ITEMS.map((item) => (
          <li key={item.key} className="adm-bottomnav-cell">
            <Link
              href={item.href}
              className="adm-bottomnav-item"
              aria-current={item.key === active ? 'page' : undefined}
            >
              <Icon name={item.icon} size={22} />
              <span className="adm-bottomnav-label">{item.label}</span>
            </Link>
          </li>
        ))}
        <li className="adm-bottomnav-cell">
          <MoreSheet active={active} />
        </li>
      </ul>
    </nav>
  )
}
