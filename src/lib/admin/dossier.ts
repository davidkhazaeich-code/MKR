// Fiche dossier : types et logique pure (aucune I/O, aucune lecture
// d'horloge : `now` est toujours passe) partages par DossierProvider, le
// panneau "Prochaine etape", la barre d'actions mobile, la carte Paiement et
// la fenetre "Enregistrer un paiement".
//
// DossierStatic : champs du dossier figes pendant la visite de la fiche
// (relus a chaque rendu serveur). DossierLive : champs que les actions de la
// fiche modifient (etat client, optimiste puis confirme par le serveur).

import type { IconName } from '@/components/admin/ui/Icon'
import { sessionFromId } from '@/data/sessions'
import {
  ALLOWED_TRANSITIONS, STATUS_LABEL, STATUS_VALUES, TRANSITION_REMINDER, type Status,
} from '@/lib/admin-transitions'
import { daysBetween, formatDayLong, formatEuros, formatNumericDate, zurichDay } from '@/lib/admin/format'
import type { NextStepInput, StepKind } from '@/lib/admin/next-step'
import type { Lang, PaymentMethod, Tone, TunnelType } from '@/lib/admin/types'

// Espace insecable avant la ponctuation haute (typographie francaise).
const NBSP = '\u00a0'

/* -------------------------------------------------------------- Onglets */

export type DossierTab = 'profil' | 'suivi' | 'paiement' | 'historique'

export const DOSSIER_TABS: readonly { id: DossierTab; label: string }[] = [
  { id: 'profil', label: 'Profil' },
  { id: 'suivi', label: 'Suivi' },
  { id: 'paiement', label: 'Paiement' },
  { id: 'historique', label: 'Historique' },
]

