'use client'

// Entree "Plus" de la barre du bas (< 1024 px) et son panneau : sections
// secondaires (Partenaires, Leads guide), apparence, deconnexion.
// Quand la page courante est l'une de ces sections, l'entree "Plus" est
// marquee active (aria-current="true" : l'emplacement courant est dans ce
// groupe) et le lien de la section porte aria-current="page" dans le panneau.

import { useState } from 'react'
import Link from 'next/link'
import Icon from '@/components/admin/ui/Icon'
import Sheet from '@/components/admin/ui/Sheet'
import ThemeSwitch from './ThemeSwitch'
import { MORE_ITEMS, type AdminSection } from './NavLinks'

export default function MoreSheet({ active }: { active?: AdminSection }) {
  const [open, setOpen] = useState(false)
  const inMore = MORE_ITEMS.some((item) => item.key === active)

  return (
    <>
      <button
        type="button"
        className="adm-bottomnav-item"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-current={inMore ? 'true' : undefined}
        onClick={() => setOpen(true)}
      >
        <Icon name="more-horizontal" size={22} />
        <span className="adm-bottomnav-label">Plus</span>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Plus">
        <nav aria-label="Autres sections">
          <ul className="adm-more-list">
            {MORE_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="adm-more-item"
                  aria-current={item.key === active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="adm-more-item-label">{item.label}</span>
                  <Icon name="chevron-right" size={18} className="adm-more-item-chevron" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="adm-more-group">
          <ThemeSwitch />
        </div>

        <form method="POST" action="/api/admin/logout" className="adm-more-group">
          <button type="submit" className="adm-more-item">
            <Icon name="log-out" size={20} />
            <span className="adm-more-item-label">Déconnexion</span>
          </button>
        </form>
      </Sheet>
    </>
  )
}
