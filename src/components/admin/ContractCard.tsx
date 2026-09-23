'use client'

/**
 * Carte "Contrat" de la fiche dossier (onglet Paiement, ancre #contrat).
 *
 * Workflow : Ruslan valide le dossier -> remplit/ajuste les champs (pre-remplis
 * depuis la demande) -> "Enregistrer" (attribue le n de contrat) ->
 * "Previsualiser" (PDF filigrane, nouvel onglet, save-then-open) ->
 * "Envoyer" (modale de confirmation) -> email candidat + copie bcc +
 * archive Storage. Renvoi possible (vN).
 *
 * Enregistrement EXPLICITE (pas d'auto-save) : document contractuel.
 * Les garde-fous UI sont un miroir de ceux du serveur (source d'autorite).
 *
 * DossierContractCard : la meme carte branchee sur l'etat live de la fiche
 * (statut et montant live ; montant, echeance et envoi remontes a la fiche).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
  DEFAULT_EXCLUSIONS,
  DEFAULT_INCLUSIONS,
  formatContractNumber,
  formatEurCents,
  isRibConfigured,
  type ContractLocale,
} from '@/data/contract'
import { sessionFromId } from '@/data/sessions'
import type { Status } from '@/lib/admin-transitions'
import Button from './ui/Button'
import ConfirmModal from './ui/ConfirmModal'
import Icon from './ui/Icon'
import { useToast } from './ui/Toast'
import { useDossier } from './dossier/DossierProvider'
import { formatDateTime } from '@/lib/admin/format'

export interface ContractCardProps {
  candidatureId: string
  /** Statut LIVE (etat de la fiche, pas la prop serveur). */
  status: Status
  /** Montant LIVE (etat de la fiche). */
  packageAmountCents: number | null
  /**
   * Callback quand le montant est modifie + enregistre depuis CETTE carte,
   * pour resynchroniser la carte Paiement sans attendre le router.refresh.
   * Source unique : package_amount_cents.
   */
  onAmountSaved?: (cents: number) => void
  /** Champs enregistres (echeance telle que renvoyee par le serveur). */
  onSaved?: (saved: { contractPaymentDeadline: string | null }) => void
  /** Contrat envoye (la fiche passe a l'etape paiement). */
  onSent?: (sent: { contractSentAt: string; contractPaymentDeadline: string | null }) => void
  candidateEmail: string | null
  submissionLanguage: 'fr' | 'en'
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
  busyExternal?: boolean
}

const SENDABLE_STATUSES: Status[] = ['validee', 'soldee']

// Espace insecable avant la ponctuation haute (typographie francaise).
const NBSP = '\u00a0'