/** Onglet lu dans le hash de l'URL (#paiement), sinon null. */
export function tabFromHash(hash: string | null | undefined): DossierTab | null {
  const value = (hash ?? '').replace(/^#/, '')
  return DOSSIER_TABS.some((t) => t.id === value) ? (value as DossierTab) : null
}

/* -------------------------------------------------------------- Donnees */

export interface DossierLive {
  status: Status; statusChangedAt: string
  packageCents: number | null; packagePaidAt: string | null
  paymentMethod: PaymentMethod | null; paymentDate: string | null
  visioReminderSentAt: string | null; visioReminderCount: number
  rebookingSentAt: string | null; rebookingSentCount: number
  contractSentAt: string | null; contractPaymentDeadline: string | null
}

/** Champs du dossier qui ne changent pas pendant la visite de la fiche. */
export interface DossierStatic {
  id: string; firstName: string; fullName: string; email: string | null; phoneE164: string | null
  lang: Lang; tunnelType: TunnelType; sessionId: string | null; createdAt: string
  visioBookedAt: string | null; visioStartsAt: string | null; visioBookingUid: string | null
  contractStartDate: string | null; contractEndDate: string | null
  campDeparted: boolean; missedSessionLabel: string | null
}

/** Entree du moteur "prochaine etape" reconstruite depuis la fiche. */
export function toNextStepInput(s: DossierStatic, l: DossierLive): NextStepInput {
  return {
    status: l.status,
    created_at: s.createdAt,
    status_changed_at: l.statusChangedAt,
    tunnel_type: s.tunnelType,
    session_id: s.sessionId,
    visio_booked_at: s.visioBookedAt,
    visio_starts_at: s.visioStartsAt,
    visio_reminder_count: l.visioReminderCount,
    visio_reminder_sent_at: l.visioReminderSentAt,
    contract_sent_at: l.contractSentAt,
    contract_payment_deadline: l.contractPaymentDeadline,
    contract_start_date: s.contractStartDate,
    contract_end_date: s.contractEndDate,
    package_paid_at: l.packagePaidAt,
    package_amount_cents: l.packageCents,
    payment_date: l.paymentDate,
    payment_method: l.paymentMethod,
    rebooking_sent_at: l.rebookingSentAt,
    rebooking_sent_count: l.rebookingSentCount,
  }
}

const PAYMENT_METHODS: readonly PaymentMethod[] = ['virement', 'cash', 'autre']
const isStringOrNull = (v: unknown): v is string | null => v === null || typeof v === 'string'

/**
 * `live` mis a jour depuis `data.candidature` (reponse du PATCH) : seules les
 * colonnes presentes et bien typees sont reprises, le reste est garde.
 */
export function liveFromServer(prev: DossierLive, candidature: unknown): DossierLive {
  if (!candidature || typeof candidature !== 'object') return prev
  const c = candidature as Record<string, unknown>
  const next: DossierLive = { ...prev }
  if (typeof c.status === 'string' && (STATUS_VALUES as readonly string[]).includes(c.status)) next.status = c.status as Status
  if (typeof c.status_changed_at === 'string') next.statusChangedAt = c.status_changed_at
  if ('package_amount_cents' in c && (c.package_amount_cents === null || typeof c.package_amount_cents === 'number')) {
    next.packageCents = c.package_amount_cents as number | null
  }
  if ('package_paid_at' in c && isStringOrNull(c.package_paid_at)) next.packagePaidAt = c.package_paid_at
  if ('payment_method' in c && (c.payment_method === null || PAYMENT_METHODS.includes(c.payment_method as PaymentMethod))) {
    next.paymentMethod = c.payment_method as PaymentMethod | null
  }
  if ('payment_date' in c && isStringOrNull(c.payment_date)) next.paymentDate = c.payment_date
  if ('contract_sent_at' in c && isStringOrNull(c.contract_sent_at)) next.contractSentAt = c.contract_sent_at
  if ('contract_payment_deadline' in c && isStringOrNull(c.contract_payment_deadline)) {
    next.contractPaymentDeadline = c.contract_payment_deadline
  }
  return next
}

/** Camp du dossier deja parti (regle du digest et de computeNextStep : jour de Zurich). */
export function isCampDeparted(sessionId: string | null, now: Date): boolean {
  const session = sessionFromId(sessionId)
  return !!session && session.startDate <= zurichDay(now)
}

/** Situation d'une session officielle par rapport au jour de Zurich. */
export function sessionTiming(sessionId: string | null, now: Date): { state: 'a_venir' | 'en_cours' | 'terminee'; days: number } | null {
  const session = sessionFromId(sessionId)
  if (!session) return null
  const today = zurichDay(now)
  if (session.endDate < today) return { state: 'terminee', days: daysBetween(session.endDate, today) }
  if (session.startDate <= today) return { state: 'en_cours', days: 0 }
  return { state: 'a_venir', days: daysBetween(today, session.startDate) }
}

/* -------------------------------------------------------------- Liens */

/** Page Cal du rendez-vous (confirmation, heure, lien de la visio). */
export function bookingHref(uid: string): string {
  return `https://cal.com/booking/${encodeURIComponent(uid)}`
}

/** Lien tel: (chiffres et + seulement). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+0-9]/g, '')}`
}

/* -------------------------------------------------------------- Actions */

/** Libelle des transitions en bouton secondaire (et du primaire "Valider"). */
export const TRANSITION_LABEL: Record<Status, string> = {
  validee: 'Valider le dossier',
  refusee: 'Refuser',
  annulee: 'Annuler le dossier',
  reportee: 'Reporter',
  recue: 'Retirer la validation',
  soldee: 'Passer en Soldée',
  camp_fait: 'Marquer camp fait',
}

/** Icone de l'action (bouton primaire, bouton de confirmation). */
export const TRANSITION_ICON: Record<Status, IconName> = {
  validee: 'check-circle',
  refusee: 'x',
  annulee: 'x',
  reportee: 'calendar',
  recue: 'rotate-ccw',
  soldee: 'check',
  camp_fait: 'flag',
}

/** Raccourcis clavier de la fiche (meme table que l'ancienne colonne d'actions). */
export const TRANSITION_SHORTCUTS: Readonly<Record<string, Status>> = {
  v: 'validee', r: 'refusee', a: 'annulee', z: 'reportee', s: 'soldee', t: 'camp_fait',
}

/** Touche d'une transition (affichage, aria-keyshortcuts). */
export function shortcutOf(status: Status): string | null {
  const key = Object.keys(TRANSITION_SHORTCUTS).find((k) => TRANSITION_SHORTCUTS[k] === status)
  return key ? key.toUpperCase() : null
}

export function canTransitionTo(from: Status, to: Status): boolean {
  return (ALLOWED_TRANSITIONS[from] ?? []).includes(to)
}

export type PrimaryAction =
  | { type: 'transition'; to: Status; label: string; icon: IconName }
  | { type: 'booking'; label: string; icon: IconName }
  | { type: 'reminder'; label: string; icon: IconName }
  | { type: 'whatsapp'; label: string }
  | { type: 'email'; label: string; icon: IconName }
  | { type: 'goto'; tab: DossierTab; anchor: string; label: string; icon: IconName }
  | { type: 'payment'; label: string; icon: IconName }

export interface PrimaryContext {
  status: Status
  hasBooking: boolean
  hasPhone: boolean
  hasEmail: boolean
}

function transitionAction(to: Status, label: string, ctx: PrimaryContext): PrimaryAction | null {
  return canTransitionTo(ctx.status, to) ? { type: 'transition', to, label, icon: TRANSITION_ICON[to] } : null
}

/** Action primaire de la fiche selon l'etape (panneau et barre d'actions mobile). */
export function primaryActionFor(kind: StepKind, ctx: PrimaryContext): PrimaryAction | null {
  switch (kind) {
    case 'visio_a_venir':
      if (ctx.hasBooking) return { type: 'booking', label: 'Ouvrir la réservation', icon: 'external-link' }
      return ctx.hasEmail ? { type: 'reminder', label: 'Envoyer un rappel', icon: 'send' } : null
    case 'visio_passee':
    case 'visio_reservee':
      return transitionAction('validee', 'Valider le dossier', ctx)
    case 'a_relancer':
    case 'nouvelle':
      return ctx.hasEmail ? { type: 'reminder', label: 'Envoyer un rappel visio', icon: 'send' } : null
    case 'devis_a_envoyer':
      if (ctx.hasPhone) return { type: 'whatsapp', label: 'Écrire sur WhatsApp' }
      return ctx.hasEmail ? { type: 'email', label: 'Écrire un email', icon: 'mail' } : null
    case 'contrat_a_envoyer':
      return { type: 'goto', tab: 'paiement', anchor: 'contrat', label: 'Préparer le contrat', icon: 'file-text' }
    case 'contrat_sans_echeance':
      return { type: 'goto', tab: 'paiement', anchor: 'contrat', label: 'Ajouter l’échéance', icon: 'file-text' }
    case 'paiement_attendu':
    case 'paiement_en_retard':
      return { type: 'payment', label: 'Enregistrer le paiement', icon: 'receipt' }
    case 'a_solder':
      return transitionAction('soldee', 'Passer en Soldée', ctx)
    case 'camp_a_cloturer':
      return transitionAction('camp_fait', 'Marquer « Camp fait »', ctx)
    case 'camp_parti':
      return { type: 'goto', tab: 'suivi', anchor: 'report', label: 'Proposer une autre session', icon: 'send' }
    case 'depart_a_venir':
    case 'clos':
      return null
  }
}

/** Autres transitions permises, en secondaire, sans doublon avec le primaire. */
export function secondaryTransitions(status: Status, primary: PrimaryAction | null): Status[] {
  const skip = primary?.type === 'transition' ? primary.to : null
  return (ALLOWED_TRANSITIONS[status] ?? []).filter((to) => to !== skip)
}

/* -------------------------------------------------------------- Confirmations */

export interface ConfirmSpec {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  variant: 'primary' | 'warning' | 'danger'
  icon: IconName
  confirmIcon: IconName
}

// Textes de l'ancienne colonne d'actions (AdminActions.ACTION_CONFIRM).
const CONFIRM_TEXT: Partial<Record<Status, { title: string; message: string }>> = {
  recue: {
    title: 'Retirer la validation de ce dossier ?',
    message:
      'Le dossier repasse en « Reçue » (état initial), comme avant la validation. À utiliser si la visio de sélection n\'a pas encore été faite. Tu pourras le revalider ensuite : l\'image souvenir sera alors renvoyée au candidat.',
  },
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
    message: 'Le candidat sera recalé sur une session ultérieure ou des dates sur mesure (90 jours min).',
  },
}

