// En-tete mobile (< 1024 px ; masque en CSS au-dessus) : colle en haut,
// 56 px + zone sure haute, chrome sombre (data-theme="dark").
// Par defaut : [logo vers l'accueil] [titre centre tronque] [Rafraichir].
// `children` remplace ce contenu (fiche dossier : retour, precedent,
// suivant) en gardant le conteneur ; utiliser les zones .adm-topbar-start,
// .adm-topbar-title et .adm-topbar-end. Composant serveur.

import Image from 'next/image'
import Link from 'next/link'
import RefreshButton from './RefreshButton'

export default function MobileTopBar({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="adm-topbar" data-theme="dark">
      {children ?? (
        <>
          <div className="adm-topbar-start">
            <Link href="/admin" className="adm-topbar-brand" aria-label="MKR Admin, accueil">
              <Image src="/logo-white.webp" alt="" width={53} height={32} className="adm-topbar-logo" />
            </Link>
          </div>
          <p className="adm-topbar-title">{title}</p>
          <div className="adm-topbar-end">
            <RefreshButton />
          </div>
        </>
      )}
    </header>
  )
}
