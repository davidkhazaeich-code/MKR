'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useTransition } from 'react'
import {
  ALLOWED_TRANSITIONS,
  STATUS_LABEL,
  TRANSITION_REMINDER,
  type Status,
} from '@/lib/admin-transitions'
import Switch from './ui/Switch'
import ConfirmModal from './ui/ConfirmModal'
import Icon from './ui/Icon'
import { useToast } from './ui/Toast'

interface Props {
  candidatureId: string
  currentStatus: Status
  registrationFeePaidAt: string | null
  packagePaidAt: string | null
  packageAmountCents: number | null
  notesAdmin: string
  notesVisio: string
}

interface ServerCandidature {
  id: string
  status: Status
  status_changed_at: string
  registration_fee_paid_at: string | null
  package_paid_at: string | null
  package_amount_cents: number | null
  notes_admin: string | null
  notes_visio: string | null
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

const NEEDS_CONFIRM: Status[] = ['refusee', 'annulee', 'reportee']

const ACTION_CONFIRM: Record<Status, { title: string; message: string } | undefined> = {
  recue: undefined,
  validee: undefined,
  soldee: undefined,
  camp_fait: undefined,
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

const NOTES_DEBOUNCE_MS = 900

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export default function AdminActions(props: Props) {
  const toast = useToast()
  const router = useRouter()
  const [, startTransition] = useTransition()

  // === État local optimiste ===
  // Initialisé depuis les props server-side, puis owned client-side.
  // Pas de re-sync depuis props : on évite que router.refresh écrase l'état utilisateur.
  const [status, setStatus] = useState<Status>(props.currentStatus)
  const [feePaidAt, setFeePaidAt] = useState(props.registrationFeePaidAt)
  const [packagePaidAt, setPackagePaidAt] = useState(props.packagePaidAt)
  const [packageCents, setPackageCents] = useState(props.packageAmountCents)
  const [confirm, setConfirm] = useState<Status | null>(null)
  const [busy, setBusy] = useState(false)

  const [adminDraft, setAdminDraft] = useState(props.notesAdmin)
  const [adminSaved, setAdminSaved] = useState(props.notesAdmin)
  const [adminState, setAdminState] = useState<SaveState>('idle')
  const adminTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [visioDraft, setVisioDraft] = useState(props.notesVisio)
  const [visioSaved, setVisioSaved] = useState(props.notesVisio)
  const [visioState, setVisioState] = useState<SaveState>('idle')
  const visioTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [packageEur, setPackageEur] = useState(
    props.packageAmountCents ? String(props.packageAmountCents / 100) : '',
  )
  const packageDirty =
    (packageEur === '' && packageCents !== null) ||
    (packageEur !== '' && Math.round(parseFloat(packageEur) * 100) !== packageCents)

  const allowed = ALLOWED_TRANSITIONS[status] ?? []

  // === Helper API + sync optimiste ===
  const patch = async (
    body: Record<string, unknown>,
    options: { successMessage?: string; onError?: () => void } = {},
  ): Promise<ServerCandidature | null> => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/candidature/${props.candidatureId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.show(data.error || 'Une erreur est survenue', 'error')
        options.onError?.()
        return null
      }
      if (options.successMessage) toast.show(options.successMessage, 'success')
      // Sync server state en arriere-plan : audit_log + champs derives.
      // L'etat optimiste local est deja a jour, donc l'utilisateur ne voit pas de flicker.
      startTransition(() => router.refresh())
      return (data.candidature ?? null) as ServerCandidature | null
    } catch {
      toast.show('Connexion impossible. Vérifie ton réseau.', 'error')
      options.onError?.()
      return null
    } finally {
      setBusy(false)
    }
  }

  // === Status transition ===
  const requestTransition = (next: Status) => {
    if (NEEDS_CONFIRM.includes(next)) {
      setConfirm(next)
    } else {
      void doTransition(next)
    }
  }

  const doTransition = async (next: Status) => {
    const prevStatus = status
    setStatus(next) // optimiste
    const result = await patch(
      { status: next },
      {
        successMessage: `Statut passé à « ${STATUS_LABEL[next]} »`,
        onError: () => setStatus(prevStatus),
      },
    )
    if (result) {
      setStatus(result.status)
      // Si une transition a déclenché un side-effect server (rare en V1.5),
      // sync les autres champs aussi.
      if (result.registration_fee_paid_at !== feePaidAt) setFeePaidAt(result.registration_fee_paid_at)
      if (result.package_paid_at !== packagePaidAt) setPackagePaidAt(result.package_paid_at)
    }
  }

  // === Fee toggle ===
  const handleFeeToggle = async (checked: boolean) => {
    const prev = feePaidAt
    setFeePaidAt(checked ? new Date().toISOString() : null)
    const result = await patch(
      { fee_paid: checked },
      {
        successMessage: checked ? 'Frais 100€ marqués payés' : 'Frais 100€ remis à non payés',
        onError: () => setFeePaidAt(prev),
      },
    )
    if (result) setFeePaidAt(result.registration_fee_paid_at)
  }

