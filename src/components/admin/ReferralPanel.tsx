'use client'

// Bonus partenaire du dossier (onglet Paiement de la fiche) : code saisi,
// partenaire, modele de commission, montant (projete tant que le dossier
// n'est pas solde), statut du versement ; "Marquer payé" (date et methode,
// dans un panneau) et "Annuler le paiement" (retour a "À payer", confirme).
// Montant du sejour lu dans l'etat live de la fiche (projection a jour apres
// une saisie dans la carte Paiement ou le contrat).

import { useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import ConfirmModal from './ui/ConfirmModal'
import Icon from './ui/Icon'
import Sheet from './ui/Sheet'
import { useToast } from './ui/Toast'
import { useDossier } from './dossier/DossierProvider'
import { formatNumericDate, zurichDay } from '@/lib/admin/format'
import { PARTNER_TYPE_LABEL_LONG, PAYMENT_METHOD_LABEL, PAYOUT_STATUS_LABEL, PAYOUT_STATUS_TONE } from '@/lib/admin/labels'
import type { PaymentMethod } from '@/lib/admin/types'

interface Props {
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
}

export default function ReferralPanel(props: Props) {
  const router = useRouter()
  const toast = useToast()
  const { id, live } = useDossier()
  const uid = useId()
  const [refreshing, startTransition] = useTransition()
  const [payOpen, setPayOpen] = useState(false)
  const [revertOpen, setRevertOpen] = useState(false)
  const [payDate, setPayDate] = useState('')
  const [payMethod, setPayMethod] = useState<PaymentMethod>('virement')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!props.referralCode) return null

  const statusKey = props.referralPayoutStatus ?? 'not_applicable'
  const statusLabel = PAYOUT_STATUS_LABEL[statusKey] ?? statusKey
  const statusTone = PAYOUT_STATUS_TONE[statusKey] ?? 'neutral'
  const packageAmountCents = live.packageCents
  const partner = props.referralPartnerName ?? props.referralCode

  async function patch(body: Record<string, unknown>, successMessage: string): Promise<boolean> {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/candidature/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`)
      // Rafraichissement doux (props serveur resynchronisees), sans rechargement.
      toast.show(successMessage, 'success')
      startTransition(() => router.refresh())
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  async function markPaid(e: React.FormEvent) {
    e.preventDefault()
    const ok = await patch(
      { referral_payout_status: 'paid', referral_payout_paid_at: payDate, referral_payout_method: payMethod },
      'Bonus marqué payé',
    )
    if (ok) setPayOpen(false)
  }

  async function revertPaid() {
    const ok = await patch(
      { referral_payout_status: 'due', referral_payout_paid_at: null, referral_payout_method: null },
      'Paiement du bonus annulé (repasse À payer)',
    )
    setRevertOpen(false)
    if (!ok) toast.show('Annulation du paiement impossible. Réessaie.', 'error', 5000)
  }

  const openPay = () => {
    setError(null)
    // "Aujourd'hui a Zurich" lu au clic, jamais pendant le rendu.
    setPayDate(zurichDay(new Date()))
    setPayMethod('virement')
    setPayOpen(true)
  }

  const partnerTypeLabel = props.referralPartnerType
    ? PARTNER_TYPE_LABEL_LONG[props.referralPartnerType] ?? props.referralPartnerType
    : null
  const methodLabel = props.referralPayoutMethod
    ? PAYMENT_METHOD_LABEL[props.referralPayoutMethod as PaymentMethod] ?? props.referralPayoutMethod
    : null
  const projection =
    props.referralBonusEur === null
    && props.referralCommissionType === 'percent'
    && props.referralCommissionPct
    && packageAmountCents
    && packageAmountCents > 0
      ? Math.round((props.referralCommissionPct * packageAmountCents) / 10000)
      : null

  return (
    <section className="adm-card" aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} className="adm-card-title">
        <Icon name="handshake" size={14} />
        Bonus partenaire
      </h2>

      <dl className="adm-defs adm-dossier-defs">
        <div className="adm-def">
          <dt className="adm-def-key">Code saisi</dt>
          <dd className="adm-def-val adm-dossier-code">
            <span className="adm-mono">{props.referralCode}</span>
            {props.referralCodeValid === true && (
              <span className="adm-tone-text adm-tone--ok">
                <Icon name="check" size={16} />
                <span>Valide</span>
              </span>
            )}
            {props.referralCodeValid === false && (
              <span className="adm-tone-text adm-tone--danger">
                <Icon name="alert-triangle" size={16} />
                <span>Non reconnu</span>
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
                : <span className="adm-def-val--muted">Non renseigné</span>}
          </dd>
        </div>

        <div className="adm-def">
          <dt className="adm-def-key">Commission</dt>
          <dd className="adm-def-val">
            {props.referralBonusEur !== null ? (
              <strong>{props.referralBonusEur} €</strong>
            ) : projection !== null ? (
              // CA connu mais commission pas encore due : projection (figee
              // automatiquement au passage en Soldee).
              <span>
                ~{projection} € <span className="adm-muted adm-small">estimée, figée à la soldée</span>
              </span>
            ) : props.referralCommissionType === 'percent' ? (
              <span className="adm-tone-text adm-tone--warn">
                <Icon name="alert-triangle" size={16} />
                <span>CA à saisir pour calculer la commission</span>
              </span>
            ) : (
              <span className="adm-def-val--muted">Non renseignée</span>
            )}
            {props.referralCommissionType === 'percent'
              && props.referralBonusEur !== null
              && packageAmountCents
              && packageAmountCents > 0 && (
              <span className="adm-muted adm-small">
                {' '}({props.referralCommissionPct} % × {Math.round(packageAmountCents / 100)} €)
              </span>
            )}
          </dd>
        </div>

        <div className="adm-def">
          <dt className="adm-def-key">Versement</dt>
          <dd className="adm-def-val">
            <span className={`adm-status adm-tone--${statusTone}`}>
              <span className="adm-status-dot" aria-hidden="true" />
              {statusLabel}
            </span>
          </dd>
        </div>

        {props.referralPayoutStatus === 'paid' && (
          <div className="adm-def">
            <dt className="adm-def-key">Payé le</dt>
            <dd className="adm-def-val">
              {props.referralPayoutPaidAt ? formatNumericDate(props.referralPayoutPaidAt) : 'Non renseigné'}
              {methodLabel && <span className="adm-muted"> · {methodLabel}</span>}
            </dd>
          </div>
        )}
      </dl>

      {props.referralPayoutStatus === 'due' && (
        <div className="adm-btn-row adm-dossier-card-actions">
          <Button variant="primary" icon="receipt" onClick={openPay}>
            Marquer payé
          </Button>
        </div>
      )}
      {props.referralPayoutStatus === 'paid' && (
        <div className="adm-btn-row adm-dossier-card-actions">
          <Button loading={submitting || refreshing} onClick={() => setRevertOpen(true)}>
            Annuler le paiement
          </Button>
        </div>
      )}

      {props.referralPayoutStatus === 'pending' && (
        <p className="adm-dossier-text adm-dossier-card-actions">
          Le bonus passera automatiquement à <strong>À payer</strong> quand la candidature sera soldée.
        </p>
      )}
      {props.referralPayoutStatus === 'cancelled' && (
        <p className="adm-dossier-text adm-dossier-card-actions">
          Bonus annulé (candidature refusée ou annulée). Aucun versement ne sera effectué.
        </p>
      )}

      <Sheet open={payOpen} onClose={() => !submitting && setPayOpen(false)} title="Marquer le bonus comme payé" autoFocusBody={false}>
        <form className="adm-dossier-payform" onSubmit={markPaid}>
          <p className="adm-dossier-text">
            Bonus de <strong>{props.referralBonusEur ?? 'montant non renseigné'} €</strong> pour <strong>{partner}</strong>.
            Confirme la date et la méthode du versement.
          </p>
          <div className="adm-dossier-payform-row">
            <div className="adm-field">
              <label htmlFor={`${uid}-date`} className="adm-field-label">
                Date du paiement
              </label>
              <input
                id={`${uid}-date`}
                type="date"
                className="adm-input"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            <div className="adm-field">
              <label htmlFor={`${uid}-method`} className="adm-field-label">
                Méthode
              </label>
              <select
                id={`${uid}-method`}
                className="adm-select"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                disabled={submitting}
              >
                <option value="virement">Virement bancaire</option>
                <option value="cash">Espèces</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          {error && <p className="adm-field-error" role="alert">{error}</p>}
          <div className="adm-modal-actions">
            <Button onClick={() => setPayOpen(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" icon="receipt" loading={submitting}>
              Confirmer le paiement
            </Button>
          </div>
        </form>
      </Sheet>

      <ConfirmModal
        open={revertOpen}
        title={'Annuler le paiement\u00a0?'}
        message={`Le bonus repassera en statut « À payer ». La date et la méthode actuellement enregistrées seront effacées. Cette action est réversible.${error ? `\n\n${error}` : ''}`}
        confirmLabel="Oui, annuler"
        cancelLabel="Non, garder"
        variant="warning"
        icon="alert-triangle"
        confirmIcon="rotate-ccw"
        onConfirm={() => void revertPaid()}
        onCancel={() => setRevertOpen(false)}
      />
    </section>
  )
}
