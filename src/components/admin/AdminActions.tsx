'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, useEffect, useRef } from 'react'
import {
  ALLOWED_TRANSITIONS,
  STATUS_LABEL,
  TRANSITION_REMINDER,
  type Status,
} from '@/lib/admin-transitions'
import Switch from './ui/Switch'
import ConfirmModal from './ui/ConfirmModal'
import Icon from './ui/Icon'

interface Props {
  candidatureId: string
  currentStatus: Status
  registrationFeePaidAt: string | null
  packagePaidAt: string | null
  packageAmountCents: number | null
  notesAdmin: string
  notesVisio: string
}

const ACTION_COLOR: Record<Status, { color: string; bg: string; border: string }> = {
  recue: { color: 'var(--adm-text-secondary)', bg: 'var(--adm-bg-elevated)', border: 'var(--adm-border-default)' },
  validee: { color: 'var(--adm-status-validee)', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.4)' },
  refusee: { color: 'var(--adm-status-refusee)', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.35)' },
  soldee: { color: 'var(--adm-status-soldee)', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.4)' },
  camp_fait: { color: 'var(--adm-status-camp_fait)', bg: 'rgba(167, 139, 250, 0.1)', border: 'rgba(167, 139, 250, 0.4)' },
  annulee: { color: 'var(--adm-status-annulee)', bg: 'rgba(113, 113, 122, 0.15)', border: 'rgba(113, 113, 122, 0.4)' },
  reportee: { color: 'var(--adm-status-reportee)', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.4)' },
}

const ACTION_ICON: Record<Status, 'check' | 'x' | 'rotate-ccw' | 'pause' | 'sparkles' | 'check-circle'> = {
  recue: 'check',
  validee: 'check-circle',
  refusee: 'x',
  soldee: 'check',
  camp_fait: 'sparkles',
  annulee: 'pause',
  reportee: 'rotate-ccw',
}

const ACTION_VARIANT: Record<Status, 'warning' | 'danger' | 'primary'> = {
  recue: 'primary',
  validee: 'primary',
  refusee: 'danger',
  soldee: 'primary',
  camp_fait: 'primary',
  annulee: 'danger',
  reportee: 'warning',
}

const ACTION_CONFIRM: Partial<Record<Status, { title: string; message: string }>> = {
  refusee: {
    title: 'Refuser cette candidature ?',
    message:
      'Le candidat devra être remboursé manuellement (Stripe pas encore actif). Cette action ne peut pas être annulée.',
  },
  annulee: {
    title: 'Annuler cette candidature ?',
    message: 'Les frais 100€ sont perdus pour le candidat. Cette action ne peut pas être annulée.',
  },
  reportee: {
    title: 'Reporter cette candidature ?',
    message:
      'Un crédit 100€ valable 12 mois sera dû au candidat (à noter manuellement, table credits pas encore créée).',
  },
}

