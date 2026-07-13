'use client'

/**
 * Carte « Contrat » du dashboard admin (rendue par AdminActions, colonne droite).
 *
 * Workflow : Ruslan valide le dossier → remplit/ajuste les champs (pré-remplis
 * depuis la demande) → « Enregistrer » (attribue le n° de contrat) →
 * « Prévisualiser » (PDF filigrané, nouvel onglet, save-then-open) →
 * « Envoyer » (modale de confirmation) → email candidat + copie bcc +
 * archive Storage. Renvoi possible (vN).
 *
 * Enregistrement EXPLICITE (pas d'auto-save) : document contractuel.
 * Les garde-fous UI sont un miroir de ceux du serveur (source d'autorité).
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
import { SESSIONS } from '@/data/sessions'
import type { Status } from '@/lib/admin-transitions'
import ConfirmModal from './ui/ConfirmModal'
import Icon from './ui/Icon'
import { useToast } from './ui/Toast'

export interface ContractCardProps {
  candidatureId: string
  /** Statut LIVE (état optimiste d'AdminActions, pas la prop server). */
  status: Status
  /** Montant LIVE (état optimiste d'AdminActions). */
  packageAmountCents: number | null
  /**
   * Callback quand le montant est modifié + enregistré depuis CETTE carte,
   * pour resynchroniser l'état de la carte Paiement (AdminActions) sans
   * attendre le router.refresh. Source unique : package_amount_cents.
   */
  onAmountSaved?: (cents: number) => void
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

/* ─────────── Helpers dates (date-only, UTC, zéro dépendance) ─────────── */

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

