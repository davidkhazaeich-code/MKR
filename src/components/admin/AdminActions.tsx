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
import { ADMIN_SOLO_DUO_HINT } from '@/lib/pricing-copy'
import ContractCard from './ContractCard'
import VisioReminderCard from './VisioReminderCard'
import type { ContractLocale } from '@/data/contract'

type PaymentMethod = 'virement' | 'cash' | 'autre'

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  virement: 'Virement bancaire',
  cash: 'Espèces',
  autre: 'Autre',
}

interface Props {
  candidatureId: string
  currentStatus: Status
  packagePaidAt: string | null
  packageAmountCents: number | null
  paymentMethod: PaymentMethod | null
  paymentDate: string | null
  notesAdmin: string
  notesVisio: string
  // Carte Contrat
  candidateEmail: string | null
  submissionLanguage: 'fr' | 'en'
  // Carte Relance visio
  visioReminderSentAt: string | null
  visioReminderCount: number
  sessionId: string | null
  dureeSemaines: number | null
  dateDebutSouhaitee: string | null
  contractStartDate: string | null
  contractEndDate: string | null
  contractDurationWeeks: number | null
  contractInclusions: string | null
  contractExclusions: string | null
  contractNote: string | null
  contractPaymentDeadline: string | null
  contractLocale: ContractLocale | null
  contractNumber: number | null
  contractSentAt: string | null
  contractSentCount: number
  contractPdfPath: string | null
}