/* ----------------- Helpers dates (date-only, UTC, zero dependance) ----------------- */

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDateFr(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

/** Fin suggeree : fin de session officielle si duree pleine, sinon debut + N semaines. */
function suggestEnd(start: string, weeks: number | null, sessionId: string | null): string {
  if (!start || !weeks) return ''
  const session = sessionFromId(sessionId)
  if (session && session.startDate === start) {
    const sessionDays = Math.round(
      (new Date(`${session.endDate}T00:00:00Z`).getTime() - new Date(`${session.startDate}T00:00:00Z`).getTime()) /
        86400000,
    )
    if (weeks * 7 >= sessionDays) return session.endDate
  }
  return addDaysIso(start, weeks * 7)
}

function isDefaultList(value: string, kind: 'inc' | 'exc'): boolean {
  const defaults = kind === 'inc' ? DEFAULT_INCLUSIONS : DEFAULT_EXCLUSIONS
  return value.trim() === '' || value === defaults.fr || value === defaults.en
}

/* ----------------------------------- Composant ----------------------------------- */

export default function ContractCard(props: ContractCardProps) {
  const toast = useToast()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const ribOk = isRibConfigured()

  // Pre-remplissage : valeur DB sinon derivee de la demande.
  const initialLocale: ContractLocale = props.contractLocale ?? props.submissionLanguage
  const session = sessionFromId(props.sessionId)
  const initialStart = props.contractStartDate ?? session?.startDate ?? props.dateDebutSouhaitee ?? ''
  const initialWeeks = props.contractDurationWeeks ?? props.dureeSemaines ?? null
  const initialEnd =
    props.contractEndDate ?? (initialStart && initialWeeks ? suggestEnd(initialStart, initialWeeks, props.sessionId) : '')
  const initialDeadline =
    props.contractPaymentDeadline ??
    (initialStart && addDaysIso(todayIso(), 14) > initialStart ? initialStart : addDaysIso(todayIso(), 14))

  const [locale, setLocale] = useState<ContractLocale>(initialLocale)
  const [start, setStart] = useState(initialStart)
  const [end, setEnd] = useState(initialEnd)
  const [weeks, setWeeks] = useState<string>(initialWeeks ? String(initialWeeks) : '')
  const [deadline, setDeadline] = useState(initialDeadline)
  const [inclusions, setInclusions] = useState(props.contractInclusions ?? DEFAULT_INCLUSIONS[initialLocale])
  const [exclusions, setExclusions] = useState(props.contractExclusions ?? DEFAULT_EXCLUSIONS[initialLocale])
  const [note, setNote] = useState(props.contractNote ?? '')

  // Montant du sejour : MEME champ que la carte Paiement (package_amount_cents,
  // source unique : suivi paiement, commissions referral % et contrat restent
  // coherents). Draft local, resynchronise depuis la prop tant que non touche
  // (edition possible depuis la carte Paiement en parallele).
  const [amountEur, setAmountEur] = useState(
    props.packageAmountCents ? String(props.packageAmountCents / 100) : '',
  )
  const [amountTouched, setAmountTouched] = useState(false)
  useEffect(() => {
    if (!amountTouched) {
      setAmountEur(props.packageAmountCents ? String(props.packageAmountCents / 100) : '')
    }
  }, [props.packageAmountCents, amountTouched])

  const amountDraftCents =
    amountEur.trim() === '' ? null : Math.round(parseFloat(amountEur) * 100)
  const amountDraftValid = amountDraftCents !== null && Number.isFinite(amountDraftCents) && amountDraftCents > 0
  /** Montant effectif pour les garde-fous UI et le recap : draft si touche, sinon la valeur live. */
  const effectiveAmountCents = amountTouched
    ? (amountDraftValid ? amountDraftCents : null)
    : props.packageAmountCents
  const amountDirty = amountTouched && amountDraftCents !== props.packageAmountCents

  // Fin auto-liee tant que Ruslan ne l'a pas editee a la main.
  const autoEndRef = useRef<string>(props.contractEndDate ? '' : initialEnd)

  // Snapshot persiste (pour dirty). Mis a jour apres chaque save reussi.
  const [saved, setSaved] = useState(() => ({
    locale: props.contractLocale,
    start: props.contractStartDate,
    end: props.contractEndDate,
    weeks: props.contractDurationWeeks,
    deadline: props.contractPaymentDeadline,
    inclusions: props.contractInclusions,
    exclusions: props.contractExclusions,
    note: props.contractNote,
  }))

  const [number, setNumber] = useState<number | null>(props.contractNumber)
  const [sentAt, setSentAt] = useState<string | null>(props.contractSentAt)
  const [sentCount, setSentCount] = useState<number>(props.contractSentCount)
  const [pdfPath, setPdfPath] = useState<string | null>(props.contractPdfPath)

  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const weeksNum = weeks === '' ? null : parseInt(weeks, 10)

  // Dirty = different du dernier etat PERSISTE. Avant le premier save, les
  // pre-remplissages rendent la carte dirty : voulu (rien n'est en DB).
  const dirty =
    locale !== (saved.locale ?? '') ||
    start !== (saved.start ?? '') ||
    end !== (saved.end ?? '') ||
    weeksNum !== (saved.weeks ?? null) ||
    deadline !== (saved.deadline ?? '') ||
    inclusions !== (saved.inclusions ?? '') ||
    exclusions !== (saved.exclusions ?? '') ||
    note !== (saved.note ?? '') ||
    amountDirty

  const neverSaved = number === null

  /* ----------------------- Garde-fous (miroir serveur) ----------------------- */

  const fieldBlockers = useMemo(() => {
    const list: string[] = []
    if (!start || !end) list.push('Dates du séjour (début et fin)')
    else if (end < start) list.push('La date de fin précède le début')
    if (!weeksNum || weeksNum < 1 || weeksNum > 12) list.push('Durée (1 à 12 semaines)')
    if (!effectiveAmountCents || effectiveAmountCents <= 0)
      list.push('Montant du séjour manquant ou invalide (« sur devis » bloqué) : saisis-le dans le champ Montant')
    if (!deadline) list.push('Échéance de paiement')
    else if (start && deadline > start) list.push('Échéance après le début du camp')
    return list
  }, [start, end, weeksNum, deadline, effectiveAmountCents])

  const sendBlockers = useMemo(() => {
    const list: string[] = []
    if (!SENDABLE_STATUSES.includes(props.status)) list.push('Le dossier doit être Validée ou Soldée')
    if (!props.candidateEmail) list.push('Email du candidat manquant')
    if (!ribOk) list.push('IBAN à renseigner dans src/data/contract.ts')
    return list
  }, [props.status, props.candidateEmail, ribOk])

  const canPreview = fieldBlockers.length === 0 && !busy && !props.busyExternal

  /* --------------------------------- Handlers --------------------------------- */

  const handleLocaleChange = (next: ContractLocale) => {
    setLocale(next)
    // Listes non modifiees -> on bascule les defauts dans la nouvelle langue.
    if (isDefaultList(inclusions, 'inc')) setInclusions(DEFAULT_INCLUSIONS[next])
    if (isDefaultList(exclusions, 'exc')) setExclusions(DEFAULT_EXCLUSIONS[next])
  }

  const maybeAutoEnd = (nextStart: string, nextWeeks: string) => {
    const w = nextWeeks === '' ? null : parseInt(nextWeeks, 10)
    const suggestion = nextStart && w ? suggestEnd(nextStart, w, props.sessionId) : ''
    if (end === autoEndRef.current || end === '') {
      setEnd(suggestion)
      autoEndRef.current = suggestion
    }
  }

  const save = async (): Promise<boolean> => {
    // Montant touche mais invalide : on refuse d'enregistrer plutot que
    // d'ignorer silencieusement la saisie de Ruslan.
    if (amountTouched && amountEur.trim() !== '' && !amountDraftValid) {
      toast.show('Montant du séjour invalide (doit être supérieur à 0)', 'error')
      return false
    }
    const sendAmount = amountDirty && amountDraftValid
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/candidature/${props.candidatureId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_locale: locale,
          contract_start_date: start || null,
          contract_end_date: end || null,
          contract_duration_weeks: weeksNum,
          contract_payment_deadline: deadline || null,
          contract_inclusions: inclusions,
          contract_exclusions: exclusions,
          contract_note: note,
          // Meme champ que la carte Paiement : audit package_amount_change +
          // recalcul des commissions % geres par le PATCH existant.
          ...(sendAmount ? { package_amount_cents: amountDraftCents } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.show(data.error || 'Enregistrement du contrat échoué', 'error')
        return false
      }
      if (data.candidature?.contract_number) setNumber(data.candidature.contract_number)
      setSaved({
        locale,
        start: start || null,
        end: end || null,
        weeks: weeksNum,
        deadline: deadline || null,
        inclusions,
        exclusions,
        note,
      })
      if (sendAmount && amountDraftCents !== null) {
        props.onAmountSaved?.(amountDraftCents)
        setAmountTouched(false) // re-liaison sur la prop (desormais a jour)
      }
      props.onSaved?.({
        contractPaymentDeadline:
          data.candidature && 'contract_payment_deadline' in data.candidature
            ? data.candidature.contract_payment_deadline
            : deadline || null,
      })
      startTransition(() => router.refresh())
      return true
    } catch {
      toast.show('Connexion impossible. Vérifie ton réseau.', 'error')
      return false
    } finally {
      setBusy(false)
    }
  }

  const handleSave = async () => {
    const ok = await save()
    if (ok) toast.show('Infos contrat enregistrées', 'success')
  }

  // Save-then-open : onglet ouvert de maniere synchrone (anti popup-blocker),
  // pointe vers l'apercu une fois l'etat persiste.
  const handlePreview = async () => {
    const url = `/api/admin/candidature/${props.candidatureId}/contract/preview`
    if (!dirty && !neverSaved) {
      window.open(url, '_blank', 'noopener')
      return
    }
    const win = window.open('about:blank', '_blank')
    const ok = await save()
    if (ok && win) {
      win.location.href = url
    } else {
      win?.close()
    }
  }

  const handleSend = async () => {
    setBusy(true)
    try {
      if (dirty || neverSaved) {
        const ok = await save()
        if (!ok) return
      }
      const res = await fetch(`/api/admin/candidature/${props.candidatureId}/contract/send`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        toast.show(data.error || 'Envoi du contrat échoué', 'error')
        return
      }
      const c = data.contract ?? {}
      const nextSentAt: string = c.contract_sent_at ?? new Date().toISOString()
      setSentAt(nextSentAt)
      setSentCount(c.contract_sent_count ?? sentCount + 1)
      setPdfPath(c.contract_pdf_path ?? pdfPath)
      if (c.contract_number) setNumber(c.contract_number)
      props.onSent?.({ contractSentAt: nextSentAt, contractPaymentDeadline: deadline || null })
      toast.show(`Contrat envoyé à ${props.candidateEmail}`, 'success')
      startTransition(() => router.refresh())
    } catch {
      toast.show('Connexion impossible. Vérifie ton réseau.', 'error')
    } finally {
      setBusy(false)
    }
  }

  /* ----------------------------------- Rendu ----------------------------------- */

  const displayNumber = number !== null ? formatContractNumber(number, new Date().getFullYear()) : null
  const amountLabel =
    effectiveAmountCents && effectiveAmountCents > 0
      ? formatEurCents(effectiveAmountCents, 'fr')
      : null
  const isResend = sentCount > 0

  // Dossier pas encore actionnable et jamais de contrat : etat compact.
  if (!SENDABLE_STATUSES.includes(props.status) && !sentAt) {
    return (
      <section id="contrat" className="adm-card adm-dossier-anchor" tabIndex={-1} aria-labelledby="adm-contrat-title">
        <h2 id="adm-contrat-title" className="adm-card-title">
          <Icon name="file-text" size={14} />
          Contrat
        </h2>
        <p className="adm-action-empty">
          {props.status === 'recue'
            ? 'Valide la candidature pour préparer et envoyer le contrat.'
            : 'Contrat disponible uniquement sur un dossier validé ou soldé.'}
        </p>
      </section>
    )
  }

  const inputsDisabled = busy || props.busyExternal || !SENDABLE_STATUSES.includes(props.status)
  const blockers = [...fieldBlockers, ...sendBlockers]

  return (
    <section id="contrat" className="adm-card adm-dossier-anchor" tabIndex={-1} aria-labelledby="adm-contrat-title">
      <div className="adm-card-header">
        <h2 id="adm-contrat-title" className="adm-card-title">
          <Icon name="file-text" size={14} />
          Contrat
        </h2>
        {displayNumber && <span className="adm-dossier-card-aside adm-mono">{displayNumber}</span>}
      </div>

      {/* Etat envoi */}
      {sentAt && (
        <p className="adm-dossier-note adm-tone--ok">
          <Icon name="check-circle" size={16} />
          <span>
            <strong>Contrat envoyé le {formatDateTime(sentAt)}</strong> ({sentCount} envoi{sentCount > 1 ? 's' : ''})
            {pdfPath && (
              <>
                {' · '}
                <a
                  href={`/api/admin/candidature/${props.candidatureId}/contract/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-link"
                >
                  Voir le PDF envoyé
                </a>
              </>
            )}
          </span>
        </p>
      )}

      {/* Langue */}
      <div className="adm-input-row">
        <label className="adm-input-row-label" htmlFor="contract-locale">
          Langue du contrat
          <span className="adm-field-help adm-dossier-row-help">
            PDF et email. Pré-réglée sur la langue d’inscription du candidat ({props.submissionLanguage.toUpperCase()}).
          </span>
        </label>
        <select
          id="contract-locale"
          className="adm-select"
          value={locale}
          onChange={(e) => handleLocaleChange(e.target.value as ContractLocale)}
          disabled={inputsDisabled}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Dates + duree */}
      <div className="adm-input-row">
        <label className="adm-input-row-label" htmlFor="contract-start">
          Début du séjour
        </label>
        <input
          id="contract-start"
          type="date"
          className="adm-input"
          value={start}
          onChange={(e) => {
            setStart(e.target.value)
            maybeAutoEnd(e.target.value, weeks)
          }}
          disabled={inputsDisabled}
        />
      </div>
      <div className="adm-input-row">
        <label className="adm-input-row-label" htmlFor="contract-weeks">
          Durée (semaines)
        </label>
        <input
          id="contract-weeks"
          type="number"
          min={1}
          max={12}
          step={1}
          className="adm-input"
          value={weeks}
          onChange={(e) => {
            setWeeks(e.target.value)
            maybeAutoEnd(start, e.target.value)
          }}
          disabled={inputsDisabled}
        />
      </div>
      <div className="adm-input-row">
        <label className="adm-input-row-label" htmlFor="contract-end">
          Fin du séjour
          <span className="adm-field-help adm-dossier-row-help">
            Calculée depuis le début et la durée (fin de session officielle si durée pleine). Modifiable.
          </span>
        </label>
        <input
          id="contract-end"
          type="date"
          className="adm-input"
          value={end}
          onChange={(e) => {
            setEnd(e.target.value)
            autoEndRef.current = '' // edition manuelle : on coupe le lien auto
          }}
          disabled={inputsDisabled}
        />
      </div>
      <div className="adm-input-row">
        <label className="adm-input-row-label" htmlFor="contract-amount">
          Montant du séjour (€)
          <span className="adm-field-help adm-dossier-row-help">
            Montant unique du dossier : contrat, suivi du paiement et commissions partenaire. Repris de la carte
            Paiement, modifiable ici.
          </span>
        </label>
        <input
          id="contract-amount"
          type="number"
          step="0.01"
          min="0"
          className="adm-input"
          value={amountEur}
          onChange={(e) => {
            setAmountEur(e.target.value)
            setAmountTouched(true)
          }}
          placeholder="2900"
          disabled={inputsDisabled}
        />
      </div>
      <div className="adm-input-row">
        <label className="adm-input-row-label" htmlFor="contract-deadline">
          Échéance de paiement
          <span className="adm-field-help adm-dossier-row-help">
            Au plus tard le jour du début du camp. Par défaut : dans 14 jours.
          </span>
        </label>
        <input
          id="contract-deadline"
          type="date"
          className="adm-input"
          value={deadline}
          max={start || undefined}
          onChange={(e) => setDeadline(e.target.value)}
          disabled={inputsDisabled}
        />
      </div>

      {/* Prestations */}
      <div className="adm-dossier-fields">
        <div className="adm-field">
          <label className="adm-field-label" htmlFor="contract-inclusions">
            Prestations incluses
          </label>
          <p id="contract-inclusions-help" className="adm-field-help">
            Une prestation par ligne. Pré-rempli depuis les CGV (art. 5) dans la langue choisie.
          </p>
          <textarea
            id="contract-inclusions"
            className="adm-textarea"
            rows={6}
            value={inclusions}
            onChange={(e) => setInclusions(e.target.value)}
            disabled={inputsDisabled}
            maxLength={8000}
            aria-describedby="contract-inclusions-help"
          />
        </div>
        <div className="adm-field">
          <label className="adm-field-label" htmlFor="contract-exclusions">
            Prestations non incluses
          </label>
          <textarea
            id="contract-exclusions"
            className="adm-textarea"
            rows={4}
            value={exclusions}
            onChange={(e) => setExclusions(e.target.value)}
            disabled={inputsDisabled}
            maxLength={8000}
          />
        </div>
        <div className="adm-field">
          <label className="adm-field-label" htmlFor="contract-note">
            Conditions particulières (optionnel)
          </label>
          <p id="contract-note-help" className="adm-field-help">
            Affichées dans un encadré dédié du PDF (ex. régime alimentaire, arrivée décalée, accord spécifique).
          </p>
          <textarea
            id="contract-note"
            className="adm-textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={inputsDisabled}
            maxLength={8000}
            aria-describedby="contract-note-help"
            placeholder="Rien à signaler ? Laisse vide, la section n’apparaîtra pas dans le PDF."
          />
        </div>
      </div>

      {/* Blocages */}
      {blockers.length > 0 && (
        <div className="adm-dossier-note adm-dossier-note--block adm-tone--warn">
          <p className="adm-dossier-note-title">
            <Icon name="alert-triangle" size={16} />
            À compléter avant envoi
          </p>
          <ul className="adm-dossier-note-list">
            {blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="adm-btn-row adm-dossier-card-actions">
        {(dirty || neverSaved) && (
          <Button onClick={handleSave} disabled={inputsDisabled}>
            Enregistrer
          </Button>
        )}
        <Button
          onClick={handlePreview}
          disabled={!canPreview || inputsDisabled}
          title={fieldBlockers.length > 0 ? fieldBlockers.join(' · ') : 'Ouvre le PDF filigrané dans un nouvel onglet'}
        >
          Prévisualiser le PDF
        </Button>
        <Button
          variant="primary"
          icon="send"
          onClick={() => setConfirmOpen(true)}
          loading={busy}
          disabled={blockers.length > 0 || !!props.busyExternal}
          title={blockers.length > 0 ? blockers.join(' · ') : undefined}
        >
          {isResend ? 'Renvoyer le contrat' : 'Envoyer le contrat'}
        </Button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={isResend ? `Renvoyer le contrat${NBSP}?` : `Envoyer le contrat${NBSP}?`}
        message={[
          `Destinataire${NBSP}: ${props.candidateEmail ?? 'Non renseigné'}`,
          `Contrat${NBSP}: ${displayNumber ?? 'n° attribué à l’enregistrement'} · ${locale === 'fr' ? 'Français' : 'English'}`,
          `Séjour${NBSP}: ${start && end ? `du ${formatDateFr(start)} au ${formatDateFr(end)}` : 'dates non renseignées'}`,
          `Montant${NBSP}: ${amountLabel ?? 'Non renseigné'} · à régler avant le ${deadline ? formatDateFr(deadline) : 'Non renseigné'}`,
          '',
          `Copie exacte en bcc à contact@mkrcamp.com et PDF archivé.${isResend ? `\n\nRenvoi : le candidat recevra une nouvelle version (v${sentCount + 1}).` : ''}`,
        ].join('\n')}
        confirmLabel={isResend ? 'Renvoyer' : 'Envoyer'}
        cancelLabel="Annuler"
        variant="primary"
        icon="send"
        confirmIcon="send"
        onConfirm={() => {
          setConfirmOpen(false)
          void handleSend()
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  )
}

/** Champs contrat lus cote serveur (le reste vient de la fiche). */
export type DossierContractCardProps = Pick<
  ContractCardProps,
  | 'sessionId' | 'dureeSemaines' | 'dateDebutSouhaitee' | 'contractStartDate' | 'contractEndDate'
  | 'contractDurationWeeks' | 'contractInclusions' | 'contractExclusions' | 'contractNote'
  | 'contractPaymentDeadline' | 'contractLocale' | 'contractNumber' | 'contractSentAt'
  | 'contractSentCount' | 'contractPdfPath'
>

/** Carte branchee sur la fiche : statut et montant live, remontees vers l'etat live. */
export function DossierContractCard(props: DossierContractCardProps) {
  const { id, live, staticData: s, pendingStatus, setLive } = useDossier()
  return (
    <ContractCard
      {...props}
      candidatureId={id}
      status={live.status}
      packageAmountCents={live.packageCents}
      onAmountSaved={(cents) => setLive({ packageCents: cents })}
      onSaved={(saved) => setLive({ contractPaymentDeadline: saved.contractPaymentDeadline })}
      onSent={(sent) => setLive({ contractSentAt: sent.contractSentAt, contractPaymentDeadline: sent.contractPaymentDeadline })}
      candidateEmail={s.email}
      submissionLanguage={s.lang}
      busyExternal={pendingStatus !== null}
    />
  )
}
