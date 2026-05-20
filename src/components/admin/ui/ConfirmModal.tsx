'use client'

import { useEffect } from 'react'
import Icon from './Icon'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'warning' | 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

const VARIANT_COLORS = {
  warning: { bg: 'rgba(245, 158, 11, 0.14)', color: '#f59e0b' },
  danger: { bg: 'rgba(239, 68, 68, 0.14)', color: '#ef4444' },
  primary: { bg: 'rgba(255, 107, 0, 0.14)', color: '#ff6b00' },
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'warning',
  onConfirm,
  onCancel,
}: Props) {
  // Escape pour fermer.
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onCancel])

  if (!open) return null

  const colors = VARIANT_COLORS[variant]

  return (
    <div
      className="adm-modal-backdrop"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="adm-modal-title"
    >
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <div
          className="adm-modal-icon"
          style={{
            ['--adm-modal-icon-bg' as string]: colors.bg,
            ['--adm-modal-icon-color' as string]: colors.color,
          }}
          aria-hidden="true"
        >
          <Icon name="alert-triangle" size={22} strokeWidth={2.2} />
        </div>
        <h2 id="adm-modal-title" className="adm-modal-title">{title}</h2>
        <p className="adm-modal-message">{message}</p>
        <div className="adm-modal-actions">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`adm-btn ${variant === 'danger' ? 'adm-btn--danger' : 'adm-btn--primary'}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