function withReminder(message: string, next: Status): string {
  const reminder = TRANSITION_REMINDER[next]
  return reminder ? `${message}\n\nRappel post-action${NBSP}: ${reminder}` : message
}

/**
 * Confirmation d'une transition, ou null quand elle part directement
 * (Soldee, Camp fait). Valider demande desormais une confirmation : elle
 * envoie l'email "dossier valide" au candidat.
 */
export function transitionConfirm(next: Status, email: string | null): ConfirmSpec | null {
  if (next === 'validee') {
    return {
      title: `Valider le dossier${NBSP}?`,
      message: withReminder(
        `L’email « dossier validé » part au candidat${email ? ` (${email})` : ''}, avec son image souvenir.`,
        next,
      ),
      confirmLabel: 'Valider le dossier',
      cancelLabel: 'Annuler',
      variant: 'primary',
      icon: 'check-circle',
      confirmIcon: 'check-circle',
    }
  }
  const text = CONFIRM_TEXT[next]
  if (!text) return null
  const danger = next === 'refusee' || next === 'annulee'
  return {
    title: text.title.replace(/ \?$/, `${NBSP}?`),
    message: withReminder(text.message, next),
    confirmLabel:
      next === 'refusee' ? 'Refuser le dossier'
        : next === 'annulee' ? 'Annuler le dossier'
          : next === 'reportee' ? 'Reporter le dossier'
            : 'Retirer la validation',
    // "Annuler" a cote de "Annuler le dossier" preterait a confusion.
    cancelLabel: next === 'annulee' ? 'Garder le dossier' : 'Annuler',
    variant: danger ? 'danger' : 'warning',
    icon: 'alert-triangle',
    confirmIcon: TRANSITION_ICON[next],
  }
}

