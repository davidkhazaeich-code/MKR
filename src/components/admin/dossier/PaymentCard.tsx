'use client'

// Carte Paiement unique (spec 6.3, onglet Paiement, ancre #paiement-carte) :
// reste a payer (grand chiffre, "Soldé" ou "Montant à définir"), barre
// d'encaissement, echeance du contrat, puis les champs un par un, chacun
// enregistre par le PATCH existant avec etat optimiste et retour arriere :
// montant du sejour (bouton "Enregistrer" ou Entree), methode, date de
// reception (enregistree apres une courte pause de saisie ou en quittant le
// champ), interrupteur "Paiement reçu". "Enregistrer un paiement" ouvre la
// fenetre qui fait tout en une fois. En pied : rappels de paiement et infos
// pre-depart envoyes par les automatisations.

import { useEffect, useId, useRef, useState } from 'react'
import Button from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import Switch from '@/components/admin/ui/Switch'
import { useDossier } from './DossierProvider'
import { PAYMENT_METHOD_OPTIONS, centsToInput, parseEuros, paymentSummary, remindersLine } from '@/lib/admin/dossier'
import { formatDateTime, formatEuros, formatNumericDate } from '@/lib/admin/format'
import { PAYMENT_METHOD_LABEL } from '@/lib/admin/labels'
import { ADMIN_SOLO_DUO_HINT } from '@/lib/pricing-copy'
import type { PaymentMethod } from '@/lib/admin/types'

const DATE_SAVE_DELAY_MS = 800
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export interface PaymentCardProps {
  paymentReminderCount: number | null
  paymentReminderSentAt: string | null
  predepartureSentAt: string | null
}

type Field = 'amount' | 'method' | 'date' | 'paid'

