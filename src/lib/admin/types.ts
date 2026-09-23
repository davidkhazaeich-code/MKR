import type { Status } from '@/lib/admin-transitions'
export type { Status }
export type TunnelType = 'session' | 'custom' | 'famille' | 'groupe'
export type CampDiscipline = 'lutte' | 'mma' | 'combo_quote'
export type PaymentMethod = 'virement' | 'cash' | 'autre'
export type Lang = 'fr' | 'en'
export type Tone = 'danger' | 'warn' | 'info' | 'ok' | 'violet' | 'neutral'
export interface CandidateLite { prenom: string; nom: string; email: string; telephone: string | null; pays: string | null }
export interface DossierRow {
  id: string; created_at: string; status_changed_at: string; tunnel_type: TunnelType
  session_id: string | null; duree_semaines: number | null; date_debut_souhaitee: string | null
  camp_discipline: CampDiscipline | null; status: Status
  package_amount_cents: number | null; package_paid_at: string | null
  payment_method: PaymentMethod | null; payment_date: string | null; notes_admin: string | null
  referral_code: string | null; referral_code_valid: boolean | null; referral_partner_name: string | null
  referral_partner_type: string | null; referral_bonus_eur: number | null; referral_payout_status: string | null
  submission_language: Lang | null; attribution_source: string | null
  visio_booked_at: string | null; visio_starts_at: string | null; visio_booking_uid: string | null
  visio_reminder_sent_at: string | null; visio_reminder_count: number | null
  rebooking_sent_at: string | null; rebooking_sent_count: number | null
  contract_sent_at: string | null; contract_payment_deadline: string | null
  contract_start_date: string | null; contract_end_date: string | null
  candidate: CandidateLite | null
}