  // === Package paid toggle ===
  const handlePackageToggle = async (checked: boolean) => {
    const prev = packagePaidAt
    setPackagePaidAt(checked ? new Date().toISOString() : null)
    const result = await patch(
      { package_paid: checked },
      {
        successMessage: checked ? 'Package marqué soldé' : 'Package remis à non soldé',
        onError: () => setPackagePaidAt(prev),
      },
    )
    if (result) setPackagePaidAt(result.package_paid_at)
  }

  // === Package amount ===
  const handleSavePackage = async () => {
    const eur = parseFloat(packageEur)
    if (Number.isNaN(eur) || eur < 0) {
      toast.show('Montant package invalide', 'error')
      return
    }
    const cents = Math.round(eur * 100)
    const prev = packageCents
    setPackageCents(cents)
    const result = await patch(
      { package_amount_cents: cents },
      {
        successMessage: `Montant package : ${eur.toFixed(2)} €`,
        onError: () => setPackageCents(prev),
      },
    )
    if (result) setPackageCents(result.package_amount_cents)
  }

  // === Auto-save admin notes (debounced) ===
  useEffect(() => {
    if (adminDraft === adminSaved) {
      setAdminState('idle')
      return
    }
    setAdminState('dirty')
    if (adminTimer.current) clearTimeout(adminTimer.current)
    adminTimer.current = setTimeout(async () => {
      setAdminState('saving')
      const result = await patch({ notes_admin: adminDraft })
      if (result) {
        setAdminSaved(adminDraft)
        setAdminState('saved')
        setTimeout(() => setAdminState('idle'), 1800)
      } else {
        setAdminState('error')
      }
    }, NOTES_DEBOUNCE_MS)
    return () => {
      if (adminTimer.current) clearTimeout(adminTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminDraft])

  useEffect(() => {
    if (visioDraft === visioSaved) {
      setVisioState('idle')
      return
    }
    setVisioState('dirty')
    if (visioTimer.current) clearTimeout(visioTimer.current)
    visioTimer.current = setTimeout(async () => {
      setVisioState('saving')
      const result = await patch({ notes_visio: visioDraft })
      if (result) {
        setVisioSaved(visioDraft)
        setVisioState('saved')
        setTimeout(() => setVisioState('idle'), 1800)
      } else {
        setVisioState('error')
      }
    }, NOTES_DEBOUNCE_MS)
    return () => {
      if (visioTimer.current) clearTimeout(visioTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visioDraft])

  // === Raccourcis clavier ===
  // V valider, R refuser, A annuler, Z reporter, S solder, T marquer camp fait
  // Skip si focus dans un input/textarea ou modale ouverte.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (
        confirm ||
        busy ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable))
      ) {
        return
      }
      const map: Record<string, Status> = {
        v: 'validee',
        r: 'refusee',
        a: 'annulee',
        z: 'reportee',
        s: 'soldee',
        t: 'camp_fait',
      }
      const next = map[e.key.toLowerCase()]
      if (!next) return
      if (!allowed.includes(next)) return
      e.preventDefault()
      requestTransition(next)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm, busy, allowed, status])

  const confirmConfig = confirm ? ACTION_CONFIRM[confirm] : null
  const confirmVariant = confirm ? ACTION_VARIANT[confirm] : 'primary'
  const confirmReminder = confirm ? TRANSITION_REMINDER[confirm] : null

  return (
    <>
      <div className="adm-card-stack">
        {/* === Statut === */}
        <section className="adm-card">
          <h2 className="adm-card-title">
            <Icon name="check-circle" size={14} />
            Faire évoluer le statut
            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--adm-text-faint)', fontWeight: 500, letterSpacing: 0, textTransform: 'none' }}>
              raccourcis : <kbd className="adm-kbd">V</kbd> <kbd className="adm-kbd">R</kbd> <kbd className="adm-kbd">A</kbd>
            </span>
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
                    disabled={busy}
                    onClick={() => requestTransition(next)}
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
            checked={!!feePaidAt}
            onChange={handleFeeToggle}
            disabled={busy}
            label="Frais d'inscription 100€ payés"
            help={
              feePaidAt
                ? `Marqué payé le ${new Date(feePaidAt).toLocaleString('fr-FR', {
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
              disabled={busy}
            />
            {packageDirty && (
              <button type="button" onClick={handleSavePackage} disabled={busy} className="adm-btn adm-btn--ghost" style={{ padding: '0.45rem 0.7rem' }}>
                Enregistrer
              </button>
            )}
          </div>

          <Switch
            checked={!!packagePaidAt}
            onChange={handlePackageToggle}
            disabled={busy}
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
        onConfirm={() => {
          const next = confirm
          setConfirm(null)
          if (next) void doTransition(next)
        }}
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
      {state === 'dirty' && '✏️ Modifié — enregistrement automatique…'}
      {state === 'saving' && '⏳ Enregistrement…'}
      {state === 'saved' && '✓ Enregistré'}
      {state === 'error' && '⚠️ Erreur — réessaye'}
    </div>
  )
}
