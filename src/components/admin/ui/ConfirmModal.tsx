'use client'

// Fenetre de confirmation. Props inchangees pour les appelants existants ;
// confirmIcon ajoute l'icone de l'action au bouton de confirmation, icon
// remplace l'icone d'en-tete de la variante, busy garde la fenetre ouverte
// pendant l'envoi (confirmation en chargement, annulation impossible).
// Accessibilite : role dialog + aria-modal, titre et message relies
// (aria-labelledby, aria-describedby), piege de focus (Tab et Maj+Tab
// bouclent), Echap et clic sur le fond annulent, retour du focus a
// l'element declencheur. Rendu dans document.body (portail).

import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'
import Icon, { type IconName } from './Icon'
import { useDialogFocus, useIsClient } from './useDialogFocus'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'warning' | 'danger' | 'primary'
  /** Icone de l'action portee par le bouton de confirmation (envoyer = send...). */
  confirmIcon?: IconName
  /** Icone d'en-tete, a la place de celle de la variante (le ton reste celui de la variante). */
  icon?: IconName
  /** Envoi en cours : bouton de confirmation en chargement, pas d'annulation (Echap, fond, bouton). */
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// L'icone d'en-tete suit la variante : warning et danger annoncent un risque
// (triangle au ton) ; primary confirme une action courante (coche au ton info,
// jamais en rust : la couleur d'action est reservee au cliquable).
const VARIANT = {
  warning: { tone: 'warn', icon: 'alert-triangle', button: 'primary' },
  danger: { tone: 'danger', icon: 'alert-triangle', button: 'danger' },
  primary: { tone: 'info', icon: 'check-circle', button: 'primary' },
} as const

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'warning',
  confirmIcon,
  icon,
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const isClient = useIsClient()
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const messageId = useId()
  const visible = open && isClient
  const cancel = () => {
    if (!busy) onCancel()
  }

  // Focus initial : Annuler pour une suppression (Entree ne detruit rien),
  // Confirmer sinon.
  useDialogFocus(visible, dialogRef, cancel, () =>
    variant === 'danger' ? cancelRef.current : confirmRef.current,
  )

  if (!visible) return null

  const cfg = VARIANT[variant]

  return createPortal(
    <div
      className="adm-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) cancel()
      }}
    >
      <div
        ref={dialogRef}
        className="adm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
      >
        <div className={`adm-modal-icon adm-tone--${cfg.tone}`} aria-hidden="true">
          <Icon name={icon ?? cfg.icon} size={20} />
        </div>
        <h2 id={titleId} className="adm-modal-title">
          {title}
        </h2>
        <p id={messageId} className="adm-modal-message">
          {message}
        </p>
        <div className="adm-modal-actions">
          <Button ref={cancelRef} variant="secondary" onClick={cancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={cfg.button}
            icon={confirmIcon}
            loading={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
