'use client'

// Zone dangereuse de la fiche (onglet Historique) : suppression definitive du
// dossier, confirmee par la saisie de SUPPRIMER dans une fenetre dediee
// (piege de focus, Echap, retour du focus). Apres succes : retour a la liste
// d'origine (contexte precedent/suivant, sans le dossier supprime), sinon aux
// candidatures.

import { useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import Icon from './ui/Icon'
import { useToast } from './ui/Toast'
import { useDialogFocus, useIsClient } from './ui/useDialogFocus'
import { readNavContext, saveNavContext } from '@/lib/admin/nav-context'

interface Props {
  candidatureId: string
  candidateName: string
}

const REQUIRED_TEXT = 'SUPPRIMER'
const FALLBACK_BACK = '/admin/inscriptions'

export default function DangerSection({ candidatureId, candidateName }: Props) {
  const router = useRouter()
  const toast = useToast()
  const isClient = useIsClient()
  const uid = useId()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [busy, setBusy] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const visible = open && isClient

  const cancel = () => {
    if (busy) return
    setOpen(false)
    setConfirmText('')
  }

  useDialogFocus(visible, dialogRef, cancel, () => inputRef.current)

  const canConfirm = confirmText.trim().toUpperCase() === REQUIRED_TEXT

  const confirm = async () => {
    if (busy || !canConfirm) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/candidature/${candidatureId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.show(data.error || 'Suppression échouée', 'error', 5000)
        setBusy(false)
        return
      }
      const msg = data.candidateDeleted
        ? `Dossier et candidat « ${candidateName} » supprimés`
        : `Dossier « ${candidateName} » supprimé (candidat conservé)`
      toast.show(msg, 'success', 4000)
      // Retour a la liste d'origine, dont on retire le dossier supprime.
      const ctx = readNavContext()
      if (ctx) saveNavContext({ ...ctx, ids: ctx.ids.filter((x) => x !== candidatureId) })
      router.push(ctx?.backHref ?? FALLBACK_BACK)
      router.refresh()
    } catch {
      toast.show('Connexion impossible. Réessaye.', 'error', 5000)
      setBusy(false)
    }
  }

  return (
    <>
      <section className="adm-card adm-dossier-danger" aria-labelledby={`${uid}-title`}>
        <h2 id={`${uid}-title`} className="adm-card-title adm-tone--danger">
          <Icon name="alert-triangle" size={14} />
          Zone dangereuse
        </h2>
        <p className="adm-dossier-text">
          Supprimer ce dossier le retire <strong>définitivement</strong>{' '}
          de la base (candidature, formulaire, historique). Si le candidat n&apos;a aucun autre
          dossier, il sera également supprimé. Cette action est <strong>irréversible</strong>.
        </p>
        <div className="adm-btn-row adm-dossier-card-actions">
          <Button onClick={() => setOpen(true)}>Supprimer ce dossier</Button>
        </div>
      </section>

      {visible &&
        createPortal(
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
              aria-labelledby={`${uid}-dialog-title`}
              aria-describedby={`${uid}-dialog-text`}
              tabIndex={-1}
            >
              <div className="adm-modal-icon adm-tone--danger" aria-hidden="true">
                <Icon name="alert-triangle" size={20} />
              </div>
              <h2 id={`${uid}-dialog-title`} className="adm-modal-title">
                Supprimer ce dossier{'\u00a0'}?
              </h2>
              <p id={`${uid}-dialog-text`} className="adm-modal-message">
                Tu vas supprimer <strong>définitivement</strong> le dossier de <strong>{candidateName}</strong>{' '}
                ainsi que son historique complet. Cette action ne peut <strong>pas être annulée</strong>.
              </p>
              <div className="adm-field adm-dossier-delete-field">
                <label htmlFor={`${uid}-input`} className="adm-field-label">
                  Pour confirmer, tape {REQUIRED_TEXT}
                </label>
                <input
                  ref={inputRef}
                  id={`${uid}-input`}
                  type="text"
                  className="adm-input adm-mono adm-dossier-delete-input"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={REQUIRED_TEXT}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canConfirm && !busy) {
                      e.preventDefault()
                      void confirm()
                    }
                  }}
                />
              </div>
              <div className="adm-modal-actions">
                <Button onClick={cancel} disabled={busy}>
                  Annuler
                </Button>
                <Button variant="danger" icon="trash" onClick={() => void confirm()} disabled={!canConfirm} loading={busy}>
                  Supprimer définitivement
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
