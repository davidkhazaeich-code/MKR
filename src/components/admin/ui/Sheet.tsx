'use client'

// Panneau (dialogue) : colle en bas de l'ecran sous 640 px, centre au-dessus.
// Piege de focus, Echap, clic sur le fond, retour du focus au declencheur.
// Rendu dans document.body (portail) : aucun ancetre transforme ou flou ne
// peut decaler sa position fixe.
// Focus initial : premier element du contenu (defaut), ou le panneau lui-meme
// (autoFocusBody={false}, titre relie) quand ce premier element est un champ
// qui ouvrirait le clavier du telephone a l'ouverture.

import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'
import { getFocusable, useDialogFocus, useIsClient } from './useDialogFocus'

export interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  /** false : focus initial sur le panneau et non sur son premier champ. */
  autoFocusBody?: boolean
  children: React.ReactNode
}

export default function Sheet({ open, onClose, title, autoFocusBody = true, children }: SheetProps) {
  const isClient = useIsClient()
  const sheetRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const visible = open && isClient

  useDialogFocus(visible, sheetRef, onClose, () => {
    if (!autoFocusBody) return sheetRef.current
    const firstInBody = bodyRef.current ? getFocusable(bodyRef.current)[0] : null
    return firstInBody ?? closeRef.current
  })

  if (!visible) return null

  return createPortal(
    <div
      className="adm-sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={sheetRef}
        className="adm-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="adm-sheet-header">
          <h2 id={titleId} className="adm-sheet-title">
            {title}
          </h2>
          <Button ref={closeRef} variant="ghost" icon="x" iconOnly aria-label="Fermer" onClick={onClose} />
        </div>
        <div ref={bodyRef} className="adm-sheet-body">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
