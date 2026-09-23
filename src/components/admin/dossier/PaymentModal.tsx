'use client'

// Fenetre "Enregistrer un paiement" (spec 6.3), rendue par DossierProvider :
// montant recu (pre-rempli avec le montant du sejour), methode (virement par
// defaut), date de reception (aujourd'hui a Zurich, lue a l'ouverture), case
// "Passer le dossier en Soldee" (cochee et visible quand la transition est
// permise). Un seul PATCH existant (planPayment), etat optimiste et retour
// arriere en cas d'erreur ; la fenetre reste ouverte si l'envoi echoue.
// Panneau bas sous 640 px ; a l'ouverture, le focus va au panneau (titre
// relie), pas au premier champ : le clavier du telephone ne couvre pas le
// formulaire.

import { useId, useRef, useState } from 'react'
import Button from '@/components/admin/ui/Button'
import Sheet from '@/components/admin/ui/Sheet'
import { useDossier } from './DossierProvider'
import { PAYMENT_METHOD_OPTIONS, canMarkSoldee, centsToInput, planPayment } from '@/lib/admin/dossier'
import type { PaymentMethod } from '@/lib/admin/types'

export interface PaymentModalProps {
  /** Jour de reception propose (YYYY-MM-DD, Zurich), lu a l'ouverture. */
  today: string
  onClose: () => void
}

export default function PaymentModal({ today, onClose }: PaymentModalProps) {
  const { live, patch } = useDossier()
  const uid = useId()
  const amountRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  // Etat de depart pris une fois a l'ouverture (la fenetre est remontee a chaque ouverture).
  const [soldeeAllowed] = useState(() => canMarkSoldee(live.status))
  const [amount, setAmount] = useState(() => centsToInput(live.packageCents))
  const [method, setMethod] = useState<PaymentMethod>(() => live.paymentMethod ?? 'virement')
  const [date, setDate] = useState(today)
  const [toSoldee, setToSoldee] = useState(soldeeAllowed)
  const [error, setError] = useState<{ field: 'amount' | 'date'; message: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const ids = {
    amount: `${uid}-amount`, amountHelp: `${uid}-amount-help`, method: `${uid}-method`,
    date: `${uid}-date`, error: `${uid}-error`,
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const plan = planPayment({ amount, method, date, toSoldee }, live, new Date().toISOString())
    if (!plan.ok) {
      setError({ field: plan.field, message: plan.error })
      ;(plan.field === 'amount' ? amountRef : dateRef).current?.focus()
      return
    }
    setError(null)
    setSubmitting(true)
    const ok = await patch(plan.body, { success: plan.success, optimistic: plan.optimistic, rollback: plan.rollback })
    setSubmitting(false)
    if (ok) onClose()
  }

  const fieldError = (field: 'amount' | 'date') =>
    error?.field === field ? (
      <p id={ids.error} className="adm-field-error">
        {error.message}
      </p>
    ) : null

  return (
    <Sheet open onClose={onClose} title="Enregistrer un paiement" autoFocusBody={false}>
      <form className="adm-dossier-payform" onSubmit={submit} noValidate>
        <div className="adm-field">
          <label htmlFor={ids.amount} className="adm-field-label">
            Montant reçu (€)
          </label>
          <input
            ref={amountRef}
            id={ids.amount}
            className="adm-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="2900"
            aria-invalid={error?.field === 'amount' || undefined}
            aria-describedby={error?.field === 'amount' ? `${ids.error} ${ids.amountHelp}` : ids.amountHelp}
          />
          <p id={ids.amountHelp} className="adm-field-help">
            Montant du séjour, modifiable s’il a changé. Vide : le montant enregistré est conservé.
          </p>
          {fieldError('amount')}
        </div>

        <div className="adm-dossier-payform-row">
          <div className="adm-field">
            <label htmlFor={ids.method} className="adm-field-label">
              Méthode
            </label>
            <select
              id={ids.method}
              className="adm-select"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="adm-field">
            <label htmlFor={ids.date} className="adm-field-label">
              Date de réception
            </label>
            <input
              ref={dateRef}
              id={ids.date}
              className="adm-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={error?.field === 'date' || undefined}
              aria-describedby={error?.field === 'date' ? ids.error : undefined}
            />
            {fieldError('date')}
          </div>
        </div>

        {soldeeAllowed && (
          <label className="adm-check">
            <input type="checkbox" checked={toSoldee} onChange={(e) => setToSoldee(e.target.checked)} />
            Passer le dossier en Soldée
          </label>
        )}

        <div className="adm-modal-actions">
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" icon="receipt" loading={submitting}>
            Enregistrer le paiement
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
