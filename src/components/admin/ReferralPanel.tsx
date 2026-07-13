'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Badge from './ui/Badge'
import Icon from './ui/Icon'
import { useToast } from './ui/Toast'

type ReferralPayoutStatus = 'not_applicable' | 'pending' | 'due' | 'paid' | 'cancelled'
type ReferralPayoutMethod = 'virement' | 'cash' | 'autre'

interface Props {
  candidatureId: string
  referralCode: string | null
  referralCodeValid: boolean | null
  referralPartnerName: string | null
  referralPartnerType: string | null
  referralBonusEur: number | null
  referralPayoutStatus: string | null
  referralPayoutPaidAt: string | null
  referralPayoutMethod: string | null
  referralCommissionType: string | null
  referralCommissionPct: number | null
  packageAmountCents: number | null
}

const STATUS_LABEL: Record<ReferralPayoutStatus, string> = {
  not_applicable: 'N/A',
  pending: 'En attente',
  due: 'À payer',
  paid: 'Payé',
  cancelled: 'Annulé',
}

const STATUS_COLOR: Record<ReferralPayoutStatus, string> = {
  not_applicable: 'var(--adm-text-muted)',
  pending: 'var(--adm-text-secondary)',
  due: 'var(--adm-status-reportee)',
  paid: 'var(--adm-status-validee)',
  cancelled: 'var(--adm-text-muted)',
}

const METHOD_LABEL: Record<ReferralPayoutMethod, string> = {
  virement: 'Virement bancaire',
  cash: 'Espèces',
  autre: 'Autre',
}

const PARTNER_TYPE_LABEL: Record<string, string> = {
  gym: 'Salle / club partenaire',
  influencer: 'Influenceur',
  coach: 'Coach',
  other: 'Autre',
}

