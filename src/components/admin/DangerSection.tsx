'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Icon from './ui/Icon'
import { useToast } from './ui/Toast'

interface Props {
  candidatureId: string
  candidateName: string
}

const REQUIRED_TEXT = 'SUPPRIMER'

export default function DangerSection({ candidatureId, candidateName }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Esc pour fermer + autofocus input
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cancel()
      }
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const cancel = () => {
    if (busy) return
    setOpen(false)
    setConfirmText('')
  }

  const confirm = async () => {
    if (busy) return
    if (confirmText.trim().toUpperCase() !== REQUIRED_TEXT) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/candidature/${candidatureId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.show(data.error || 'Suppression échouée', 'error')
        setBusy(false)
        return
      }
      const msg = data.candidateDeleted
        ? `Dossier et candidat « ${candidateName} » supprimés`
        : `Dossier « ${candidateName} » supprimé (candidat conservé)`
      toast.show(msg, 'success', 4000)
      router.push('/admin/inscriptions')
      router.refresh()
    } catch {
      toast.show('Connexion impossible. Réessaye.', 'error')
      setBusy(false)
    }
  }

  const canConfirm = confirmText.trim().toUpperCase() === REQUIRED_TEXT

  return (
    <>
      <section
        className="adm-card"
        style={{
          marginTop: '1rem',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          background: 'rgba(239, 68, 68, 0.03)',
        }}
      >
        <h2 className="adm-card-title" style={{ color: 'var(--adm-status-refusee)' }}>
          <Icon name="alert-triangle" size={14} />
          Zone dangereuse
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--adm-text-secondary)', margin: '0 0 1rem', lineHeight: 1.5 }}>
          Supprimer ce dossier le retire <strong>définitivement</strong> de la base
          (candidature, formulaire, historique). Si le candidat n&apos;a aucun autre dossier,
          il sera également supprimé. Cette action est <strong>irréversible</strong>.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="adm-btn adm-btn--danger"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Icon name="x" size={14} strokeWidth={2.5} />
          Supprimer définitivement
        </button>
      </section>

      {open && (
        <div className="adm-modal-backdrop" role="dialog" aria-modal="true" onClick={cancel}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div
              className="adm-modal-icon"
              style={{
                ['--adm-modal-icon-bg' as string]: 'rgba(239, 68, 68, 0.14)',
                ['--adm-modal-icon-color' as string]: 'var(--adm-status-refusee)',
              }}
              aria-hidden="true"
            >
              <Icon name="alert-triangle" size={22} strokeWidth={2.4} />
            </div>
            <h2 className="adm-modal-title">Supprimer ce dossier ?</h2>
            <p className="adm-modal-message">
              Tu vas supprimer <strong>définitivement</strong> le dossier de{' '}
              <strong>{candidateName}</strong> ainsi que son historique complet. Cette action
              ne peut <strong>pas être annulée</strong>.
            </p>
            <p className="adm-modal-message" style={{ marginBottom: '0.5rem' }}>
              Pour confirmer, tape <code style={{ background: 'var(--adm-bg-base)', padding: '0.1rem 0.4rem', borderRadius: 4, color: 'var(--adm-status-refusee)', fontWeight: 700, letterSpacing: '0.05em' }}>{REQUIRED_TEXT}</code> ci-dessous :
            </p>
            <input
              ref={inputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={REQUIRED_TEXT}
              autoComplete="off"
              spellCheck={false}
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem',
                marginBottom: '1.25rem',
                borderRadius: 'var(--adm-r-md)',
                border: `1px solid ${canConfirm ? 'var(--adm-status-refusee)' : 'var(--adm-border-default)'}`,
                background: 'var(--adm-bg-base)',
                color: 'var(--adm-text-primary)',
                fontSize: '0.95rem',
                fontFamily: 'var(--adm-font-mono)',
                letterSpacing: '0.05em',
                textAlign: 'center',
                fontWeight: 600,
                transition: 'border-color var(--adm-tr-fast)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm && !busy) {
                  e.preventDefault()
                  confirm()
                }
              }}
            />
            <div className="adm-modal-actions">
              <button type="button" className="adm-btn adm-btn--ghost" onClick={cancel} disabled={busy}>
                Annuler
              </button>
              <button
                type="button"
                className="adm-btn adm-btn--danger"
                onClick={confirm}
                disabled={!canConfirm || busy}
              >
                {busy ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