/** Fin suggérée : fin de session officielle si durée pleine, sinon début + N semaines. */
function suggestEnd(start: string, weeks: number | null, sessionId: string | null): string {
  if (!start || !weeks) return ''
  const session = sessionId ? SESSIONS.find((s) => s.id === sessionId) : null
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

/* ─────────────────────────── Composant ─────────────────────────── */

export default function ContractCard(props: ContractCardProps) {
  const toast = useToast()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const ribOk = isRibConfigured()

  // Pré-remplissage : valeur DB sinon dérivée de la demande.
  const initialLocale: ContractLocale = props.contractLocale ?? props.submissionLanguage
  const session = props.sessionId ? SESSIONS.find((s) => s.id === props.sessionId) : null
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

  // Montant du séjour : MÊME champ que la carte Paiement (package_amount_cents,
  // source unique — suivi paiement, commissions referral % et contrat restent
  // cohérents). Draft local, resynchronisé depuis la prop tant que non touché
  // (édition possible depuis la carte Paiement en parallèle).
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
  /** Montant effectif pour les garde-fous UI et le récap : draft si touché, sinon la valeur live. */
  const effectiveAmountCents = amountTouched
    ? (amountDraftValid ? amountDraftCents : null)
    : props.packageAmountCents
  const amountDirty = amountTouched && amountDraftCents !== props.packageAmountCents

  // Fin auto-liée tant que Ruslan ne l'a pas éditée à la main.
  const autoEndRef = useRef<string>(props.contractEndDate ? '' : initialEnd)

  // Snapshot persisté (pour dirty). Mis à jour après chaque save réussi.
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

  // Dirty = différent du dernier état PERSISTÉ. Avant le premier save, les
  // pré-remplissages rendent la carte dirty : voulu (rien n'est en DB).
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

  /* ─────────── Garde-fous (miroir serveur) ─────────── */

  const fieldBlockers = useMemo(() => {
    const list: string[] = []
    if (!start || !end) list.push('Dates du séjour (début et fin)')
    else if (end < start) list.push('La date de fin précède le début')
    if (!weeksNum || weeksNum < 1 || weeksNum > 12) list.push('Durée (1 à 12 semaines)')
    if (!effectiveAmountCents || effectiveAmountCents <= 0)
      list.push('Montant du séjour manquant ou invalide (« sur devis » bloqué) — saisis-le dans le champ Montant')
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
  const canSend = canPreview && sendBlockers.length === 0

  /* ─────────── Handlers ─────────── */

  const handleLocaleChange = (next: ContractLocale) => {
    setLocale(next)
    // Listes non modifiées → on bascule les défauts dans la nouvelle langue.
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
    // Montant touché mais invalide : on refuse d'enregistrer plutôt que
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
          // Même champ que la carte Paiement : audit package_amount_change +
          // recalcul des commissions % gérés par le PATCH existant.
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
        setAmountTouched(false) // re-liaison sur la prop (désormais à jour)
      }
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

  // Save-then-open : onglet ouvert de manière synchrone (anti popup-blocker),
  // pointé vers l'aperçu une fois l'état persisté.
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
      setSentAt(c.contract_sent_at ?? new Date().toISOString())
      setSentCount(c.contract_sent_count ?? sentCount + 1)
      setPdfPath(c.contract_pdf_path ?? pdfPath)
      if (c.contract_number) setNumber(c.contract_number)
      toast.show(`Contrat envoyé à ${props.candidateEmail}`, 'success')
      startTransition(() => router.refresh())
    } catch {
      toast.show('Connexion impossible. Vérifie ton réseau.', 'error')
    } finally {
      setBusy(false)
    }
  }

  /* ─────────── Rendu ─────────── */

  const displayNumber = number !== null ? formatContractNumber(number, new Date().getFullYear()) : null
  const amountLabel =
    effectiveAmountCents && effectiveAmountCents > 0
      ? formatEurCents(effectiveAmountCents, 'fr')
      : null
  const isResend = sentCount > 0

  // Dossier pas encore actionnable et jamais de contrat : état compact.
  if (!SENDABLE_STATUSES.includes(props.status) && !sentAt) {
    return (
      <section className="adm-card">
        <h2 className="adm-card-title">
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

  return (
    <section className="adm-card">
      <h2 className="adm-card-title">
        <Icon name="file-text" size={14} />
        Contrat
        {displayNumber && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.7rem',
              color: 'var(--adm-text-secondary)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'none',
            }}
          >
            {displayNumber}
          </span>
        )}
      </h2>

      {/* État envoi */}
      {sentAt && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.6rem 0.75rem',
            borderRadius: 8,
            border: '1px solid rgba(34, 197, 94, 0.35)',
            background: 'rgba(34, 197, 94, 0.08)',
            marginBottom: '0.9rem',
            fontSize: '0.8rem',
            color: 'var(--adm-text-secondary)',
            lineHeight: 1.45,
          }}
        >
          <span style={{ color: 'var(--adm-status-validee)', flexShrink: 0, marginTop: 1 }}>
            <Icon name="check-circle" size={14} strokeWidth={2.4} />
          </span>
          <span>
            <strong style={{ color: 'var(--adm-status-validee)' }}>
              Contrat envoyé le{' '}
              {new Date(sentAt).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>{' '}
            ({sentCount} envoi{sentCount > 1 ? 's' : ''})
            {pdfPath && (
              <>
                {' · '}
                <a
                  href={`/api/admin/candidature/${props.candidatureId}/contract/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--adm-text-primary)', textDecoration: 'underline' }}
                >
                  Voir le PDF envoyé
                </a>
              </>
            )}
          </span>
        </div>
      )}

      {/* Langue */}
      <div className="adm-input-row">
        <label className="adm-input-row-label" htmlFor="contract-locale">
          Langue du contrat
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '0.15rem' }}>
            PDF + email. Pré-réglée sur la langue d’inscription du candidat ({props.submissionLanguage.toUpperCase()}).
          </span>
        </label>
        <select
          id="contract-locale"
          className="adm-input"
          value={locale}
          onChange={(e) => handleLocaleChange(e.target.value as ContractLocale)}
          disabled={inputsDisabled}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Dates + durée */}
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
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '0.15rem' }}>
            Calculée depuis début + durée (fin de session officielle si durée pleine). Modifiable.
          </span>
        </label>
        <input
          id="contract-end"
          type="date"
          className="adm-input"
          value={end}
          onChange={(e) => {
            setEnd(e.target.value)
            autoEndRef.current = '' // édition manuelle : on coupe le lien auto
          }}
          disabled={inputsDisabled}
        />
      </div>
      <div className="adm-input-row">
        <label className="adm-input-row-label" htmlFor="contract-amount">
          Montant du séjour (€)
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '0.15rem' }}>
            Montant unique du dossier : contrat, suivi paiement et commissions partenaire. Repris de la carte Paiement, modifiable ici.
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
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '0.15rem' }}>
            Au plus tard le jour du début du camp. Défaut : J+14.
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
      <div style={{ marginTop: '0.4rem' }}>
        <label className="adm-input-row-label" htmlFor="contract-inclusions" style={{ display: 'block', marginBottom: '0.3rem' }}>
          Prestations incluses
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '0.15rem' }}>
            1 prestation par ligne. Pré-rempli depuis les CGV (art. 5) dans la langue choisie.
          </span>
        </label>
        <textarea
          id="contract-inclusions"
          className="adm-notes-textarea"
          rows={6}
          value={inclusions}
          onChange={(e) => setInclusions(e.target.value)}
          disabled={inputsDisabled}
          maxLength={8000}
        />
      </div>
      <div style={{ marginTop: '0.7rem' }}>
        <label className="adm-input-row-label" htmlFor="contract-exclusions" style={{ display: 'block', marginBottom: '0.3rem' }}>
          Prestations non incluses
        </label>
        <textarea
          id="contract-exclusions"
          className="adm-notes-textarea"
          rows={4}
          value={exclusions}
          onChange={(e) => setExclusions(e.target.value)}
          disabled={inputsDisabled}
          maxLength={8000}
        />
      </div>
      <div style={{ marginTop: '0.7rem' }}>
        <label className="adm-input-row-label" htmlFor="contract-note" style={{ display: 'block', marginBottom: '0.3rem' }}>
          Conditions particulières (optionnel)
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--adm-text-muted)', marginTop: '0.15rem' }}>
            Affichées dans un encadré dédié du PDF (ex. régime alimentaire, arrivée décalée, accord spécifique).
          </span>
        </label>
        <textarea
          id="contract-note"
          className="adm-notes-textarea"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={inputsDisabled}
          maxLength={8000}
          placeholder="Rien à signaler ? Laisse vide, la section n’apparaîtra pas dans le PDF."
        />
      </div>

      {/* Blocages */}
      {(fieldBlockers.length > 0 || sendBlockers.length > 0) && (
        <div
          style={{
            marginTop: '0.9rem',
            padding: '0.6rem 0.75rem',
            borderRadius: 8,
            border: '1px solid rgba(251, 191, 36, 0.35)',
            background: 'rgba(251, 191, 36, 0.07)',
            fontSize: '0.78rem',
            color: 'var(--adm-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--adm-status-reportee)', fontWeight: 700, marginBottom: '0.25rem' }}>
            <Icon name="alert-triangle" size={13} strokeWidth={2.2} />
            À compléter avant envoi
          </div>
          {[...fieldBlockers, ...sendBlockers].map((b, i) => (
            <div key={i}>· {b}</div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.9rem' }}>
        {(dirty || neverSaved) && (
          <button type="button" className="adm-btn adm-btn--ghost" onClick={handleSave} disabled={inputsDisabled} style={{ padding: '0.5rem 0.8rem' }}>
            Enregistrer
          </button>
        )}
        <button
          type="button"
          className="adm-btn adm-btn--ghost"
          onClick={handlePreview}
          disabled={!canPreview || inputsDisabled}
          style={{ padding: '0.5rem 0.8rem' }}
          title={fieldBlockers.length > 0 ? fieldBlockers.join(' · ') : 'Ouvre le PDF filigrané dans un nouvel onglet'}
        >
          Prévisualiser le PDF
        </button>
        <button
          type="button"
          className="adm-action-btn"
          onClick={() => setConfirmOpen(true)}
          disabled={!canSend || inputsDisabled}
          style={{
            ['--adm-action-color' as string]: 'var(--adm-status-validee)',
            ['--adm-action-bg' as string]: 'rgba(34, 197, 94, 0.1)',
            ['--adm-action-border' as string]: 'rgba(34, 197, 94, 0.4)',
            ['--adm-action-hover-bg' as string]: 'rgba(34, 197, 94, 0.1)',
            opacity: !canSend ? 0.55 : undefined,
          }}
          title={!canSend ? [...fieldBlockers, ...sendBlockers].join(' · ') : undefined}
        >
          <Icon name="mail" size={15} strokeWidth={2.4} />
          {isResend ? 'Renvoyer le contrat' : 'Envoyer le contrat'}
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={isResend ? 'Renvoyer le contrat ?' : 'Envoyer le contrat ?'}
        message={[
          `Destinataire : ${props.candidateEmail ?? '—'}`,
          `Contrat : ${displayNumber ?? 'n° attribué à l’enregistrement'} · ${locale === 'fr' ? 'Français' : 'English'}`,
          `Séjour : ${start ? formatDateFr(start) : '—'} → ${end ? formatDateFr(end) : '—'}`,
          `Montant : ${amountLabel ?? '—'} · à régler avant le ${deadline ? formatDateFr(deadline) : '—'}`,
          '',
          `Copie exacte en bcc à contact@mkrcamp.com + PDF archivé.${isResend ? `\n\nRenvoi : le candidat recevra une nouvelle version (v${sentCount + 1}).` : ''}`,
        ].join('\n')}
        confirmLabel={isResend ? 'Renvoyer' : 'Envoyer'}
        cancelLabel="Annuler"
        variant="primary"
        onConfirm={() => {
          setConfirmOpen(false)
          void handleSend()
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  )
}