export default function PaymentCard({ paymentReminderCount, paymentReminderSentAt, predepartureSentAt }: PaymentCardProps) {
  const { live, patch, openPayment, now } = useDossier()
  const uid = useId()
  const summary = paymentSummary(live, now)
  const [saving, setSaving] = useState<Field | null>(null)

  // Montant et date : brouillons locaux, sans etat optimiste (un echec garde
  // la saisie pour reessayer). Recales sur live quand live change (contrat,
  // fenetre de paiement, enregistrement reussi) si le brouillon n'etait pas
  // modifie ou s'il vient d'etre enregistre.
  const [amount, setAmount] = useState(() => centsToInput(live.packageCents))
  const [amountError, setAmountError] = useState<string | null>(null)
  const [seenCents, setSeenCents] = useState(live.packageCents)
  const parsed = parseEuros(amount)
  const amountDirty = !parsed.ok || parsed.cents !== live.packageCents
  if (seenCents !== live.packageCents) {
    const untouched = parsed.ok && parsed.cents === seenCents
    setSeenCents(live.packageCents)
    if (untouched || saving === 'amount') setAmount(centsToInput(live.packageCents))
  }

  const [date, setDate] = useState(live.paymentDate ?? '')
  const [seenDate, setSeenDate] = useState(live.paymentDate)
  const dateTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  if (seenDate !== live.paymentDate) {
    const untouched = date === (seenDate ?? '')
    setSeenDate(live.paymentDate)
    if (untouched || saving === 'date') setDate(live.paymentDate ?? '')
  }
  // Valeur enregistree la plus recente (le minuteur de la date part d'un rendu anterieur).
  const savedDate = useRef(live.paymentDate)
  const sendingDate = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    savedDate.current = live.paymentDate
  })
  useEffect(() => () => {
    if (dateTimer.current) clearTimeout(dateTimer.current)
  }, [])

  const save = async (field: Field, body: Record<string, unknown>, opts: Parameters<typeof patch>[1]) => {
    setSaving(field)
    await patch(body, opts)
    setSaving((current) => (current === field ? null : current))
  }

  const saveAmount = () => {
    if (!parsed.ok) {
      setAmountError('Montant invalide : un nombre en euros, par exemple 2900 ou 2900,50.')
      return
    }
    setAmountError(null)
    if (parsed.cents === live.packageCents) return
    // Vide : l'ancienne carte refusait d'effacer le montant ; on garde la meme regle.
    if (parsed.cents === null) {
      setAmountError('Indique un montant, ou laisse le montant actuel.')
      return
    }
    void save('amount', { package_amount_cents: parsed.cents }, {
      success: `Montant du séjour : ${formatEuros(parsed.cents)}`,
    })
  }

  const saveMethod = (value: string) => {
    const next = value === '' ? null : (value as PaymentMethod)
    void save('method', { payment_method: next }, {
      success: next ? `Méthode : ${PAYMENT_METHOD_LABEL[next]}` : 'Méthode effacée',
      optimistic: { paymentMethod: next },
      rollback: { paymentMethod: live.paymentMethod },
    })
  }

  const commitDate = (value: string) => {
    if (dateTimer.current) clearTimeout(dateTimer.current)
    dateTimer.current = null
    const next = value === '' ? null : value
    // Deja enregistree, ou en cours d'envoi (pause de saisie puis sortie du champ).
    if (next === savedDate.current || next === sendingDate.current) return
    if (next !== null && !DATE_ONLY.test(next)) return
    sendingDate.current = next
    void save('date', { payment_date: next }, {
      success: next ? `Date de réception : ${formatNumericDate(next)}` : 'Date effacée',
    }).finally(() => {
      sendingDate.current = undefined
    })
  }

  const onDateChange = (value: string) => {
    setDate(value)
    if (dateTimer.current) clearTimeout(dateTimer.current)
    dateTimer.current = setTimeout(() => commitDate(value), DATE_SAVE_DELAY_MS)
  }

  const togglePaid = (checked: boolean) => {
    void save('paid', { package_paid: checked }, {
      success: checked ? 'Paiement marqué reçu' : 'Paiement remis à « non reçu »',
      optimistic: { packagePaidAt: checked ? new Date().toISOString() : null },
      rollback: { packagePaidAt: live.packagePaidAt },
    })
  }

  const ids = { amount: `${uid}-amount`, amountHelp: `${uid}-amount-help`, amountError: `${uid}-amount-error`, method: `${uid}-method`, date: `${uid}-date` }
  const paidHelp = live.packagePaidAt
    ? `Reçu le ${formatDateTime(live.packagePaidAt)}${live.paymentMethod ? ` · ${PAYMENT_METHOD_LABEL[live.paymentMethod]}` : ''}`
    : 'À activer quand le paiement est confirmé.'

  return (
    <section id="paiement-carte" className="adm-card adm-dossier-anchor" tabIndex={-1} aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} className="adm-card-title">
        <Icon name="euro" size={14} />
        Paiement
      </h2>

      <div className={`adm-dossier-pay adm-tone--${summary.tone}`}>
        <p className="adm-label">{summary.label}</p>
        <p className={`adm-kpi adm-dossier-pay-amount${summary.state === 'unknown' ? ' adm-dossier-pay-amount--muted' : ''}`}>
          {summary.state === 'paid' && <Icon name="check" size={30} strokeWidth={2.5} />}
          {summary.headline}
        </p>
        <div
          className="adm-meter"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={summary.progress}
          aria-label={`Encaissé : ${summary.progress} %`}
        >
          <div className="adm-meter-fill" style={{ width: `${summary.progress}%` }} />
        </div>
        {summary.deadline && (
          <p className={`adm-dossier-pay-deadline adm-tone--${summary.deadline.tone}`}>{summary.deadline.text}</p>
        )}
      </div>

      <div className="adm-input-row">
        <label className="adm-input-row-label" htmlFor={ids.amount}>
          Montant du séjour (€)
          <span id={ids.amountHelp} className="adm-field-help adm-dossier-row-help">
            Montant unique du dossier : contrat, suivi du paiement et commissions partenaire. Pré-rempli depuis
            la grille ; référence adulte Solo ou Duo : {ADMIN_SOLO_DUO_HINT}. Vide : sur devis.
          </span>
        </label>
        <div className="adm-dossier-amount">
          <input
            id={ids.amount}
            className="adm-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            placeholder="Sur devis"
            onChange={(e) => {
              setAmount(e.target.value)
              setAmountError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                saveAmount()
              }
            }}
            aria-invalid={amountError ? true : undefined}
            aria-describedby={amountError ? `${ids.amountError} ${ids.amountHelp}` : ids.amountHelp}
          />
          {amountDirty && (
            <Button size="sm" loading={saving === 'amount'} onClick={saveAmount}>
              Enregistrer
            </Button>
          )}
        </div>
        {amountError && (
          <p id={ids.amountError} className="adm-field-error adm-dossier-row-error">
            {amountError}
          </p>
        )}
      </div>

      <div className="adm-input-row">
        <label className="adm-input-row-label" htmlFor={ids.method}>
          Méthode de paiement
        </label>
        <select
          id={ids.method}
          className="adm-select"
          value={live.paymentMethod ?? ''}
          disabled={saving === 'method'}
          onChange={(e) => saveMethod(e.target.value)}
        >
          <option value="">Non renseignée</option>
          {PAYMENT_METHOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="adm-input-row">
        <label className="adm-input-row-label" htmlFor={ids.date}>
          Date de réception
        </label>
        <input
          id={ids.date}
          className="adm-input"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          onBlur={(e) => commitDate(e.target.value)}
        />
      </div>

      <Switch
        checked={!!live.packagePaidAt}
        onChange={togglePaid}
        disabled={saving === 'paid'}
        label="Paiement reçu"
        help={paidHelp}
      />

      <div className="adm-btn-row adm-dossier-card-actions">
        <Button onClick={openPayment}>Enregistrer un paiement</Button>
      </div>

      <dl className="adm-defs adm-dossier-defs adm-dossier-auto">
        <div className="adm-def">
          <dt className="adm-def-key">Rappels de paiement</dt>
          <dd className={`adm-def-val${(paymentReminderCount ?? 0) > 0 ? '' : ' adm-def-val--muted'}`}>
            {remindersLine(paymentReminderCount, paymentReminderSentAt)}
          </dd>
        </div>
        <div className="adm-def">
          <dt className="adm-def-key">Infos pré-départ</dt>
          <dd className={`adm-def-val${predepartureSentAt ? '' : ' adm-def-val--muted'}`}>
            {predepartureSentAt ? `Envoyées le ${formatNumericDate(predepartureSentAt)}` : 'Pas encore envoyées'}
          </dd>
        </div>
      </dl>
    </section>
  )
}