interface ServerCandidature {
  id: string
  status: Status
  status_changed_at: string
  package_paid_at: string | null
  package_amount_cents: number | null
  payment_method: PaymentMethod | null
  payment_date: string | null
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

const ACTION_ICON: Record<Status, 'check' | 'x' | 'rotate-ccw' | 'pause' | 'sparkles' | 'check-circle' | 'history'> = {
  recue: 'history', // retour arrière (« retirer la validation »)
  validee: 'check-circle',
  refusee: 'x',
  soldee: 'check',
  camp_fait: 'sparkles',
  annulee: 'pause',
  reportee: 'rotate-ccw',
}

const ACTION_VARIANT: Record<Status, 'warning' | 'danger' | 'primary'> = {
  recue: 'warning',
  validee: 'primary',
  refusee: 'danger',
  soldee: 'primary',
  camp_fait: 'primary',
  annulee: 'danger',
  reportee: 'warning',
}

const NEEDS_CONFIRM: Status[] = ['refusee', 'annulee', 'reportee', 'recue']

// Libellé de bouton spécifique (sinon STATUS_LABEL). 'recue' est ici un retour
// arrière (« retirer la validation »), pas l'état d'arrivée normal d'un dossier.
const ACTION_LABEL: Partial<Record<Status, string>> = {
  recue: 'Retirer la validation',
}

const ACTION_CONFIRM: Record<Status, { title: string; message: string } | undefined> = {
  recue: {
    title: 'Retirer la validation de ce dossier ?',
    message:
      'Le dossier repasse en « Reçue » (état initial), comme avant la validation. À utiliser si la visio de sélection n\'a pas encore été faite. Tu pourras le revalider ensuite : l\'image souvenir sera alors renvoyée au candidat.',
  },
  validee: undefined,
  soldee: undefined,
  camp_fait: undefined,
  refusee: {
    title: 'Refuser cette candidature ?',
    message:
      'Aucun paiement n\'ayant été pris à ce stade, il n\'y a pas de remboursement à effectuer. Cette action ne peut pas être annulée.',
  },
  annulee: {
    title: 'Annuler cette candidature ?',
    message:
      'Si un paiement a déjà été reçu, applique la grille d\'annulation (100% à >60j, 50% à 30-60j, 0% à <30j) manuellement. Cette action ne peut pas être annulée.',
  },
  reportee: {
    title: 'Reporter cette candidature ?',
    message:
      'Le candidat sera recalé sur une session ultérieure ou des dates sur mesure (90 jours min).',
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
  const [packagePaidAt, setPackagePaidAt] = useState(props.packagePaidAt)
  const [packageCents, setPackageCents] = useState(props.packageAmountCents)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(props.paymentMethod)
  const [paymentDate, setPaymentDate] = useState<string | null>(props.paymentDate)
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
      if (result.package_paid_at !== packagePaidAt) setPackagePaidAt(result.package_paid_at)
    }
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

  // === Méthode de paiement ===
  const handlePaymentMethodChange = async (next: PaymentMethod | null) => {
    const prev = paymentMethod
    setPaymentMethod(next)
    const result = await patch(
      { payment_method: next },
      {
        successMessage: next ? `Méthode : ${PAYMENT_METHOD_LABEL[next]}` : 'Méthode effacée',
        onError: () => setPaymentMethod(prev),
      },
    )
    if (result) setPaymentMethod(result.payment_method)
  }

  // === Date de paiement ===
  const handlePaymentDateChange = async (next: string | null) => {
    const prev = paymentDate
    setPaymentDate(next)
    const result = await patch(
      { payment_date: next },
      {
        successMessage: next ? `Date paiement : ${formatDateFr(next)}` : 'Date effacée',
        onError: () => setPaymentDate(prev),
      },
    )
    if (result) setPaymentDate(result.payment_date)
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
                    {ACTION_LABEL[next] ?? STATUS_LABEL[next]}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* === Relance visio (dossiers en attente de la visio de sélection) === */}
        <VisioReminderCard
          candidatureId={props.candidatureId}
          status={status}
          candidateEmail={props.candidateEmail}
          submissionLanguage={props.submissionLanguage}
          visioReminderSentAt={props.visioReminderSentAt}
          visioReminderCount={props.visioReminderCount}
          busyExternal={busy}
        />

        {/* === Paiement === */}
        <section className="adm-card">
          <h2 className="adm-card-title">
            <Icon name="euro" size={14} />
            Paiement
          </h2>

          <div className="adm-input-row">
            <label className="adm-input-row-label" htmlFor="package-amount">
              Montant package (€)
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '0.15rem' }}>
                Pré-rempli automatiquement depuis la grille selon la demande (durée, composition, discipline). Ajuste-le si tu conviens d&apos;un autre montant. Référence adulte Solo/Duo : {ADMIN_SOLO_DUO_HINT}. Vide = sur devis (combo, 11+, club 6-10).
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
              placeholder="1690"
              disabled={busy}
            />
            {packageDirty && (
              <button type="button" onClick={handleSavePackage} disabled={busy} className="adm-btn adm-btn--ghost" style={{ padding: '0.45rem 0.7rem' }}>
                Enregistrer
              </button>
            )}
          </div>

          <div className="adm-input-row">
            <label className="adm-input-row-label" htmlFor="payment-method">
              Méthode de paiement
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '0.15rem' }}>
                Paiement reçu après la visio.
              </span>
            </label>
            <select
              id="payment-method"
              className="adm-input"
              value={paymentMethod ?? ''}
              onChange={(e) => {
                const v = e.target.value
                void handlePaymentMethodChange(v === '' ? null : (v as PaymentMethod))
              }}
              disabled={busy}
            >
              <option value="">— Pas encore reçu</option>
              <option value="virement">Virement bancaire</option>
              <option value="cash">Espèces</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className="adm-input-row">
            <label className="adm-input-row-label" htmlFor="payment-date">
              Date de réception
            </label>
            <input
              id="payment-date"
              type="date"
              className="adm-input"
              value={paymentDate ?? ''}
              onChange={(e) => {
                const v = e.target.value
                void handlePaymentDateChange(v === '' ? null : v)
              }}
              disabled={busy}
            />
          </div>

          <Switch
            checked={!!packagePaidAt}
            onChange={handlePackageToggle}
            disabled={busy}
            label="Package soldé"
            help={
              packagePaidAt
                ? `Soldé le ${new Date(packagePaidAt).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : 'À cocher quand le paiement post-visio est confirmé.'
            }
          />
        </section>

        {/* === Contrat === */}
        <ContractCard
          candidatureId={props.candidatureId}
          status={status}
          packageAmountCents={packageCents}
          onAmountSaved={(cents) => {
            // Montant édité depuis la carte Contrat : resynchronise la carte
            // Paiement (même source unique package_amount_cents).
            setPackageCents(cents)
            setPackageEur(String(cents / 100))
          }}
          candidateEmail={props.candidateEmail}
          submissionLanguage={props.submissionLanguage}
          sessionId={props.sessionId}
          dureeSemaines={props.dureeSemaines}
          dateDebutSouhaitee={props.dateDebutSouhaitee}
          contractStartDate={props.contractStartDate}
          contractEndDate={props.contractEndDate}
          contractDurationWeeks={props.contractDurationWeeks}
          contractInclusions={props.contractInclusions}
          contractExclusions={props.contractExclusions}
          contractNote={props.contractNote}
          contractPaymentDeadline={props.contractPaymentDeadline}
          contractLocale={props.contractLocale}
          contractNumber={props.contractNumber}
          contractSentAt={props.contractSentAt}
          contractSentCount={props.contractSentCount}
          contractPdfPath={props.contractPdfPath}
          busyExternal={busy}
        />

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
              placeholder="Ce que tu veux noter sur le dossier (suivi, relances, paiement reçu…)"
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
        confirmLabel={confirm ? (ACTION_LABEL[confirm] ?? STATUS_LABEL[confirm]) : ''}
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

function formatDateFr(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function NotesStatusIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return <div className="adm-notes-status" />
  const cls = `adm-notes-status adm-notes-status--${state}`
  const iconStyle = { marginRight: 6, verticalAlign: '-2px' } as const
  return (
    <div className={cls}>
      {state === 'dirty' && (
        <span style={iconStyle}>
          <Icon name="edit" size={13} /> Modifié — enregistrement automatique…
        </span>
      )}
      {state === 'saving' && (
        <span style={iconStyle}>
          <Icon name="clock" size={13} /> Enregistrement…
        </span>
      )}
      {state === 'saved' && (
        <span style={iconStyle}>
          <Icon name="check" size={13} strokeWidth={2.4} /> Enregistré
        </span>
      )}
      {state === 'error' && (
        <span style={iconStyle}>
          <Icon name="alert-triangle" size={13} /> Erreur — réessaye
        </span>
      )}
    </div>
  )
}