const NOTES_DEBOUNCE_MS = 1000

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export default function AdminActions({
  candidatureId,
  currentStatus,
  registrationFeePaidAt,
  packagePaidAt,
  packageAmountCents,
  notesAdmin,
  notesVisio,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<Status | null>(null)

  // Notes : auto-save debounce
  const [adminDraft, setAdminDraft] = useState(notesAdmin)
  const [adminState, setAdminState] = useState<SaveState>('idle')
  const adminTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [visioDraft, setVisioDraft] = useState(notesVisio)
  const [visioState, setVisioState] = useState<SaveState>('idle')
  const visioTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Package amount
  const [packageEur, setPackageEur] = useState(
    packageAmountCents ? String(packageAmountCents / 100) : '',
  )
  const packageDirty =
    (packageEur === '' && packageAmountCents !== null) ||
    (packageEur !== '' && Math.round(parseFloat(packageEur) * 100) !== packageAmountCents)

  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? []

  const call = async (body: Record<string, unknown>): Promise<boolean> => {
    setError(null)
    try {
      const res = await fetch(`/api/admin/candidature/${candidatureId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        setError(data.error || 'Une erreur est survenue.')
        return false
      }
      startTransition(() => router.refresh())
      return true
    } catch {
      setError('Connexion impossible. Réessaye.')
      return false
    }
  }

  const handleTransitionClick = (next: Status) => {
    if (ACTION_CONFIRM[next]) {
      setConfirm(next)
    } else {
      void call({ status: next })
    }
  }

  const confirmTransition = async () => {
    if (!confirm) return
    const next = confirm
    setConfirm(null)
    await call({ status: next })
  }

  const handleFeeToggle = (checked: boolean) => {
    void call({ fee_paid: checked })
  }
  const handlePackageToggle = (checked: boolean) => {
    void call({ package_paid: checked })
  }
  const handleSavePackage = async () => {
    const eur = parseFloat(packageEur)
    if (Number.isNaN(eur) || eur < 0) {
      setError('Montant package invalide')
      return
    }
    await call({ package_amount_cents: Math.round(eur * 100) })
  }

  // Auto-save admin notes
  useEffect(() => {
    if (adminDraft === notesAdmin) {
      setAdminState('idle')
      return
    }
    setAdminState('dirty')
    if (adminTimer.current) clearTimeout(adminTimer.current)
    adminTimer.current = setTimeout(async () => {
      setAdminState('saving')
      const ok = await call({ notes_admin: adminDraft })
      setAdminState(ok ? 'saved' : 'error')
      if (ok) {
        setTimeout(() => setAdminState('idle'), 2000)
      }
    }, NOTES_DEBOUNCE_MS)
    return () => {
      if (adminTimer.current) clearTimeout(adminTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminDraft])

  // Auto-save visio notes
  useEffect(() => {
    if (visioDraft === notesVisio) {
      setVisioState('idle')
      return
    }
    setVisioState('dirty')
    if (visioTimer.current) clearTimeout(visioTimer.current)
    visioTimer.current = setTimeout(async () => {
      setVisioState('saving')
      const ok = await call({ notes_visio: visioDraft })
      setVisioState(ok ? 'saved' : 'error')
      if (ok) {
        setTimeout(() => setVisioState('idle'), 2000)
      }
    }, NOTES_DEBOUNCE_MS)
    return () => {
      if (visioTimer.current) clearTimeout(visioTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visioDraft])

  const confirmConfig = confirm ? ACTION_CONFIRM[confirm] : null
  const confirmVariant = confirm ? ACTION_VARIANT[confirm] : 'primary'
  const confirmReminder = confirm ? TRANSITION_REMINDER[confirm] : null

  return (
    <>
      <div className="adm-card-stack">
        {error && (
          <div
            style={{
              padding: '0.7rem 0.85rem',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--adm-status-refusee)',
              fontSize: '0.85rem',
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        {/* === Statut === */}
        <section className="adm-card">
          <h2 className="adm-card-title">
            <Icon name="check-circle" size={14} />
            Faire évoluer le statut
          </h2>
          {allowed.length === 0 ? (
            <p className="adm-action-empty">Statut terminal — pas d&apos;action disponible.</p>
          ) : (
            <div className="adm-actions-grid">
              {allowed.map((next) => {
                const c = ACTION_COLOR[next]
                return (
                  <button
                    key={next}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleTransitionClick(next)}
                    className="adm-action-btn"
                    style={{
                      ['--adm-action-color' as string]: c.color,
                      ['--adm-action-bg' as string]: c.bg,
                      ['--adm-action-border' as string]: c.border,
                      ['--adm-action-hover-bg' as string]: c.bg,
                    }}
                  >
                    <Icon name={ACTION_ICON[next]} size={15} strokeWidth={2.4} />
                    {STATUS_LABEL[next]}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* === Paiement === */}
        <section className="adm-card">
          <h2 className="adm-card-title">
            <Icon name="euro" size={14} />
            Paiement
          </h2>

          <Switch
            checked={!!registrationFeePaidAt}
            onChange={handleFeeToggle}
            disabled={isPending}
            label="Frais d'inscription 100€ payés"
            help={
              registrationFeePaidAt
                ? `Marqué payé le ${new Date(registrationFeePaidAt).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : 'Stripe pas encore actif — paiement à constater manuellement.'
            }
          />

          <div className="adm-input-row">
            <label className="adm-input-row-label" htmlFor="package-amount">
              Montant package (€)
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '0.15rem' }}>
                Total à payer par le candidat (frais 100€ inclus).
              </span>
            </label>
            <input
              id="package-amount"
              type="number"
              step="0.01"
              min="0"
              className="adm-input"
              value={packageEur}
              onChange={(e) => setPackageEur(e.target.value)}
              placeholder="2900"
              disabled={isPending}
            />
            {packageDirty && (
              <button type="button" onClick={handleSavePackage} disabled={isPending} className="adm-btn adm-btn--ghost" style={{ padding: '0.45rem 0.7rem' }}>
                Enregistrer
              </button>
            )}
          </div>

          <Switch
            checked={!!packagePaidAt}
            onChange={handlePackageToggle}
            disabled={isPending}
            label="Package soldé (virement reçu)"
            help={
              packagePaidAt
                ? `Soldé le ${new Date(packagePaidAt).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : 'À cocher quand le virement de Ruslan est confirmé.'
            }
          />
        </section>

        {/* === Notes === */}
        <section className="adm-card">
          <h2 className="adm-card-title">
            <Icon name="edit" size={14} />
            Notes admin
          </h2>
          <div className="adm-notes">
            <textarea
              className="adm-notes-textarea"
              value={adminDraft}
              onChange={(e) => setAdminDraft(e.target.value)}
              placeholder="Ce que tu veux noter sur le dossier (suivi, relances, paiement reçu par virement…)"
              rows={4}
              disabled={isPending}
              maxLength={5000}
            />
            <NotesStatusIndicator state={adminState} />
          </div>
        </section>

        <section className="adm-card">
          <h2 className="adm-card-title">
            <Icon name="phone" size={14} />
            Compte-rendu visio
          </h2>
          <div className="adm-notes">
            <textarea
              className="adm-notes-textarea"
              value={visioDraft}
              onChange={(e) => setVisioDraft(e.target.value)}
              placeholder="Notes prises pendant ou après l'entretien de validation"
              rows={4}
              disabled={isPending}
              maxLength={5000}
            />
            <NotesStatusIndicator state={visioState} />
          </div>
        </section>
      </div>

      <ConfirmModal
        open={!!confirm && !!confirmConfig}
        title={confirmConfig?.title ?? ''}
        message={`${confirmConfig?.message ?? ''}${confirmReminder ? `\n\nRappel post-action : ${confirmReminder}` : ''}`}
        confirmLabel={confirm ? STATUS_LABEL[confirm] : ''}
        cancelLabel="Annuler"
        variant={confirmVariant}
        onConfirm={confirmTransition}
        onCancel={() => setConfirm(null)}
      />
    </>
  )
}

function NotesStatusIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return <div className="adm-notes-status" />
  const cls = `adm-notes-status adm-notes-status--${state}`
  return (
    <div className={cls}>
      {state === 'dirty' && '✏️ Modifié — enregistrement automatique dans 1 s…'}
      {state === 'saving' && '⏳ Enregistrement…'}
      {state === 'saved' && '✓ Enregistré'}
      {state === 'error' && '⚠️ Erreur — réessaye'}
    </div>
  )
}