/** Notification apres une transition reussie (texte de l'ancienne colonne). */
export function transitionSuccess(next: Status): string {
  return `Statut passé à « ${STATUS_LABEL[next]} »`
}

/* -------------------------------------------------------------- Paiement */

export type EuroParse = { ok: true; cents: number | null } | { ok: false }

/** Saisie en euros ("2900", "2 900,50", "2900.5 €") vers des centimes ; vide = null. */
export function parseEuros(input: string): EuroParse {
  const s = input.replace(/[\s\u00a0\u202f€]/g, '').replace(',', '.')
  if (s === '') return { ok: true, cents: null }
  if (!/^\d+(\.\d{0,2})?$/.test(s)) return { ok: false }
  return { ok: true, cents: Math.round(parseFloat(s) * 100) }
}

/** Centimes vers la valeur d'un champ en euros ("2900", "2900,50"). */
export function centsToInput(cents: number | null): string {
  if (cents === null) return ''
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2).replace('.', ',')
}

export const PAYMENT_METHOD_OPTIONS: readonly { value: PaymentMethod; label: string }[] = [
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'cash', label: 'Espèces' },
  { value: 'autre', label: 'Autre' },
]

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export function canMarkSoldee(status: Status): boolean {
  return canTransitionTo(status, 'soldee')
}

export interface PaymentDraft { amount: string; method: PaymentMethod; date: string; toSoldee: boolean }

export type PaymentPlan =
  | { ok: true; body: Record<string, unknown>; optimistic: Partial<DossierLive>; rollback: Partial<DossierLive>; success: string }
  | { ok: false; field: 'amount' | 'date'; error: string }

