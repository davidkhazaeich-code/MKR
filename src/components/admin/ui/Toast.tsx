'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Icon from './Icon'

type ToastVariant = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

const VARIANT_CONFIG: Record<ToastVariant, { color: string; icon: 'check' | 'x' | 'alert-triangle' }> = {
  success: { color: 'var(--adm-status-validee)', icon: 'check' },
  error: { color: 'var(--adm-status-refusee)', icon: 'alert-triangle' },
  info: { color: 'var(--adm-brand)', icon: 'check-circle' as 'check' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const show = useCallback((message: string, variant: ToastVariant = 'info', duration = 3000) => {
    counter.current += 1
    const id = `t${counter.current}`
    setToasts((prev) => [...prev, { id, message, variant, duration }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="adm-toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const cfg = VARIANT_CONFIG[toast.variant]

  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration)
    return () => clearTimeout(timer)
  }, [toast.duration, onDismiss])

  return (
    <div
      className={`adm-toast adm-toast--${toast.variant}`}
      style={{ ['--adm-toast-color' as string]: cfg.color }}
      role="status"
    >
      <span className="adm-toast-icon" aria-hidden="true">
        <Icon name={cfg.icon} size={16} strokeWidth={2.5} />
      </span>
      <span className="adm-toast-message">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="adm-toast-close"
        aria-label="Fermer la notification"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  )
}
