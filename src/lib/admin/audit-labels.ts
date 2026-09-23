import type { Status } from '@/lib/admin-transitions'
import { STATUS_LABEL } from '@/lib/admin-transitions'
import { ATTRIBUTION_SOURCE_LABEL, type AttributionSource } from '@/lib/attribution'
import type { PaymentMethod, Tone } from '@/lib/admin/types'
import { PAYMENT_METHOD_LABEL, PAYOUT_STATUS_LABEL, STATUS_TONE } from '@/lib/admin/labels'
import { formatDayLong, formatEuros, formatNumericDate, formatTime } from '@/lib/admin/format'

export interface AuditRow {
  id: number; event: string
  from_value: Record<string, unknown> | null; to_value: Record<string, unknown> | null
  data: Record<string, unknown> | null; actor_email: string; at: string
}
export interface AuditDescription { label: string; detail: string | null; tone: Tone | null; reminder: string | null; actor: string }

const ACTOR_LABEL: Record<string, string> = {
  admin: 'Admin', system: 'Site', 'system-cron': 'Automatique', 'cal-webhook': 'Cal.com', candidate: 'Candidat',
}
export function actorLabel(actor: string): string {
  return ACTOR_LABEL[actor] ?? actor
}

const CONTRACT_FIELD_LABEL: Record<string, string> = {
  contract_start_date: 'debut', contract_end_date: 'fin', contract_duration_weeks: 'duree',
  contract_inclusions: 'prestations incluses', contract_exclusions: 'non incluses',
  contract_note: 'conditions particulieres', contract_payment_deadline: 'echeance', contract_locale: 'langue',
}

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null)
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const cents = (v: unknown): string => { const n = num(v); return n === null ? 'aucun' : formatEuros(n) }
const date = (v: unknown): string => { const s = str(v); return s ? formatNumericDate(s) : 'aucune' }
const method = (v: unknown): string => { const s = str(v); return s && s in PAYMENT_METHOD_LABEL ? PAYMENT_METHOD_LABEL[s as PaymentMethod] : 'aucune' }
const payout = (v: unknown): string => { const s = str(v); return s ? PAYOUT_STATUS_LABEL[s] ?? s : 'aucun' }
const visioAt = (v: unknown): string | null => { const s = str(v); return s ? `pour le ${formatDayLong(s)} a ${formatTime(s)}` : null }
const again = (n: number | null, first: string, repeat: string): string => (n && n > 1 ? `${repeat} (envoi n${n})` : first)

