// Chrome de l'admin v2, rendu par chaque page (pas un layout : chaque page
// dit sa section active et son titre).
//
//   .adm-app
//     a.adm-skip-link            "Aller au contenu", premier arret clavier
//     aside.adm-sidebar          >= 1024 px
//     .adm-app-main
//       header.adm-topbar        < 1024 px (mobileTop remplace son contenu)
//       main#adm-main.adm-main   contenu de la page (qui pose son .adm-container)
//       nav.adm-bottomnav        < 1024 px, sauf hideBottomNav
//     RefreshOnFocus
//
// Composant serveur sans API de requete (ni cookies ni headers) : utilisable
// tel quel depuis loading.tsx et not-found.tsx.

import BottomNav from './BottomNav'
import MobileTopBar from './MobileTopBar'
import RefreshOnFocus from './RefreshOnFocus'
import Sidebar from './Sidebar'
import type { AdminSection } from './NavLinks'

export interface AdminShellProps {
  active?: AdminSection
  /** Titre de l'en-tete mobile. */
  title: string
  /** Remplace le contenu de l'en-tete mobile par defaut (fiche dossier). */
  mobileTop?: React.ReactNode
  /** Fiche dossier : barre d'actions a la place de la barre du bas. */
  hideBottomNav?: boolean
  children: React.ReactNode
}

export default function AdminShell({ active, title, mobileTop, hideBottomNav = false, children }: AdminShellProps) {
  return (
    <div className={hideBottomNav ? 'adm-app' : 'adm-app adm-app--bottomnav'}>
      <a href="#adm-main" className="adm-skip-link">
        Aller au contenu
      </a>
      <Sidebar active={active} />
      <div className="adm-app-main">
        <MobileTopBar title={title}>{mobileTop}</MobileTopBar>
        <main id="adm-main" className="adm-main" tabIndex={-1}>
          {children}
        </main>
        {!hideBottomNav && <BottomNav active={active} />}
      </div>
      <RefreshOnFocus renderedAt={Date.now()} />
    </div>
  )
}
