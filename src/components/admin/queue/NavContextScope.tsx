'use client'

// Contexte precedent/suivant pour la fiche dossier : au clic sur un lien de
// dossier (a[data-dossier-id]) de son sous-arbre, enregistre l'ordre de la
// page (ids uniques, dans l'ordre du DOM) avec l'URL de retour et le libelle.
// La fiche le relit (readNavContext) pour J / K et le retour.
//
// Phase de capture : l'enregistrement precede la navigation de next/link.
// auxclick couvre le clic molette (ouverture dans un nouvel onglet) ; le
// clavier (Entree sur un lien) declenche un click normal.
// Rend un simple <div> : className lui donne son role de mise en page.

import { useRef } from 'react'
import { saveNavContext } from '@/lib/admin/nav-context'

export interface NavContextScopeProps {
  backHref: string
  label: string
  className?: string
  children: React.ReactNode
}

const DOSSIER_LINK = 'a[data-dossier-id]'

export default function NavContextScope({ backHref, label, className, children }: NavContextScopeProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  const remember = (event: React.MouseEvent<HTMLDivElement>) => {
    const root = rootRef.current
    const target = event.target
    if (!root || !(target instanceof Element)) return
    const link = target.closest(DOSSIER_LINK)
    if (!link || !root.contains(link)) return

    const ids: string[] = []
    const seen = new Set<string>()
    root.querySelectorAll<HTMLAnchorElement>(DOSSIER_LINK).forEach((a) => {
      const id = a.dataset.dossierId
      if (id && !seen.has(id)) {
        seen.add(id)
        ids.push(id)
      }
    })
    saveNavContext({ ids, backHref, label })
  }

  return (
    <div ref={rootRef} className={className} onClickCapture={remember} onAuxClickCapture={remember}>
      {children}
    </div>
  )
}