/**
 * Fenetre "Enregistrer un paiement" : un seul PATCH existant (montant s'il a
 * change, methode, date, paiement recu, et le statut Soldee si demande et
 * permis), avec l'etat optimiste et son retour arriere.
 */
export function planPayment(draft: PaymentDraft, live: DossierLive, nowIso: string): PaymentPlan {
  const amount = parseEuros(draft.amount)
  if (!amount.ok) return { ok: false, field: 'amount', error: 'Montant invalide : un nombre en euros, par exemple 2900 ou 2900,50.' }
  if (!DATE_ONLY.test(draft.date)) return { ok: false, field: 'date', error: 'Indique la date de réception du paiement.' }

  const body: Record<string, unknown> = {}
  const optimistic: Partial<DossierLive> = {}
  const rollback: Partial<DossierLive> = {}
  if (amount.cents !== null && amount.cents !== live.packageCents) {
    body.package_amount_cents = amount.cents
    optimistic.packageCents = amount.cents
    rollback.packageCents = live.packageCents
  }
  body.payment_method = draft.method
  body.payment_date = draft.date
  body.package_paid = true
  optimistic.paymentMethod = draft.method
  optimistic.paymentDate = draft.date
  optimistic.packagePaidAt = live.packagePaidAt ?? nowIso
  rollback.paymentMethod = live.paymentMethod
  rollback.paymentDate = live.paymentDate
  rollback.packagePaidAt = live.packagePaidAt
  const toSoldee = draft.toSoldee && canMarkSoldee(live.status)
  if (toSoldee) {
    body.status = 'soldee'
    optimistic.status = 'soldee'
    optimistic.statusChangedAt = nowIso
    rollback.status = live.status
    rollback.statusChangedAt = live.statusChangedAt
  }
  return {
    ok: true, body, optimistic, rollback,
    success: toSoldee ? 'Paiement enregistré, dossier passé en Soldée' : 'Paiement enregistré',
  }
}

export interface PaymentSummary {
  state: 'paid' | 'due' | 'unknown'
  /** Libelle du grand chiffre. */
  label: string
  /** Grand chiffre : montant restant, "Soldé" ou "Montant à définir". */
  headline: string
  tone: Tone
  /** Part encaissee, 0 a 100 (le paiement est enregistre en une fois). */
  progress: number
  /** Echeance du contrat tant que rien n'est recu. */
  deadline: { text: string; tone: Tone } | null
}

export function paymentSummary(live: DossierLive, now: Date): PaymentSummary {
  if (live.packagePaidAt) {
    return {
      state: 'paid', label: 'Paiement reçu', headline: 'Soldé', tone: 'ok', progress: 100,
      deadline: null,
    }
  }
  let deadline: PaymentSummary['deadline'] = null
  if (live.contractPaymentDeadline) {
    const diff = daysBetween(zurichDay(now), live.contractPaymentDeadline)
    deadline = diff < 0
      ? { text: `Échéance dépassée depuis le ${formatDayLong(live.contractPaymentDeadline)}`, tone: 'danger' }
      : { text: `À régler au plus tard le ${formatDayLong(live.contractPaymentDeadline)}`, tone: diff <= 3 ? 'warn' : 'neutral' }
  }
  if (live.packageCents === null) {
    return { state: 'unknown', label: 'Reste à payer', headline: 'Montant à définir', tone: 'neutral', progress: 0, deadline }
  }
  return { state: 'due', label: 'Reste à payer', headline: formatEuros(live.packageCents), tone: 'warn', progress: 0, deadline }
}

/** "1 rappel, le dernier le 19/09/2026" ; "Aucun". */
export function remindersLine(count: number | null, lastAt: string | null): string {
  const n = count ?? 0
  if (n <= 0) return 'Aucun'
  const last = lastAt ? `, le dernier le ${formatNumericDate(lastAt)}` : ''
  return n === 1 ? `1 envoyé${lastAt ? ` le ${formatNumericDate(lastAt)}` : ''}` : `${n} envoyés${last}`
}