export function describeAuditEvent(e: AuditRow): AuditDescription {
  const to = e.to_value ?? {}
  const from = e.from_value ?? {}
  const data = e.data ?? {}
  const base = { reminder: str(data.reminder), actor: actorLabel(e.actor_email) }
  switch (e.event) {
    case 'created': return { ...base, label: 'Candidature recue', detail: null, tone: 'warn' }
    case 'status_change': {
      const f = str(from.status) as Status | null
      const t = str(to.status) as Status | null
      return { ...base, label: t ? `Statut : ${STATUS_LABEL[t] ?? t}` : 'Changement de statut', detail: f && t ? `${STATUS_LABEL[f] ?? f} -> ${STATUS_LABEL[t] ?? t}` : null, tone: t && t in STATUS_TONE ? STATUS_TONE[t] : null }
    }
    case 'package_paid_change':
      return to.package_paid_at
        ? { ...base, label: 'Paiement marque recu', detail: null, tone: 'ok' }
        : { ...base, label: 'Paiement remis a « non recu »', detail: null, tone: 'neutral' }
    case 'package_amount_change': return { ...base, label: 'Montant du sejour modifie', detail: `${cents(from.package_amount_cents)} -> ${cents(to.package_amount_cents)}`, tone: null }
    case 'package_amount_estimated': return { ...base, label: 'Montant estime depuis la grille tarifaire', detail: cents(to.package_amount_cents), tone: null }
    case 'package_amount_backfilled': return { ...base, label: 'Montant repris depuis la grille tarifaire', detail: cents(to.package_amount_cents), tone: null }
    case 'payment_method_change': return { ...base, label: 'Methode de paiement', detail: `${method(from.payment_method)} -> ${method(to.payment_method)}`, tone: null }
    case 'payment_date_change': return { ...base, label: 'Date de paiement', detail: `${date(from.payment_date)} -> ${date(to.payment_date)}`, tone: null }
    case 'notes_admin_update': return { ...base, label: 'Notes admin modifiees', detail: null, tone: null }
    case 'notes_visio_update': return { ...base, label: 'Compte-rendu visio modifie', detail: null, tone: null }
    case 'contract_fields_update': {
      const fields = Array.isArray(data.fields) ? (data.fields as unknown[]).map((f) => CONTRACT_FIELD_LABEL[String(f)] ?? String(f)) : []
      return { ...base, label: 'Infos du contrat enregistrees', detail: fields.length ? fields.join(', ') : null, tone: null }
    }
    case 'contract_sent': {
      const n = num(to.contract_sent_count)
      return { ...base, label: again(n, 'Contrat envoye', 'Contrat renvoye'), detail: [str(data.contract_number), str(data.to)].filter(Boolean).join(' - ') || null, tone: 'ok' }
    }
    case 'souvenir_sent': return { ...base, label: 'Email « dossier valide » envoye avec l\'image souvenir', detail: str(data.to), tone: 'ok' }
    case 'souvenir_reset': return { ...base, label: 'Image souvenir reinitalisee', detail: 'repartira a la prochaine validation', tone: 'neutral' }
    case 'visio_booked': return { ...base, label: 'Visio reservee', detail: visioAt(data.start_time), tone: 'info' }
    case 'visio_rescheduled': return { ...base, label: 'Visio deplacee', detail: visioAt(data.start_time), tone: 'info' }
    case 'visio_booking_cancelled': return { ...base, label: 'Visio annulee par le candidat', detail: null, tone: 'warn' }
    case 'visio_reminder_sent': {
      const n = num(to.visio_reminder_count)
      const auto = e.actor_email === 'system-cron'
      return { ...base, label: auto ? 'Rappel visio automatique envoye' : again(n, 'Rappel visio envoye', 'Rappel visio renvoye'), detail: str(data.to), tone: 'info' }
    }
    case 'visio_confirmation_resent': return { ...base, label: 'Email de confirmation renvoye', detail: str(to.to), tone: 'info' }
    case 'rebooking_sent': {
      const n = num(to.rebooking_sent_count)
      return { ...base, label: again(n, 'Autre session proposee au candidat', 'Autre session reproposee'), detail: str(data.to), tone: 'info' }
    }
    case 'rebooking_reminder_sent': return { ...base, label: 'Rappel automatique de la proposition de session', detail: str(data.to), tone: 'info' }
    case 'payment_reminder_sent': return { ...base, label: 'Rappel de paiement automatique envoye', detail: str(data.to), tone: 'info' }
    case 'predeparture_sent': return { ...base, label: 'Infos pre-depart envoyees', detail: str(data.to), tone: 'info' }
    case 'attribution_captured': {
      const src = str(to.source) as AttributionSource | null
      const label = src ? ATTRIBUTION_SOURCE_LABEL[src] ?? src : 'inconnue'
      return { ...base, label: `Source d'acquisition : ${label}`, detail: str(to.utm_campaign), tone: null }
    }
    case 'referral_attached': return { ...base, label: 'Code partenaire rattache', detail: [str(to.code), str(to.partner)].filter(Boolean).join(' - ') || null, tone: null }
    case 'referral_due': {
      const bonus = num(data.bonus_eur)
      return { ...base, label: 'Bonus partenaire a payer', detail: [str(data.partner), bonus !== null ? `${bonus} EUR` : null].filter(Boolean).join(' - ') || null, tone: 'warn' }
    }
    case 'referral_cancelled': return { ...base, label: 'Bonus partenaire annule', detail: 'dossier refuse ou annule', tone: 'neutral' }
    case 'referral_bonus_recomputed': return { ...base, label: 'Bonus partenaire recalcule', detail: `${num(from.referral_bonus_eur) ?? 'aucun'} EUR -> ${num(to.referral_bonus_eur) ?? 'aucun'} EUR`, tone: null }
    case 'referral_payout_status_change': return { ...base, label: `Bonus partenaire : ${payout(to.referral_payout_status)}`, detail: `${payout(from.referral_payout_status)} -> ${payout(to.referral_payout_status)}`, tone: null }
    case 'referral_payout_paid_at_change': return { ...base, label: 'Date de paiement du bonus', detail: `${date(from.referral_payout_paid_at)} -> ${date(to.referral_payout_paid_at)}`, tone: null }
    case 'referral_payout_method_change': return { ...base, label: 'Methode de paiement du bonus', detail: `${method(from.referral_payout_method)} -> ${method(to.referral_payout_method)}`, tone: null }
    case 'email_corrected': return { ...base, label: 'Email du candidat corrige', detail: [str(from.email), str(to.email)].every(Boolean) ? `${str(from.email)} -> ${str(to.email)}` : null, tone: null }
    case 'fee_paid_change': return { ...base, label: 'Frais d\'inscription (archive)', detail: null, tone: null }
    default: {
      const words = e.event.replace(/[_-]+/g, ' ').trim()
      return { ...base, label: words.charAt(0).toUpperCase() + words.slice(1), detail: null, tone: null }
    }
  }
}