function formatDateFr(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export default function ReferralPanel(props: Props) {
  const router = useRouter()
  const toast = useToast()
  const [, startTransition] = useTransition()
  const [showPayModal, setShowPayModal] = useState(false)
  const [showRevertConfirm, setShowRevertConfirm] = useState(false)
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10))
  const [payMethod, setPayMethod] = useState<ReferralPayoutMethod>('virement')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Escape pour fermer la modale (cohérent avec ConfirmModal).
  useEffect(() => {
    if (!showPayModal && !showRevertConfirm) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || submitting) return
      setShowPayModal(false)
      setShowRevertConfirm(false)
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [showPayModal, showRevertConfirm, submitting])

  if (!props.referralCode) return null

  const statusKey = (props.referralPayoutStatus ?? 'not_applicable') as ReferralPayoutStatus
  const statusLabel = STATUS_LABEL[statusKey] ?? statusKey
  const statusColor = STATUS_COLOR[statusKey] ?? 'var(--adm-text-muted)'

  async function patch(body: Record<string, unknown>, successMessage: string) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/candidature/${props.candidatureId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      // Soft refresh (props server resynchronisees) : pas de location.reload,
      // qui perdait le scroll et rechargeait tout le dashboard.
      setShowPayModal(false)
      setShowRevertConfirm(false)
      setSubmitting(false)
      toast.show(successMessage, 'success')
      startTransition(() => router.refresh())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
      setSubmitting(false)
    }
  }

  async function markPaid() {
    await patch({
      referral_payout_status: 'paid',
      referral_payout_paid_at: payDate,
      referral_payout_method: payMethod,
    }, 'Bonus marqué payé')
  }

  async function revertPaid() {
    await patch({
      referral_payout_status: 'due',
      referral_payout_paid_at: null,
      referral_payout_method: null,
    }, 'Paiement du bonus annulé (repasse À payer)')
  }

  const partnerTypeLabel = props.referralPartnerType
    ? PARTNER_TYPE_LABEL[props.referralPartnerType] ?? props.referralPartnerType
    : null

  return (
    <section className="adm-card">
      <h2 className="adm-card-title">
        <Icon name="sparkles" size={14} />
        Recommandation
      </h2>

      <dl className="adm-defs">
        <div className="adm-def">
          <dt className="adm-def-key">Code saisi</dt>
          <dd className="adm-def-val">
            <span style={{ fontFamily: 'var(--adm-font-mono, monospace)', fontWeight: 700 }}>
              {props.referralCode}
            </span>
            {props.referralCodeValid === true && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--adm-status-validee)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Icon name="check" size={13} strokeWidth={2.4} />
                Valide
              </span>
            )}
            {props.referralCodeValid === false && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--adm-status-refusee)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Icon name="alert-triangle" size={13} strokeWidth={2.4} />
                Non reconnu
              </span>
            )}
          </dd>
        </div>

        {props.referralPartnerName && (
          <div className="adm-def">
            <dt className="adm-def-key">Partenaire</dt>
            <dd className="adm-def-val">{props.referralPartnerName}</dd>
          </div>
        )}

        {partnerTypeLabel && (
          <div className="adm-def">
            <dt className="adm-def-key">Type</dt>
            <dd className="adm-def-val">{partnerTypeLabel}</dd>
          </div>
        )}

        <div className="adm-def">
          <dt className="adm-def-key">Modèle</dt>
          <dd className="adm-def-val">
            {props.referralCommissionType === 'percent'
              ? `${props.referralCommissionPct ?? '?'} % du CA encaissé`
              : props.referralCommissionType === 'flat'
                ? 'Forfait fixe'
                : '—'}
          </dd>
        </div>

        <div className="adm-def">
          <dt className="adm-def-key">Commission</dt>
          <dd className="adm-def-val">
            {props.referralBonusEur !== null ? (
              <strong>{props.referralBonusEur} €</strong>
            ) : props.referralCommissionType === 'percent'
              && props.referralCommissionPct
              && props.packageAmountCents
              && props.packageAmountCents > 0 ? (
              // CA connu mais commission pas encore due : montrer la projection
              // (elle sera figée automatiquement au passage en Soldée).
              <span>
                ~{Math.round((props.referralCommissionPct * props.packageAmountCents) / 10000)} €
                <span style={{ color: 'var(--adm-text-muted)', marginLeft: '0.35rem', fontSize: '0.82rem' }}>
                  estimée, figée à la soldée
                </span>
              </span>
            ) : props.referralCommissionType === 'percent' ? (
              <span style={{ color: 'var(--adm-status-reportee)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icon name="alert-triangle" size={13} strokeWidth={2.4} />
                CA à saisir pour calculer la commission
              </span>
            ) : (
              <span className="adm-def-val--muted">—</span>
            )}
            {props.referralCommissionType === 'percent'
              && props.referralBonusEur !== null
              && props.packageAmountCents
              && props.packageAmountCents > 0 && (
              <span style={{ color: 'var(--adm-text-muted)', marginLeft: '0.4rem', fontSize: '0.82rem' }}>
                ({props.referralCommissionPct} % × {Math.round(props.packageAmountCents / 100)} €)
              </span>
            )}
          </dd>
        </div>

        <div className="adm-def">
          <dt className="adm-def-key">Statut paiement</dt>
          <dd className="adm-def-val">
            <Badge color={statusColor} dot>
              {statusLabel}
            </Badge>
          </dd>
        </div>

        {props.referralPayoutStatus === 'paid' && (
          <div className="adm-def">
            <dt className="adm-def-key">Payé le</dt>
            <dd className="adm-def-val">
              {props.referralPayoutPaidAt ? formatDateFr(props.referralPayoutPaidAt) : '—'}
              {props.referralPayoutMethod && (
                <span style={{ color: 'var(--adm-text-muted)' }}>
                  {' · '}
                  {METHOD_LABEL[props.referralPayoutMethod as ReferralPayoutMethod] ?? props.referralPayoutMethod}
                </span>
              )}
            </dd>
          </div>
        )}
      </dl>

      {(props.referralPayoutStatus === 'due' || props.referralPayoutStatus === 'paid') && (
        <div style={{ display: 'flex', gap: '0.55rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {props.referralPayoutStatus === 'due' && (
            <button
              type="button"
              className="adm-btn adm-btn--primary"
              onClick={() => setShowPayModal(true)}
            >
              <Icon name="check" size={14} strokeWidth={2.4} />
              {' '}Marquer payé
            </button>
          )}
          {props.referralPayoutStatus === 'paid' && (
            <button
              type="button"
              className="adm-btn adm-btn--ghost"
              onClick={() => setShowRevertConfirm(true)}
            >
              <Icon name="rotate-ccw" size={14} strokeWidth={2.4} />
              {' '}Annuler le paiement
            </button>
          )}
        </div>
      )}

      {props.referralPayoutStatus === 'pending' && (
        <p style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: 'var(--adm-text-muted)', lineHeight: 1.5 }}>
          Le bonus passera automatiquement à <strong>À payer</strong> quand la candidature sera soldée.
        </p>
      )}

      {props.referralPayoutStatus === 'cancelled' && (
        <p style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: 'var(--adm-text-muted)', lineHeight: 1.5 }}>
          Bonus annulé (candidature refusée ou annulée). Aucun versement ne sera effectué.
        </p>
      )}

      {showPayModal && (
        <div
          className="adm-modal-backdrop"
          onClick={() => !submitting && setShowPayModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="adm-referral-pay-title"
        >
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div
              className="adm-modal-icon"
              style={{
                ['--adm-modal-icon-bg' as string]: 'rgba(34, 197, 94, 0.14)',
                ['--adm-modal-icon-color' as string]: 'var(--adm-status-validee)',
              }}
              aria-hidden="true"
            >
              <Icon name="check" size={22} strokeWidth={2.4} />
            </div>
            <h2 id="adm-referral-pay-title" className="adm-modal-title">
              Marquer le bonus comme payé
            </h2>
            <p className="adm-modal-message">
              Confirme la date et la méthode de paiement du bonus de{' '}
              <strong>{props.referralBonusEur} €</strong> à{' '}
              <strong>{props.referralPartnerName ?? props.referralCode}</strong>.
            </p>

            <div className="adm-input-row" style={{ borderBottom: 'none', padding: '0.4rem 0' }}>
              <label className="adm-input-row-label" htmlFor="referral-pay-date">
                Date du paiement
              </label>
              <input
                id="referral-pay-date"
                type="date"
                className="adm-input"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                disabled={submitting}
                style={{ width: 160 }}
              />
            </div>

            <div className="adm-input-row" style={{ borderBottom: 'none', padding: '0.4rem 0', marginBottom: '0.6rem' }}>
              <label className="adm-input-row-label" htmlFor="referral-pay-method">
                Méthode
              </label>
              <select
                id="referral-pay-method"
                className="adm-input"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as ReferralPayoutMethod)}
                disabled={submitting}
                style={{ width: 'auto', minWidth: 160 }}
              >
                <option value="virement">Virement bancaire</option>
                <option value="cash">Espèces</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {error && (
              <p
                style={{
                  color: 'var(--adm-status-refusee)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--adm-r-sm)',
                  margin: '0 0 0.85rem',
                  fontSize: '0.82rem',
                }}
              >
                {error}
              </p>
            )}

            <div className="adm-modal-actions">
              <button
                type="button"
                className="adm-btn adm-btn--ghost"
                onClick={() => setShowPayModal(false)}
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="button"
                className="adm-btn adm-btn--primary"
                onClick={markPaid}
                disabled={submitting}
                autoFocus
              >
                {submitting ? 'Enregistrement…' : 'Confirmer le paiement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRevertConfirm && (
        <div
          className="adm-modal-backdrop"
          onClick={() => !submitting && setShowRevertConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="adm-referral-revert-title"
        >
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div
              className="adm-modal-icon"
              style={{
                ['--adm-modal-icon-bg' as string]: 'rgba(245, 158, 11, 0.14)',
                ['--adm-modal-icon-color' as string]: 'var(--adm-status-reportee)',
              }}
              aria-hidden="true"
            >
              <Icon name="alert-triangle" size={22} strokeWidth={2.2} />
            </div>
            <h2 id="adm-referral-revert-title" className="adm-modal-title">
              Annuler le paiement ?
            </h2>
            <p className="adm-modal-message">
              Le bonus repassera en statut <strong>À payer</strong>. La date et la méthode
              actuellement enregistrées seront effacées. Cette action est réversible.
            </p>

            {error && (
              <p
                style={{
                  color: 'var(--adm-status-refusee)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--adm-r-sm)',
                  margin: '0 0 0.85rem',
                  fontSize: '0.82rem',
                }}
              >
                {error}
              </p>
            )}

            <div className="adm-modal-actions">
              <button
                type="button"
                className="adm-btn adm-btn--ghost"
                onClick={() => setShowRevertConfirm(false)}
                disabled={submitting}
              >
                Non, garder
              </button>
              <button
                type="button"
                className="adm-btn adm-btn--danger"
                onClick={revertPaid}
                disabled={submitting}
                autoFocus
              >
                {submitting ? 'Enregistrement…' : 'Oui, annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
